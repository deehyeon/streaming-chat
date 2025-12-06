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
	sharedData = worker.NewSharedData()
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

// setupLogging configures logging to file and console
func setupLogging() {
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Printf("로그 파일 생성 실패: %v\n", err)
		return
	}

	multiWriter := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(multiWriter)
}

// generateEmail generates email from memberId with zero-padding
func generateEmail(memberId int64) string {
	return fmt.Sprintf("user%05d@test.com", memberId)
}

// cloneConfig creates a copy of base config
func cloneConfig(base *config.Config) *config.Config {
	return &config.Config{
		ServerURL:            base.ServerURL,
		APIBaseURL:           base.APIBaseURL,
		MessageInterval:      base.MessageInterval,
		HTTPClient:           base.HTTPClient,
		EnableReconnect:      base.EnableReconnect,
		MaxReconnectAttempts: base.MaxReconnectAttempts,
		InitialBackoffMs:     base.InitialBackoffMs,
		MaxBackoffMs:         base.MaxBackoffMs,
	}
}

// initializeUser initializes a single user with credentials
func initializeUser(baseConfig *config.Config, memberId int64, password string, roomID int64) (*config.Config, error) {
	userConfig := cloneConfig(baseConfig)
	email := generateEmail(memberId)

	accessToken, returnedMemberId, err := auth.AutoLogin(userConfig, email, password)
	if err != nil {
		return nil, fmt.Errorf("로그인 실패 (email=%s): %w", email, err)
	}

	if returnedMemberId != memberId {
		log.Printf("⚠️ MemberId 불일치: 예상=%d, 실제=%d\n", memberId, returnedMemberId)
	}

	userConfig.SetToken(accessToken)
	userConfig.SetMyMemberId(returnedMemberId)
	userConfig.SetRoomID(roomID)

	return userConfig, nil
}

// main.go - initializeUserPool 수정
func initializeUserPool(baseConfig *config.Config, startMemberId int64, maxUsers int, password string, maxMembersPerRoom int) ([]*config.Config, error) {
	fmt.Printf("\n\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n")

	// 필요한 방 개수 계산
	numRooms := (maxUsers + maxMembersPerRoom - 1) / maxMembersPerRoom
	fmt.Printf("\033[1;36m  사용자 풀 초기화 중... (%d명, %d개 방, 방당 최대 %d명)\033[0m\n",
		maxUsers, numRooms, maxMembersPerRoom)
	fmt.Printf("\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n\n")

	userPool := make([]*config.Config, maxUsers)
	startTime := time.Now()

	var wg sync.WaitGroup
	errChan := make(chan error, maxUsers)
	semaphore := make(chan struct{}, 50)

	for i := 0; i < maxUsers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			memberId := startMemberId + int64(idx)

			// ⚠️ 방 ID 계산: maxMembersPerRoom명씩 나눠서 방 할당
			roomID := int64((idx / maxMembersPerRoom) + 1)

			userConfig, err := initializeUser(baseConfig, memberId, password, roomID)
			if err != nil {
				errChan <- fmt.Errorf("user %d 초기화 실패: %w", memberId, err)
				return
			}
			userPool[idx] = userConfig

			// 진행상황 출력
			if (idx+1)%100 == 0 || idx == maxUsers-1 {
				progress := float64(idx+1) / float64(maxUsers) * 100
				currentRoom := roomID
				membersInCurrentRoom := (idx % maxMembersPerRoom) + 1

				fmt.Printf("\r\033[90m  진행: [%-50s] %.1f%% (%d/%d) - 방 %d (%d명)\033[0m",
					strings.Repeat("█", int(progress/2)),
					progress,
					idx+1,
					maxUsers,
					currentRoom,
					membersInCurrentRoom,
				)
			}
		}(i)
	}

	wg.Wait()
	close(errChan)

	if len(errChan) > 0 {
		return nil, <-errChan
	}

	fmt.Printf("\n\033[1;32m  ✓ 사용자 풀 초기화 완료 (소요: %v)\033[0m\n", time.Since(startTime).Round(time.Millisecond))
	fmt.Printf("\033[1;32m  ✓ %d개 방 × 최대 %d명 = %d명 배치 완료\033[0m\n\n",
		numRooms, maxMembersPerRoom, maxUsers)

	return userPool, nil
}

