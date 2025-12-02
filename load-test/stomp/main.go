package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"stomp-load-test/auth"
	"stomp-load-test/chat"
	"stomp-load-test/config"
	"stomp-load-test/messaging"
	"stomp-load-test/metrics"
	"stomp-load-test/reports"
	"stomp-load-test/worker"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// 동시성 안전한 데이터 수집
	resultsMutex             sync.Mutex
	webSocketConnectTimeList []float64
	stompConnectTimeList     []float64
	messageLatencyList       []float64

	// atomic 카운터
	errorCount             atomic.Int64
	successCount           atomic.Int64
	activeConnectionsCount atomic.Int64 // for display

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
func setupLogging() {
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		log.SetOutput(logFile)
	}
}

// initialize sets up authentication and room
func initialize(cfg *config.Config) error {
	token := os.Getenv("TOKEN")
	var myMemberId int64

	// 인증 처리
	if token == "" {
		email := os.Getenv("EMAIL")
		password := os.Getenv("PASSWORD")

		if email != "" && password != "" {
			log.Println("TOKEN 미설정 → EMAIL/PASSWORD로 자동 로그인 시도")
			accessToken, memberId, err := auth.AutoLogin(cfg, email, password)
			if err != nil {
				return fmt.Errorf("자동 로그인 실패: %w", err)
			}
			token = accessToken
			myMemberId = memberId
			log.Printf("✓ 자동 로그인 성공 (memberId=%d)\n", memberId)
		} else {
			return fmt.Errorf("환경 변수 TOKEN 또는 (EMAIL + PASSWORD)가 필요합니다")
		}
	}

	cfg.SetToken(token)
	cfg.SetMyMemberId(myMemberId)

	// ROOM_ID 처리
	if err := setupChatRoom(cfg, myMemberId); err != nil {
		return err
	}

	return nil
}

// setupChatRoom sets up the chat room for testing
func setupChatRoom(cfg *config.Config, myMemberId int64) error {
	roomIDStr := os.Getenv("ROOM_ID")
	if roomIDStr != "" {
		roomID, err := chat.ParseRoomID(roomIDStr)
		if err != nil {
			return fmt.Errorf("ROOM_ID 파싱 실패: %w", err)
		}
		cfg.SetRoomID(roomID)
		log.Println("✓ 환경 변수 ROOM_ID 사용")
		return nil
	}

	createNewRoom := os.Getenv("CREATE_NEW_ROOM")
	if createNewRoom == "true" {
		log.Println("ROOM_ID 미설정 + CREATE_NEW_ROOM=true → 새 단체 채팅방 생성 시도")
		memberIdsStr := os.Getenv("MEMBER_IDS")
		otherMemberIds := chat.ParseMemberIDs(memberIdsStr, myMemberId)

		roomID, err := chat.CreateGroupChatRoom(cfg, otherMemberIds)
		if err != nil {
			return fmt.Errorf("단체 채팅방 생성 실패: %w", err)
		}
		cfg.SetRoomID(roomID)
		log.Printf("✓ 새 단체 채팅방 생성 완료 (ROOM_ID=%d, OTHER_MEMBERS=%v)\n", roomID, otherMemberIds)
		return nil
	}

	log.Println("ROOM_ID 미설정 → 채팅방 목록 API에서 첫 번째 방 조회 시도")
	roomID, err := chat.FetchRoomIDFromAPI(cfg)
	if err != nil {
		return fmt.Errorf("API를 통한 ROOM_ID 조회 실패: %w", err)
	}
	cfg.SetRoomID(roomID)
	log.Printf("✓ 기존 채팅방 조회 완료 (ROOM_ID=%d)\n", roomID)
	return nil
}

// printTestHeader prints the test header
func printTestHeader(cfg *config.Config) {
	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║    STOMP 채팅 서버 부하 테스트 v3.0 (Refactored)          ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", cfg.ServerURL)
	fmt.Printf("방 ID: \033[1;33m%d\033[0m\n", cfg.RoomID)
	fmt.Printf("메시지 전송 간격: \033[1;33m%v\033[0m\n", cfg.MessageInterval)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(config.Stages))
	
	if cfg.EnableReconnect {
		fmt.Printf("재연결: \033[1;32m활성화\033[0m (최대 %d회 시도)\n", cfg.MaxReconnectAttempts)
	} else {
		fmt.Printf("재연결: \033[1;31m비활성화\033[0m\n")
	}
	
	fmt.Printf("\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")
}

