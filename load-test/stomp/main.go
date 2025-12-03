package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"stomp-load-test/auth"
	"stomp-load-test/config"
	"stomp-load-test/metrics"
	"stomp-load-test/reports"
	"stomp-load-test/worker"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// 워커들이 공유하는 메트릭/통계 데이터
	sharedData = worker.NewSharedData()

	// graceful shutdown을 위한 context
	mainCtx    context.Context
	mainCancel context.CancelFunc
)

// startMetricsServer starts Prometheus metrics HTTP server
func startMetricsServer(port string) {
	http.Handle("/metrics", promhttp.Handler())
	go func() {
		log.Printf("Prometheus metrics server started on :%s\n", port)
		if err := http.ListenAndServe(":"+port, nil); err != nil {
			log.Printf("Metrics server error: %v\n", err)
		}
	}()
}

// setupLogging configures logging to file
// setupLogging configures logging to file and console
func setupLogging() {
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Printf("로그 파일 생성 실패: %v\n", err)
		return
	}

	// 파일과 콘솔 둘 다 출력
	multiWriter := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(multiWriter)
}

// generateEmail generates email from memberId with zero-padding
func generateEmail(memberId int64) string {
	return fmt.Sprintf("user%05d@test.com", memberId)
}

// cloneConfig creates a copy of base config for each worker
func cloneConfig(base *config.Config) *config.Config {
	return &config.Config{
		ServerURL:            base.ServerURL,
		MessageInterval:      base.MessageInterval,
		HTTPClient:           base.HTTPClient,
		EnableReconnect:      base.EnableReconnect,
		MaxReconnectAttempts: base.MaxReconnectAttempts,
		InitialBackoffMs:     base.InitialBackoffMs,
		MaxBackoffMs:         base.MaxBackoffMs,
		// Token, MyMemberId, RoomID는 워커별로 설정
	}
}

// initializeWorker initializes a single worker with its own credentials
func initializeWorker(baseConfig *config.Config, memberId int64, password string, roomID int64) (*config.Config, error) {
	workerConfig := cloneConfig(baseConfig)

	email := generateEmail(memberId)

	// 워커별 로그인
	accessToken, returnedMemberId, err := auth.AutoLogin(workerConfig, email, password)
	if err != nil {
		return nil, fmt.Errorf("로그인 실패 (email=%s): %w", email, err)
	}

	if returnedMemberId != memberId {
		log.Printf("⚠️ Worker memberId 불일치: 예상=%d, 실제=%d\n", memberId, returnedMemberId)
	}

	workerConfig.SetToken(accessToken)
	workerConfig.SetMyMemberId(returnedMemberId)
	workerConfig.SetRoomID(roomID)

	return workerConfig, nil
}

// printTestHeader prints the test header
func printTestHeader(baseConfig *config.Config, startMemberId int64, totalWorkers int) {
	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║    STOMP 채팅 서버 부하 테스트 v3.0 (Multi-User)          ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", baseConfig.ServerURL)
	fmt.Printf("사용자 범위: \033[1;33m%d ~ %d\033[0m\n", startMemberId, startMemberId+int64(totalWorkers)-1)
	fmt.Printf("이메일 형식: \033[1;33m%s ~ %s\033[0m\n",
		generateEmail(startMemberId),
		generateEmail(startMemberId+int64(totalWorkers)-1))
	fmt.Printf("메시지 전송 간격: \033[1;33m%v\033[0m\n", baseConfig.MessageInterval)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(config.Stages))

	if baseConfig.EnableReconnect {
		fmt.Printf("재연결: \033[1;32m활성화\033[0m (최대 %d회 시도)\n", baseConfig.MaxReconnectAttempts)
	} else {
		fmt.Printf("재연결: \033[1;31m비활성화\033[0m\n")
	}

	fmt.Printf("\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")
}