func printTestHeader(baseConfig *config.Config, startMemberId int64, maxUsers int, maxMembersPerRoom int) {
	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║    STOMP 채팅 서버 부하 테스트 v4.0 (10K Concurrent Users)   ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", baseConfig.ServerURL)
	fmt.Printf("사용자 풀: \033[1;33m%d명\033[0m (%s ~ %s)\n",
		maxUsers,
		generateEmail(startMemberId),
		generateEmail(startMemberId+int64(maxUsers)-1))

	// ⚠️ 방 구조 정보 수정
	numRooms := (maxUsers + maxMembersPerRoom - 1) / maxMembersPerRoom
	fmt.Printf("채팅방 구조: \033[1;33m%d개 방\033[0m (각 방 최대 %d명)\n", numRooms, maxMembersPerRoom)

	// 각 방의 인원 분포 표시
	fullRooms := maxUsers / maxMembersPerRoom
	lastRoomMembers := maxUsers % maxMembersPerRoom

	if fullRooms > 0 {
		fmt.Printf("  • 방 1~%d: 각 %d명\n", fullRooms, maxMembersPerRoom)
	}
	if lastRoomMembers > 0 {
		fmt.Printf("  • 방 %d: %d명\n", numRooms, lastRoomMembers)
	}

	fmt.Printf("메시지 패턴:\n")
	fmt.Printf("  \033[1;32m• Active (10%%)\033[0m:   %d명 - 메시지 간격 %v\n", maxUsers/10, baseConfig.MessageInterval)
	fmt.Printf("  \033[1;33m• Moderate (30%%)\033[0m: %d명 - 메시지 간격 %v\n", maxUsers*3/10, baseConfig.MessageInterval*3)
	fmt.Printf("  \033[1;34m• Passive (60%%)\033[0m:  %d명 - 메시지 간격 %v\n", maxUsers*6/10, baseConfig.MessageInterval*10)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(config.Stages))

	if baseConfig.EnableReconnect {
		fmt.Printf("재연결: \033[1;32m활성화\033[0m (최대 %d회 시도)\n", baseConfig.MaxReconnectAttempts)
	} else {
		fmt.Printf("재연결: \033[1;31m비활성화\033[0m\n")
	}

	fmt.Printf("\n\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")
}

// runStageWithPool runs a stage using pre-initialized user pool
func runStageWithPool(stageIdx int, stage config.Stage, userPool []*config.Config, shared *worker.SharedData, parentCtx context.Context) {
	if stage.Workers > len(userPool) {
		stage.Workers = len(userPool)
	}

	stageDuration := time.Duration(stage.Duration) * time.Second
	rampUpDuration := 10 * time.Second
	if stageDuration < rampUpDuration {
		rampUpDuration = stageDuration / 2
	}

	interval := rampUpDuration / time.Duration(stage.Workers)
	if interval < 10*time.Millisecond {
		interval = 10 * time.Millisecond
	}

	stageCtx, stageCancel := context.WithTimeout(parentCtx, stageDuration)
	defer stageCancel()

	var wg sync.WaitGroup

	fmt.Printf("\033[1;34m┌─ Stage %d 시작: %s (%d명, %d초 유지) ─┐\033[0m\n",
		stageIdx+1, stage.Name, stage.Workers, stage.Duration)

	for i := 0; i < stage.Workers; i++ {
		select {
		case <-parentCtx.Done():
			goto END
		default:
		}

		wg.Add(1)
		go worker.Run(i+1, &wg, userPool[i], shared, stageCtx)

		time.Sleep(interval)

		progress := float64(i+1) / float64(stage.Workers) * 100
		fmt.Printf("\r  생성: [%-50s] %.0f%% (%d/%d)",
			strings.Repeat("█", int(progress/2)),
			progress,
			i+1,
			stage.Workers,
		)
	}

	fmt.Println("\n  모든 사용자 접속 완료. 스테이지 유지 중...")

	<-stageCtx.Done()

END:
	fmt.Println("\n  연결 종료 중...")
	wg.Wait()
	fmt.Printf("└─ Stage %d 완료 ─┘\n\n", stageIdx+1)
}

