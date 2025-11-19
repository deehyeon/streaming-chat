package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"stomp-load-test/metrics"
	"stomp-load-test/reports"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Stage struct {
	workers  int
	name     string
	duration int
}

// 스테이지 설정
var (
	stages = []Stage{
		{300, "초기 부하", 10},
		{300, "피크 부하", 10},
		{300, "최종 부하", 10},
	}
)

// 전역 변수
var (
	// 환경변수에서 읽어오거나 기본값 사용
	token = getEnvOrDefault("JWT_TOKEN", "")
	url   = getEnvOrDefault("TARGET_URL", "localhost:8080")

	// 동시성 안전한 데이터 수집
	resultsMutex             sync.Mutex
	webSocketConnectTimeList []float64
	stompConnectTimeList     []float64
	messageLatencyList       []float64

	// atomic 카운터
	sendMessageCount    atomic.Int64
	receiveMessageCount atomic.Int64
	errorCount          atomic.Int64
	successCount        atomic.Int64
	activeConnections   atomic.Int64
)

// 환경변수 읽기 헬퍼 함수
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Prometheus metrics HTTP server
func startMetricsServer(port string) {
	http.Handle("/metrics", promhttp.Handler())
	go func() {
		log.Printf("Prometheus metrics server started on :%s\n", port)
		if err := http.ListenAndServe(":"+port, nil); err != nil {
			log.Printf("Metrics server error: %v\n", err)
		}
	}()
}