// runStage runs a single test stage
func runStage(stageIdx int, stage config.Stage, baseConfig *config.Config, startMemberId int64, password string, roomID int64, cumulativeOffset int) {
	stageDuration := time.Duration(stage.Duration) * time.Second
	rampUpDuration := 10 * time.Second
	if stageDuration < rampUpDuration {
		rampUpDuration = stageDuration / 2
	}

	var interval time.Duration
	if stage.Workers > 0 {
		interval = rampUpDuration / time.Duration(stage.Workers)
		if interval < 10*time.Millisecond {
			interval = 10 * time.Millisecond
		}
	}

	metrics.CurrentStage.Set(float64(stageIdx + 1))

	fmt.Printf("\033[1;34m┌─ Stage %d: %s (%d 사용자, %d초 유지) ─┐\033[0m\n",
		stageIdx+1, stage.Name, stage.Workers, stage.Duration)
	fmt.Printf("\033[90m  사용자 범위: %s ~ %s\033[0m\n",
		generateEmail(startMemberId+int64(cumulativeOffset)),
		generateEmail(startMemberId+int64(cumulativeOffset+stage.Workers-1)))

	stageCtx, stageCancel := context.WithTimeout(mainCtx, stageDuration)
	defer stageCancel()

	var wg sync.WaitGroup
	stageStartTime := time.Now()

	stopEarly := false

WORKER_LOOP:
	for i := 0; i < stage.Workers; i++ {
		select {
		case <-mainCtx.Done():
			stopEarly = true
			break WORKER_LOOP
		default:
		}

		wg.Add(1)
		workerID := stageIdx*100000 + i + 1
		memberId := startMemberId + int64(cumulativeOffset+i) // 누적 오프셋 사용

		go func(wID int, mID int64) {
			// worker.Run 내부에서 defer wg.Done()을 호출하므로 여기서는 호출하지 않음

			// 워커별로 독립적인 Config 생성 및 로그인
			workerConfig, err := initializeWorker(baseConfig, mID, password, roomID)
			if err != nil {
				log.Printf("❌ Worker %d (memberId=%d, email=%s) 초기화 실패: %v\n",
					wID, mID, generateEmail(mID), err)
				sharedData.ErrorCount.Add(1)
				wg.Done() // 에러로 worker.Run을 호출하지 못하면 여기서 Done()
				return
			}

			// 워커 실행 (내부에서 defer wg.Done() 호출함)
			worker.Run(wID, &wg, workerConfig, sharedData, stageCtx)

		}(workerID, memberId)

		// 로그인 요청 분산
		if time.Since(stageStartTime) < rampUpDuration {
			time.Sleep(interval)
		}

		// 진행상황 출력
		step := stage.Workers / 20
		if step == 0 {
			step = 1
		}

		if (i+1)%step == 0 || i == stage.Workers-1 {
			progress := float64(i+1) / float64(stage.Workers) * 100
			fmt.Printf(
				"\r\033[90m  생성: [%-50s] %.0f%% (%d/%d) | 활성: %d | 전송: %d | 수신: %d | 오류: %d\033[0m",
				strings.Repeat("█", int(progress/2)),
				progress,
				i+1,
				stage.Workers,
				sharedData.ActiveConnections.Load(),
				sharedData.SendMessageCount.Load(),
				sharedData.ReceiveMessageCount.Load(),
				sharedData.ErrorCount.Load(),
			)
		}
	}

	if stopEarly {
		fmt.Printf("\n\033[90m  워커 종료 대기 중...\033[0m\n")
		wg.Wait()
		fmt.Printf("\033[1;34m└─ Stage %d 완료 (총 소요: %v) ─┘\033[0m\n\n",
			stageIdx+1, time.Since(stageStartTime).Round(time.Millisecond))
		return
	}

	fmt.Printf("\n\033[1;32m  ✓ %d 사용자 생성 완료 (소요: %v)\033[0m\n",
		stage.Workers, time.Since(stageStartTime).Round(time.Millisecond))

	// 상태 모니터링
	monitorTicker := time.NewTicker(5 * time.Second)
	go func() {
		for {
			select {
			case <-stageCtx.Done():
				monitorTicker.Stop()
				return
			case <-monitorTicker.C:
				fmt.Printf(
					"\r\033[90m  유지중: 활성=%d | 전송=%d | 수신=%d | 오류=%d | 경과=%v\033[0m\n",
					sharedData.ActiveConnections.Load(),
					sharedData.SendMessageCount.Load(),
					sharedData.ReceiveMessageCount.Load(),
					sharedData.ErrorCount.Load(),
					time.Since(stageStartTime).Round(time.Second),
				)
			}
		}
	}()

	<-stageCtx.Done()

	fmt.Printf("\033[90m  워커 종료 대기 중...\033[0m\n")
	wg.Wait()

	fmt.Printf("\033[1;34m└─ Stage %d 완료 (총 소요: %v) ─┘\033[0m\n\n",
		stageIdx+1, time.Since(stageStartTime).Round(time.Millisecond))
}