// main.go 수정
func main() {
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
	baseConfig, err := config.Load()
	if err != nil {
		log.Fatalf("설정 로드 실패: %v", err)
	}

	// 환경 변수
	startMemberId := int64(1)
	if val := os.Getenv("START_MEMBER_ID"); val != "" {
		fmt.Sscanf(val, "%d", &startMemberId)
	}

	password := os.Getenv("PASSWORD")
	if password == "" {
		password = "password123"
		log.Println("⚠️ PASSWORD 환경변수 미설정, 기본값 사용: password123")
	}

	maxMembersPerRoom := 100
	if val := os.Getenv("MAX_MEMBERS_PER_ROOM"); val != "" {
		fmt.Sscanf(val, "%d", &maxMembersPerRoom)
	}

	// Stage 중 최대 워커 수 계산
	maxUsers := 0
	for _, stage := range config.Stages {
		if stage.Workers > maxUsers {
			maxUsers = stage.Workers
		}
	}

	// 환경 변수로 오버라이드 가능
	if val := os.Getenv("MAX_USERS"); val != "" {
		envMaxUsers := 0
		fmt.Sscanf(val, "%d", &envMaxUsers)
		if envMaxUsers > maxUsers {
			maxUsers = envMaxUsers
		}
	}

	log.Printf("📊 필요한 최대 사용자 수: %d명\n", maxUsers)

	// Pending 메시지 정리
	go worker.CleanupPendingMessages(mainCtx, sharedData.PendingMessages, 30*time.Second)

	// Prometheus 메트릭 서버
	startMetricsServer("2112")

	// 로깅 설정
	setupLogging()

	// 테스트 헤더 출력
	printTestHeader(baseConfig, startMemberId, maxUsers, maxMembersPerRoom)

	// ⚠️ roomID 파라미터 제거
	userPool, err := initializeUserPool(baseConfig, startMemberId, maxUsers, password, maxMembersPerRoom)
	if err != nil {
		log.Fatalf("사용자 풀 초기화 실패: %v", err)
	}

	fmt.Printf("\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n")
	fmt.Printf("\033[1;36m  부하 테스트 시작\033[0m\n")
	fmt.Printf("\033[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n\n")

	testStartTime := time.Now()

	// Stage별 테스트 실행
	for stageIdx, stage := range config.Stages {
		select {
		case <-mainCtx.Done():
			fmt.Printf("\033[1;33m테스트 중단됨\033[0m\n")
			goto END_TEST
		default:
		}

		runStageWithPool(stageIdx, stage, userPool, sharedData, mainCtx)

		if stageIdx < len(config.Stages)-1 {
			fmt.Printf("\033[90m  다음 스테이지 준비 중... (5초)\033[0m\n\n")
			time.Sleep(5 * time.Second)
		}
	}

END_TEST:
	testDuration := time.Since(testStartTime)

	metrics.TotalWorkers.Add(float64(maxUsers))

	reports.MakeReport(
		maxUsers,
		sharedData.MessageLatencyList,
		sharedData.WebSocketConnectTimeList,
		sharedData.StompConnectTimeList,
		sharedData.SendMessageCount,
		sharedData.ReceiveMessageCount,
		sharedData.ErrorCount,
		sharedData.SuccessCount,
		testDuration,
	)

	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║                    테스트 완료!                                ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════════╝\033[0m\n\n")
	fmt.Printf("\033[1;32m✓ 결과 저장: load_test_result.csv\033[0m\n")
	fmt.Printf("\033[1;32m✓ Prometheus 메트릭: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m✓ 총 소요 시간: %v\033[0m\n\n", testDuration.Round(time.Second))

	fmt.Printf("\033[90m메트릭 확인을 위해 10초간 대기합니다... (Ctrl+C로 즉시 종료 가능)\033[0m\n")
	select {
	case <-time.After(10 * time.Second):
		fmt.Printf("\033[1;32m정상 종료\033[0m\n")
	case <-mainCtx.Done():
		fmt.Printf("\033[1;33m종료됨\033[0m\n")
	}
}
