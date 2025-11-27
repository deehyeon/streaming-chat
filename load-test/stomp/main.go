package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
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
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Stage struct {
	workers  int
	name     string
	duration int // 초 단위: 워커들이 연결을 유지하는 시간
}

// 채팅방 ID 응답 DTO
type ChatRoomIdResponse struct {
	RoomID int64 `json:"roomId"`
}

// ApiResponse<List<ChatRoomIdResponse>> 래퍼
type ChatRoomListApiResponse struct {
	Result string               `json:"result"`
	Data   []ChatRoomIdResponse `json:"data"`
	Error  interface{}          `json:"error"`
}

// 메시지 수신 구조체
type ChatMessage struct {
	RoomId    int64   `json:"roomId"`
	SenderId  int64   `json:"senderId"`
	Type      string  `json:"type"`
	Content   string  `json:"content"`
	FileUrl   *string `json:"fileUrl"`
	FileName  *string `json:"fileName"`
	FileSize  *int64  `json:"fileSize"`
	CreatedAt string  `json:"createdAt"`
}

// 스테이지 설정 - 10,000명 동시 접속 테스트
var (
	stages = []Stage{
		{500, "워밍업", 60},         // 60초 동안 500명 유지
		{2000, "초기 부하", 90},      // 90초 동안 2000명 유지
		{5000, "중간 부하", 120},     // 2분 동안 5000명 유지
		{10000, "피크 부하", 180},    // 3분 동안 10000명 유지
		{5000, "부하 감소", 60},      // 1분 동안 5000명으로 감소
		{1000, "쿨다운", 60},        // 1분 동안 1000명으로 감소
	}
)

// 전역 변수
var (
	token           string
	url             string
	roomID          int64
	messageInterval time.Duration // 메시지 전송 간격

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

	// pending messages: 워커별로 보낸 메시지들의 nonce와 전송시간을 추적
	pendingMessages sync.Map // key: "workerID-nonce", value: time.Time
)

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

// ChatController가 ApiResponse<List<ChatRoomIdResponse>>를 반환한다고 가정하고
// 첫 번째 방의 roomId를 가져오는 함수
func fetchRoomIDFromAPI() (int64, error) {
	if token == "" || url == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + url + "/api/v1/chat/rooms"

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 요청 생성 실패: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return 0, fmt.Errorf("예상치 못한 상태 코드 %d: %s", resp.StatusCode, string(body))
	}

	var apiResp ChatRoomListApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return 0, fmt.Errorf("채팅방 목록 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	if len(apiResp.Data) == 0 {
		return 0, fmt.Errorf("서버에서 반환한 채팅방이 없습니다")
	}

	return apiResp.Data[0].RoomID, nil
}

func init() {
	// .env 파일 로드
	if err := godotenv.Load(); err != nil {
		log.Println(".env 파일을 찾지 못했습니다. (운영 환경일 수 있습니다)")
	}

	// 환경변수 읽기
	token = os.Getenv("TOKEN")
	url = os.Getenv("SERVER_URL")
	roomIDStr := os.Getenv("ROOM_ID")
	messageIntervalStr := os.Getenv("MESSAGE_INTERVAL_MS")

	// 값 검증
	if token == "" {
		log.Fatal("환경 변수 TOKEN 값이 비어 있습니다.")
	}
	if url == "" {
		log.Fatal("환경 변수 SERVER_URL 값이 비어 있습니다.")
	}

	// 메시지 전송 간격 설정 (기본값: 1000ms)
	messageInterval = 1000 * time.Millisecond
	if messageIntervalStr != "" {
		if ms, err := strconv.Atoi(messageIntervalStr); err == nil && ms > 0 {
			messageInterval = time.Duration(ms) * time.Millisecond
		}
	}

	// ROOM_ID가 있으면 그대로 사용, 없으면 API에서 조회
	if roomIDStr != "" {
		parsedRoomID, err := strconv.ParseInt(roomIDStr, 10, 64)
		if err != nil {
			log.Fatalf("ROOM_ID 파싱 실패: %v", err)
		}
		roomID = parsedRoomID
		log.Println("환경 변수 ROOM_ID 사용")
	} else {
		log.Println("ROOM_ID 미설정 → 채팅방 목록 API에서 roomId 조회 시도")
		fetchedRoomID, err := fetchRoomIDFromAPI()
		if err != nil {
			log.Fatalf("API를 통한 ROOM_ID 조회 실패: %v", err)
		}
		roomID = fetchedRoomID
		log.Printf("API로부터 ROOM_ID=%d 조회 완료\n", roomID)
	}

	log.Println("환경 변수 로드 완료")
	log.Printf("SERVER_URL=%s, ROOM_ID=%d, MESSAGE_INTERVAL=%v\n", url, roomID, messageInterval)
}