func main() {
	// Context 설정
	mainCtx, mainCancel = context.WithCancel(context.Background())
	defer mainCancel()

	// 시그널 핸들링
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigChan
		fmt.Printf("\n\033[1;33m종료 신호 수신, graceful shutdown 시작...\033[0m\n")
		mainCancel()
	}()

	// 기본 설정 로드
	baseConfig, err := config.Load()
	if err != nil {
		log.Fatalf("설정 로드 실패: %v", err)
	}

	// 환경 변수에서 설정 읽기
	startMemberId := int64(1)
	if val := os.Getenv("START_MEMBER_ID"); val != "" {
		fmt.Sscanf(val, "%d", &startMemberId)
	}

	password := os.Getenv("PASSWORD")
	if password == "" {
		password = "password123" // 기본값
		log.Println("⚠️ PASSWORD 환경변수 미설정, 기본값 사용: password123")
	}

	// 채팅방 ID 설정
	roomID := int64(1)
	if val := os.Getenv("ROOM_ID"); val != "" {
		fmt.Sscanf(val, "%d", &roomID)
	}

	// 최대 사용자 수 설정
	maxUsers := int64(10000)
	if val := os.Getenv("MAX_USERS"); val != "" {
		fmt.Sscanf(val, "%d", &maxUsers)
	}

	// Pending 메시지 정리
	go worker.CleanupPendingMessages(mainCtx, sharedData.PendingMessages, 30*time.Second)

	// Prometheus 메트릭 서버
	startMetricsServer("2112")

	// 로깅 설정
	setupLogging()

	// 총 워커 수 계산 (실제 사용 가능한 수로 제한)
	totalWorkers := 0
	for _, stage := range config.Stages {
		if int64(totalWorkers+stage.Workers) > maxUsers {
			totalWorkers = int(maxUsers)
			break
		}
		totalWorkers += stage.Workers
	}

	// 실제로는 maxUsers까지만 사용
	if int64(totalWorkers) > maxUsers {
		totalWorkers = int(maxUsers)
	}

	// 테스트 헤더 출력
	printTestHeader(baseConfig, startMemberId, int(maxUsers))

	testStartTime := time.Now()

	// 스테이지별 테스트 실행 (사용자 재사용 방식)
	for stageIdx, stage := range config.Stages {
		select {
		case <-mainCtx.Done():
			fmt.Printf("\033[1;33m테스트 중단됨\033[0m\n")
			goto END_TEST
		default:
		}

		// 각 Stage는 user00001부터 재사용
		actualWorkers := stage.Workers
		if int64(actualWorkers) > maxUsers {
			actualWorkers = int(maxUsers)
			fmt.Printf("\033[1;33m⚠️ Stage %d 워커 수 조정: %d → %d (최대 사용자 수 제한)\033[0m\n",
				stageIdx+1, stage.Workers, actualWorkers)
		}

		adjustedStage := config.Stage{
			Workers:  actualWorkers,
			Name:     stage.Name,
			Duration: stage.Duration,
		}

		runStage(stageIdx, adjustedStage, baseConfig, startMemberId, password, roomID, 0) // 👈 항상 0부터 시작

		if stageIdx < len(config.Stages)-1 {
			fmt.Printf("\033[90m  다음 스테이지 준비 중... (3초)\033[0m\n\n")
			time.Sleep(3 * time.Second)
		}
	}

END_TEST:
	testDuration := time.Since(testStartTime)

	metrics.TotalWorkers.Add(float64(totalWorkers))

	reports.MakeReport(
		totalWorkers,
		sharedData.MessageLatencyList,
		sharedData.WebSocketConnectTimeList,
		sharedData.StompConnectTimeList,
		sharedData.SendMessageCount,
		sharedData.ReceiveMessageCount,
		sharedData.ErrorCount,
		sharedData.SuccessCount,
		testDuration,
	)

	fmt.Printf("\n\033[1;36m테스트 완료! 결과가 'load_test_result.csv' 파일에 저장되었습니다.\033[0m\n")
	fmt.Printf("\033[1;36mPrometheus 메트릭은 계속 http://localhost:2112/metrics 에서 확인 가능합니다.\033[0m\n\n")

	fmt.Printf("\033[90m메트릭 확인을 위해 10초간 대기합니다... (Ctrl+C로 즉시 종료 가능)\033[0m\n")
	select {
	case <-time.After(10 * time.Second):
		fmt.Printf("\033[1;32m정상 종료\033[0m\n")
	case <-mainCtx.Done():
		fmt.Printf("\033[1;33m종료됨\033[0m\n")
	}
}