// WebSocket 연결
func connectWebSocket(id int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
	}
	header := http.Header{}
	header.Add("Origin", "http://"+url)
	header.Add("Authorization", "Bearer "+token)

	conn, _, err := dialer.Dial("ws://"+url+"/ws-stomp", header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %v", err)
	}

	return conn, nil
}

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	done := make(chan struct{}) // 채널로 변경하여 data race 해결

	// 활성 연결 수 증가
	activeConnections.Add(1)
	metrics.ActiveConnections.Inc()
	defer func() {
		activeConnections.Add(-1)
		metrics.ActiveConnections.Dec()
	}()

	// WebSocket 연결 시작
	webSocketStart := time.Now().UnixNano()
	conn, err := connectWebSocket(id)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	defer conn.Close()

	webSocketEnd := time.Now().UnixNano()
	webSocketConnectTime := float64(webSocketEnd-webSocketStart) / 1e6
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	// STOMP Connect Frame 전송
	connectFrame := fmt.Sprintf("CONNECT\nAuthorization:Bearer %s\naccept-version:1.2,1.1,1.0\nheart-beat:2000,2000\n\n\u0000", token)

	stompConnectStart := time.Now().UnixNano()
	err = conn.WriteMessage(websocket.TextMessage, []byte(connectFrame))
	if err != nil {
		log.Printf("Worker %d STOMP CONNECT 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// CONNECTED 프레임 수신 대기
	_, _, err = conn.ReadMessage()
	if err != nil {
		log.Printf("Worker %d STOMP CONNECTED 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	stompConnectEnd := time.Now().UnixNano()
	stompConnectTime := float64(stompConnectEnd-stompConnectStart) / 1e6
	metrics.StompConnectTime.Observe(stompConnectTime)

	// 구독 메시지 전송
	subscribeFrame := "SUBSCRIBE\nid:sub-1\ndestination:/exchange/chat.exchange/chat.room.3e53eb09-7f4f-4e45-a31b-61ea8556d3b3\n\n\u0000"
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeFrame))
	if err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 구독 응답 대기
	_, _, err = conn.ReadMessage()
	if err != nil {
		log.Printf("Worker %d 구독 응답 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 메시지 수신을 위한 고루틴
	go func() {
		defer close(done) // 종료 시 채널 닫기
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Worker %d 메시지 수신 오류: %v\n", id, err)
				errorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				return
			}

			messageStr := string(message)
			if strings.HasPrefix(messageStr, "MESSAGE") {
				lines := strings.Split(messageStr, "\n")
				if len(lines) < 13 {
					continue
				}
				jsonStr := strings.TrimSpace(strings.Trim(lines[12], "\x00"))

				var jsonData struct {
					Message string `json:"message"`
				}
				if err := json.Unmarshal([]byte(jsonStr), &jsonData); err != nil {
					continue
				}
				parts := strings.Split(jsonData.Message, "-")
				if len(parts) < 2 {
					continue
				}

				if strings.TrimSpace(parts[0]) == fmt.Sprintf("Worker %d", id) {
					timestamp := strings.TrimSpace(parts[1])
					receivedTime, err := strconv.ParseInt(timestamp, 10, 64)
					if err != nil {
						errorCount.Add(1)
						metrics.ErrorsTotal.Inc()
						return
					}
					currentTime := time.Now().UnixNano()
					latency := float64(currentTime-receivedTime) / 1e6 // ms로 변환

					// Prometheus 메트릭 업데이트
					metrics.MessageLatency.Observe(latency)
					metrics.MessageLatencySummary.Observe(latency)
					metrics.MessagesReceived.Inc()

					// 동시성 안전한 데이터 추가
					resultsMutex.Lock()
					messageLatencyList = append(messageLatencyList, latency)
					webSocketConnectTimeList = append(webSocketConnectTimeList, webSocketConnectTime)
					stompConnectTimeList = append(stompConnectTimeList, stompConnectTime)
					resultsMutex.Unlock()

					receiveMessageCount.Add(1)
					successCount.Add(1)
					metrics.SuccessTotal.Inc()
					return
				}
			}
		}
	}()

	// 채팅 메시지 전송
	currentTimeMs := time.Now().UnixNano()
	message := fmt.Sprintf("Worker %d - %d", id, currentTimeMs)
	sendFrame := fmt.Sprintf("SEND\ndestination:/pub/chat.message.3e53eb09-7f4f-4e45-a31b-61ea8556d3b3\n\n{\"message\":\"%s\"}\u0000", message)

	err = conn.WriteMessage(websocket.TextMessage, []byte(sendFrame))
	if err != nil {
		log.Printf("Worker %d 메시지 전송 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	sendMessageCount.Add(1)
	metrics.MessagesSent.Inc()

	// 메시지 수신 대기 (최대 30초) - 채널 기반으로 변경
	select {
	case <-done:
		// 정상 완료
		return
	case <-time.After(30 * time.Second):
		log.Printf("Worker %d 타임아웃\n", id)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
}

func main() {
	// JWT 토큰 확인
	if token == "" {
		log.Fatal("❌ JWT_TOKEN 환경변수가 설정되지 않았습니다.\n사용법: export JWT_TOKEN=your-token-here")
	}

	// Prometheus 메트릭 서버 시작
	startMetricsServer("2112")

	// 로그 파일 설정
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		log.SetOutput(logFile)
		defer logFile.Close()
	}

	var wg sync.WaitGroup
	totalWorkers := 0
	for _, stage := range stages {
		totalWorkers += stage.workers
	}

	// Total workers 메트릭 설정
	metrics.TotalWorkers.Add(float64(totalWorkers))

	currentWorker := 1
	testStartTime := time.Now()

	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║        STOMP 채팅 서버 부하 테스트 시작                    ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", url)
	fmt.Printf("총 워커: \033[1;33m%d명\033[0m\n", totalWorkers)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(stages))
	fmt.Printf("\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")

	for stageIdx, stage := range stages {
		startTime := time.Now()
		stageDuration := time.Duration(stage.duration) * time.Second
		interval := stageDuration / time.Duration(stage.workers)

		// Current stage 메트릭 업데이트
		metrics.CurrentStage.Set(float64(stageIdx + 1))

		fmt.Printf("\033[1;34m┌─ Stage %d: %s (%d 워커, %d초) ─┐\033[0m\n",
			stageIdx+1, stage.name, stage.workers, stage.duration)

		for i := 0; i < stage.workers; i++ {
			wg.Add(1)
			go worker(currentWorker, &wg)
			currentWorker++

			elapsedTime := time.Since(startTime)
			if elapsedTime < stageDuration {
				time.Sleep(interval)
			}

			// 진행상황 출력 - panic 방지
			step := stage.workers / 10
			if step == 0 {
				step = 1
			}
			if (i+1)%step == 0 || i == stage.workers-1 {
				progress := float64(i+1) / float64(stage.workers) * 100
				fmt.Printf("\r\033[90m  진행: [%-50s] %.0f%% (%d/%d) | 활성: %d | 성공: %d | 오류: %d\033[0m",
					strings.Repeat("█", int(progress/2)),
					progress,
					i+1,
					stage.workers,
					activeConnections.Load(),
					successCount.Load(),
					errorCount.Load())
			}
		}
		fmt.Printf("\n\033[1;34m└─ Stage %d 완료 (소요시간: %v) ─┘\033[0m\n\n",
			stageIdx+1, time.Since(startTime).Round(time.Millisecond))

		// 각 스테이지 사이에 잠시 대기
		if stageIdx < len(stages)-1 {
			time.Sleep(time.Second)
		}
	}

	fmt.Printf("\n\033[1;32m✓ 모든 워커 생성 완료\033[0m\n")
	fmt.Printf("\033[90m워커 종료 대기 중...\033[0m\n\n")

	wg.Wait()

	testDuration := time.Since(testStartTime)

	// 리포트 생성
	reports.MakeReport(
		totalWorkers,
		messageLatencyList,
		webSocketConnectTimeList,
		stompConnectTimeList,
		&sendMessageCount,
		&receiveMessageCount,
		&errorCount,
		&successCount,
		testDuration,
	)

	fmt.Printf("\n\033[1;36m테스트 완료! 결과가 'load_test_result.csv' 파일에 저장되었습니다.\033[0m\n")
	fmt.Printf("\033[1;36mPrometheus 메트릭은 계속 http://localhost:2112/metrics 에서 확인 가능합니다.\033[0m\n\n")

	// 프로그램 종료 방지 (메트릭 서버 유지)
	fmt.Printf("\033[90m메트릭 서버를 종료하려면 Ctrl+C를 누르세요...\033[0m\n")
	select {}
}