// WebSocket 연결
func connectWebSocket(id int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}
	header := http.Header{}
	header.Add("Origin", "http://localhost:3000")
	header.Add("Authorization", "Bearer "+token)

	conn, _, err := dialer.Dial("ws://"+url+"/ws-stomp", header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %v", err)
	}

	return conn, nil
}

// 메시지 고유 키 생성
func makeMessageKey(workerID int, nonce int64) string {
	return fmt.Sprintf("W%d-N%d", workerID, nonce)
}

// 메시지 content에서 키 추출
func extractMessageKey(content string) string {
	// content 형식: "[W{workerID}-N{nonce}] 메시지 내용"
	if strings.HasPrefix(content, "[") {
		endIdx := strings.Index(content, "]")
		if endIdx > 1 {
			return content[1:endIdx]
		}
	}
	return ""
}

// 메시지 읽기 고루틴
func readLoop(conn *websocket.Conn, workerID int, ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			// 읽기 타임아웃 설정
			conn.SetReadDeadline(time.Now().Add(5 * time.Second))
			_, raw, err := conn.ReadMessage()
			if err != nil {
				if ctx.Err() != nil {
					return // context cancelled
				}
				// 타임아웃은 정상적인 상황, 다시 시도
				if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					return
				}
				if strings.Contains(err.Error(), "timeout") {
					continue
				}
				// 실제 오류
				log.Printf("Worker %d 메시지 수신 오류: %v\n", workerID, err)
				errorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				return
			}

			frame := string(raw)

			// STOMP MESSAGE 프레임만 처리
			if !strings.HasPrefix(frame, "MESSAGE") {
				continue
			}

			// 헤더와 바디 분리
			parts := strings.SplitN(frame, "\n\n", 2)
			if len(parts) < 2 {
				continue
			}

			bodyWithNull := parts[1]
			body := strings.TrimSuffix(bodyWithNull, "\u0000")

			var msg ChatMessage
			if err := json.Unmarshal([]byte(body), &msg); err != nil {
				continue
			}

			// roomId 확인
			if msg.RoomId != roomID {
				continue
			}

			// 자기가 보낸 메시지인지 content 기반으로 확인
			messageKey := extractMessageKey(msg.Content)
			if messageKey == "" {
				continue
			}

			// 자기 워커의 메시지인지 확인
			if !strings.HasPrefix(messageKey, fmt.Sprintf("W%d-", workerID)) {
				continue
			}

			// pending에서 찾아서 latency 계산
			if sentTimeVal, ok := pendingMessages.LoadAndDelete(messageKey); ok {
				sentTime := sentTimeVal.(time.Time)
				latency := float64(time.Since(sentTime).Microseconds()) / 1000.0 // ms

				// Prometheus 메트릭 업데이트
				metrics.MessageLatency.Observe(latency)
				metrics.MessageLatencySummary.Observe(latency)
				metrics.MessagesReceived.Inc()

				// 슬라이스에도 저장
				resultsMutex.Lock()
				messageLatencyList = append(messageLatencyList, latency)
				resultsMutex.Unlock()

				receiveMessageCount.Add(1)
				successCount.Add(1)
				metrics.SuccessTotal.Inc()
			}
		}
	}
}