// runStage runs a single test stage
func runStage(stageIdx int, stage config.Stage, cfg *config.Config) {
	stageDuration := time.Duration(stage.Duration) * time.Second
	rampUpDuration := 10 * time.Second
	if stageDuration < rampUpDuration {
		rampUpDuration = stageDuration / 2
	}

	var interval time.Duration
	if stage.Workers > 0 {
		interval = rampUpDuration / time.Duration(stage.Workers)
		if interval < time.Microsecond {
			interval = time.Microsecond
		}
	}

	metrics.CurrentStage.Set(float64(stageIdx + 1))

	fmt.Printf("\033[1;34m┌─ Stage %d: %s (%d 워커, %d초 유지) ─┐\033[0m\n",
		stageIdx+1, stage.Name, stage.Workers, stage.Duration)

	stageCtx, stageCancel := context.WithTimeout(mainCtx, stageDuration)
	defer stageCancel()

	var wg sync.WaitGroup
	stageStartTime := time.Now()

	// 워커 생성 (ramp-up)
	for i := 0; i < stage.Workers; i++ {
		select {
		case <-mainCtx.Done():
			goto WAIT_WORKERS
		default:
		}

		wg.Add(1)
		w := &worker.Worker{
			ID:                       stageIdx*100000 + i + 1,
			Config:                   cfg,
			ErrorCount:               &errorCount,
			SuccessCount:             &successCount,
			MessageLatencyList:       &messageLatencyList,
			WebSocketConnectTimeList: &webSocketConnectTimeList,
			StompConnectTimeList:     &stompConnectTimeList,
			ResultsMutex:             &resultsMutex,
			ActiveConnectionsCount:   &activeConnectionsCount,
		}
		go w.Run(&wg, stageCtx)

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
				activeConnectionsCount.Load(),
				messaging.SendMessageCount.Load(),
				messaging.ReceiveMessageCount.Load(),
				errorCount.Load(),
			)
		}
	}
	
	fmt.Printf("\n\033[1;32m  ✓ %d 워커 생성 완료 (소요: %v)\033[0m\n",
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
					activeConnectionsCount.Load(),
					messaging.SendMessageCount.Load(),
					messaging.ReceiveMessageCount.Load(),
					errorCount.Load(),
					time.Since(stageStartTime).Round(time.Second),
				)
			}
		}
	}()

	<-stageCtx.Done()

WAIT_WORKERS:
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

	// 설정 로드
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("설정 로드 실패: %v", err)
	}

	// 초기화 (인증 및 채팅방 설정)
	if err := initialize(cfg); err != nil {
		log.Fatalf("초기화 실패: %v", err)
	}

	// Pending 메시지 정리 고루틴
	go messaging.CleanupPendingMessages(mainCtx, 30*time.Second)

	// Prometheus 메트릭 서버
	startMetricsServer("2112")

	// 로깅 설정
	setupLogging()

	// 테스트 헤더 출력
	printTestHeader(cfg)

	testStartTime := time.Now()

	// 스테이지별 테스트 실행
	for stageIdx, stage := range config.Stages {
		select {
		case <-mainCtx.Done():
			fmt.Printf("\033[1;33m테스트 중단됨\033[0m\n")
			goto END_TEST
		default:
		}

		runStage(stageIdx, stage, cfg)

		// 스테이지 간 대기
		if stageIdx < len(config.Stages)-1 {
			fmt.Printf("\033[90m  다음 스테이지 준비 중... (3초)\033[0m\n\n")
			time.Sleep(3 * time.Second)
		}
	}

END_TEST:
	testDuration := time.Since(testStartTime)

	// 총 워커 수 계산
	totalWorkers := 0
	for _, stage := range config.Stages {
		totalWorkers += stage.Workers
	}
	metrics.TotalWorkers.Add(float64(totalWorkers))

	// 리포트 생성
	reports.MakeReport(
		totalWorkers,
		messageLatencyList,
		webSocketConnectTimeList,
		stompConnectTimeList,
		&messaging.SendMessageCount,
		&messaging.ReceiveMessageCount,
		&errorCount,
		&successCount,
		testDuration,
	)

	fmt.Printf("\n\033[1;36m테스트 완료! 결과가 'load_test_result.csv' 파일에 저장되었습니다.\033[0m\n")
	fmt.Printf("\033[1;36mPrometheus 메트릭은 계속 http://localhost:2112/metrics 에서 확인 가능합니다.\033[0m\n\n")

	// 메트릭 서버 유지
	fmt.Printf("\033[90m메트릭 확인을 위해 10초간 대기합니다... (Ctrl+C로 즉시 종료 가능)\033[0m\n")
	select {
	case <-time.After(10 * time.Second):
		fmt.Printf("\033[1;32m정상 종료\033[0m\n")
	case <-mainCtx.Done():
		fmt.Printf("\033[1;33m종료됨\033[0m\n")
	}
}