func worker(id int, wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()

	// 활성 연결 수 증가
	activeConnections.Add(1)
	metrics.ActiveConnections.Inc()
	defer func() {
		activeConnections.Add(-1)
		metrics.ActiveConnections.Dec()
	}()

	// WebSocket 연결 시작
	webSocketStart := time.Now()
	conn, err := connectWebSocket(id)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	defer conn.Close()

	webSocketConnectTime := float64(time.Since(webSocketStart).Microseconds()) / 1000.0
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	// 연결 시간 저장
	resultsMutex.Lock()
	webSocketConnectTimeList = append(webSocketConnectTimeList, webSocketConnectTime)
	resultsMutex.Unlock()

	// STOMP CONNECT 프레임 전송
	connectFrame := fmt.Sprintf(
		"CONNECT\nAuthorization:Bearer %s\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\u0000",
		token,
	)

	stompConnectStart := time.Now()
	if err := conn.WriteMessage(websocket.TextMessage, []byte(connectFrame)); err != nil {
		log.Printf("Worker %d STOMP CONNECT 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// CONNECTED 프레임 수신 대기
	conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	if _, _, err := conn.ReadMessage(); err != nil {
		log.Printf("Worker %d STOMP CONNECTED 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	stompConnectTime := float64(time.Since(stompConnectStart).Microseconds()) / 1000.0
	metrics.StompConnectTime.Observe(stompConnectTime)

	// 연결 시간 저장
	resultsMutex.Lock()
	stompConnectTimeList = append(stompConnectTimeList, stompConnectTime)
	resultsMutex.Unlock()

	// 구독 메시지 전송
	subscribeFrame := fmt.Sprintf(
		"SUBSCRIBE\nid:sub-%d\nAuthorization:Bearer %s\ndestination:/topic/chat/room/%d\n\n\u0000",
		id,
		token,
		roomID,
	)
	if err := conn.WriteMessage(websocket.TextMessage, []byte(subscribeFrame)); err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 메시지 수신을 위한 고루틴 시작
	go readLoop(conn, id, ctx)

	// 주기적으로 메시지 전송
	ticker := time.NewTicker(messageInterval)
	defer ticker.Stop()

	var nonce int64 = 0

	for {
		select {
		case <-ctx.Done():
			// 스테이지 종료
			return
		case <-ticker.C:
			// 메시지 전송
			nonce++
			messageKey := makeMessageKey(id, nonce)
			sentTime := time.Now()
			createdAt := sentTime.UTC().Format(time.RFC3339Nano)

			// pending에 저장
			pendingMessages.Store(messageKey, sentTime)

			// 메시지 content에 고유 키 포함
			content := fmt.Sprintf("[%s] Test message from worker %d", messageKey, id)

			sendFrame := fmt.Sprintf(
				"SEND\n"+
					"Authorization:Bearer %s\n"+
					"destination:/publish/%d\n"+
					"content-type:application/json\n\n"+
					"{\"roomId\":%d,"+
					"\"senderId\":1,"+
					"\"type\":\"TEXT\","+
					"\"content\":\"%s\","+
					"\"fileUrl\":null,"+
					"\"fileName\":null,"+
					"\"fileSize\":null,"+
					"\"createdAt\":\"%s\"}\u0000",
				token,
				roomID,
				roomID,
				content,
				createdAt,
			)

			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, []byte(sendFrame)); err != nil {
				log.Printf("Worker %d 메시지 전송 실패: %v\n", id, err)
				errorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				pendingMessages.Delete(messageKey)
				// 연결 끊어짐, 종료
				return
			}
			sendMessageCount.Add(1)
			metrics.MessagesSent.Inc()
		}
	}
}

func main() {
	// Prometheus 메트릭 서버 시작
	startMetricsServer("2112")

	// 로그 파일 설정
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		log.SetOutput(logFile)
		defer logFile.Close()
	}

	fmt.Printf("\n\033[1;36m╔════════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║    STOMP 채팅 서버 10,000명 동시접속 부하 테스트           ║\033[0m\n")
	fmt.Printf("\033[1;36m╚════════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", url)
	fmt.Printf("방 ID: \033[1;33m%d\033[0m\n", roomID)
	fmt.Printf("메시지 전송 간격: \033[1;33m%v\033[0m\n", messageInterval)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(stages))
	fmt.Printf("\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")

	testStartTime := time.Now()

	for stageIdx, stage := range stages {
		stageDuration := time.Duration(stage.duration) * time.Second
		rampUpDuration := 10 * time.Second // 10초 동안 워커들을 점진적으로 생성
		if stageDuration < rampUpDuration {
			rampUpDuration = stageDuration / 2
		}

		// 워커 생성 간격 계산
		var interval time.Duration
		if stage.workers > 0 {
			interval = rampUpDuration / time.Duration(stage.workers)
			if interval < time.Microsecond {
				interval = time.Microsecond
			}
		}

		// Current stage 메트릭 업데이트
		metrics.CurrentStage.Set(float64(stageIdx + 1))

		fmt.Printf("\033[1;34m┌─ Stage %d: %s (%d 워커, %d초 유지) ─┐\033[0m\n",
			stageIdx+1, stage.name, stage.workers, stage.duration)

		// 이 스테이지의 context 생성
		ctx, cancel := context.WithTimeout(context.Background(), stageDuration)

		var wg sync.WaitGroup
		stageStartTime := time.Now()

		// 워커 생성 (ramp-up)
		for i := 0; i < stage.workers; i++ {
			wg.Add(1)
			go worker(stageIdx*100000+i+1, &wg, ctx) // 고유한 worker ID

			// ramp-up 동안만 interval 적용
			if time.Since(stageStartTime) < rampUpDuration {
				time.Sleep(interval)
			}

			// 진행상황 출력 (5% 단위)
			step := stage.workers / 20
			if step == 0 {
				step = 1
			}

			if (i+1)%step == 0 || i == stage.workers-1 {
				progress := float64(i+1) / float64(stage.workers) * 100
				fmt.Printf(
					"\r\033[90m  생성: [%-50s] %.0f%% (%d/%d) | 활성: %d | 전송: %d | 수신: %d | 오류: %d\033[0m",
					strings.Repeat("█", int(progress/2)),
					progress,
					i+1,
					stage.workers,
					activeConnections.Load(),
					sendMessageCount.Load(),
					receiveMessageCount.Load(),
					errorCount.Load(),
				)
			}
		}
		fmt.Printf("\n\033[1;32m  ✓ %d 워커 생성 완료 (소요: %v)\033[0m\n",
			stage.workers, time.Since(stageStartTime).Round(time.Millisecond))

		// 남은 시간 동안 상태 모니터링
		monitorTicker := time.NewTicker(5 * time.Second)
		go func() {
			for {
				select {
				case <-ctx.Done():
					monitorTicker.Stop()
					return
				case <-monitorTicker.C:
					fmt.Printf(
						"\r\033[90m  유지중: 활성=%d | 전송=%d | 수신=%d | 오류=%d | 경과=%v\033[0m\n",
						activeConnections.Load(),
						sendMessageCount.Load(),
						receiveMessageCount.Load(),
						errorCount.Load(),
						time.Since(stageStartTime).Round(time.Second),
					)
				}
			}
		}()

		// 스테이지 종료까지 대기
		<-ctx.Done()
		cancel()

		// 모든 워커 종료 대기
		fmt.Printf("\033[90m  워커 종료 대기 중...\033[0m\n")
		wg.Wait()

		fmt.Printf("\033[1;34m└─ Stage %d 완료 (총 소요: %v) ─┘\033[0m\n\n",
			stageIdx+1, time.Since(stageStartTime).Round(time.Millisecond))

		// 스테이지 간 잠시 대기
		if stageIdx < len(stages)-1 {
			fmt.Printf("\033[90m  다음 스테이지 준비 중... (3초)\033[0m\n\n")
			time.Sleep(3 * time.Second)
		}
	}

	testDuration := time.Since(testStartTime)

	// 총 워커 수 계산
	totalWorkers := 0
	for _, stage := range stages {
		totalWorkers += stage.workers
	}
	metrics.TotalWorkers.Add(float64(totalWorkers))

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
