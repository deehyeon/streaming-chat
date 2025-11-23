package main

import (
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
	duration int
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

// 스테이지 설정
var (
	stages = []Stage{
		{100, "워밍업", 30},    // 30초에 100명
		{500, "정상 트래픽", 60}, // 1분에 500명
		{1000, "피크 시간", 60}, // 1분에 1000명
		{500, "트래픽 감소", 30}, // 30초에 500명
	}
)

// 전역 변수
var (
	token  string
	url    string
	roomID int64

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

	// SERVER_URL이 "localhost:8080" 형태라고 가정 → http:// 붙여줌
	// 실제 엔드포인트 경로는 프로젝트에 맞게 수정하세요.
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

	// 일단 첫 번째 방을 사용
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

	// 값 검증
	if token == "" {
		log.Fatal("환경 변수 TOKEN 값이 비어 있습니다.")
	}
	if url == "" {
		log.Fatal("환경 변수 SERVER_URL 값이 비어 있습니다.")
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
	log.Printf("SERVER_URL=%s, ROOM_ID=%d\n", url, roomID)
}

// WebSocket 연결
func connectWebSocket(id int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
	}
	header := http.Header{}
	// Spring 설정: setAllowedOrigins("http://localhost:3000")
	header.Add("Origin", "http://localhost:3000")
	header.Add("Authorization", "Bearer "+token)

	// Spring 설정: addEndpoint("/connect") 기준
	conn, _, err := dialer.Dial("ws://"+url+"/ws-stomp", header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %v", err)
	}

	return conn, nil
}

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	var isFinish atomic.Bool

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

	// STOMP CONNECT 프레임 전송
	connectFrame := fmt.Sprintf(
		"CONNECT\nAuthorization:Bearer %s\naccept-version:1.2,1.1,1.0\nheart-beat:2000,2000\n\n\u0000",
		token,
	)

	stompConnectStart := time.Now().UnixNano()
	if err := conn.WriteMessage(websocket.TextMessage, []byte(connectFrame)); err != nil {
		log.Printf("Worker %d STOMP CONNECT 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// CONNECTED 프레임 수신 대기
	if _, _, err := conn.ReadMessage(); err != nil {
		log.Printf("Worker %d STOMP CONNECTED 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	stompConnectEnd := time.Now().UnixNano()
	stompConnectTime := float64(stompConnectEnd-stompConnectStart) / 1e6
	metrics.StompConnectTime.Observe(stompConnectTime)

	// 구독 메시지 전송: /topic/chat/room/{roomId}
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

	// 메시지 수신을 위한 고루틴
	go func() {
		for !isFinish.Load() {
			_, raw, err := conn.ReadMessage()
			if err != nil {
				if !isFinish.Load() {
					log.Printf("Worker %d 메시지 수신 오류: %v\n", id, err)
					errorCount.Add(1)
					metrics.ErrorsTotal.Inc()
				}
				isFinish.Store(true)
				return
			}

			frame := string(raw)

			// STOMP MESSAGE 프레임만 처리
			if !strings.HasPrefix(frame, "MESSAGE") {
				continue
			}

			// 헤더와 바디 분리: "\n\n" 기준
			parts := strings.SplitN(frame, "\n\n", 2)
			if len(parts) < 2 {
				continue
			}

			bodyWithNull := parts[1]
			body := strings.TrimSuffix(bodyWithNull, "\u0000")

			// 서버에서 보내는 DTO 구조에 맞추어 파싱
			var msg struct {
				RoomId    int64   `json:"roomId"`
				SenderId  int64   `json:"senderId"`
				Type      string  `json:"type"`
				Content   string  `json:"content"`
				FileUrl   *string `json:"fileUrl"`
				FileName  *string `json:"fileName"`
				FileSize  *int64  `json:"fileSize"`
				CreatedAt string  `json:"createdAt"`
			}

			if err := json.Unmarshal([]byte(body), &msg); err != nil {
				log.Printf("Worker %d JSON 파싱 실패: %v, body=%s\n", id, err, body)
				continue
			}

			// 본인이 보낸 메시지만 처리 (지금은 토큰이 모두 memberId=1 이라고 가정)
			if msg.SenderId != 1 || msg.RoomId != int64(roomID) {
				continue
			}

			// createdAt 기반으로 지연 시간 계산
			sentTime, err := time.Parse(time.RFC3339Nano, msg.CreatedAt)
			if err != nil {
				log.Printf("Worker %d createdAt 파싱 실패: %v, createdAt=%s\n", id, err, msg.CreatedAt)
				continue
			}

			latency := float64(time.Since(sentTime).Microseconds()) / 1000.0 // ms

			// Prometheus 메트릭 업데이트
			metrics.MessageLatency.Observe(latency)
			metrics.MessageLatencySummary.Observe(latency)
			metrics.MessagesReceived.Inc()

			// 슬라이스에도 저장
			resultsMutex.Lock()
			messageLatencyList = append(messageLatencyList, latency)
			webSocketConnectTimeList = append(webSocketConnectTimeList, webSocketConnectTime)
			stompConnectTimeList = append(stompConnectTimeList, stompConnectTime)
			resultsMutex.Unlock()

			receiveMessageCount.Add(1)
			successCount.Add(1)
			metrics.SuccessTotal.Inc()
			isFinish.Store(true)
			return
		}
	}()

	// 채팅 메시지 전송
	currentTimeNs := time.Now().UnixNano()
	createdAt := time.Now().UTC().Format(time.RFC3339Nano)

	message := fmt.Sprintf("Worker %d - %d", id, currentTimeNs)

	// @MessageMapping("/{roomId}") → /publish/{roomId}
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
		message,
		createdAt,
	)

	if err := conn.WriteMessage(websocket.TextMessage, []byte(sendFrame)); err != nil {
		log.Printf("Worker %d 메시지 전송 실패: %v\n", id, err)
		errorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	sendMessageCount.Add(1)
	metrics.MessagesSent.Inc()

	// 메시지 수신 대기 (최대 30초)
	timeout := time.After(30 * time.Second)
	for !isFinish.Load() {
		select {
		case <-timeout:
			log.Printf("Worker %d 타임아웃\n", id)
			errorCount.Add(1)
			metrics.ErrorsTotal.Inc()
			return
		default:
			time.Sleep(100 * time.Millisecond)
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
	fmt.Printf("방 ID: \033[1;33m%d\033[0m\n", roomID)
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

			// 진행상황 출력 (10% 단위, 최소 step=1 보장)
			step := stage.workers / 10
			if step == 0 {
				step = 1
			}

			if (i+1)%step == 0 || i == stage.workers-1 {
				progress := float64(i+1) / float64(stage.workers) * 100
				fmt.Printf(
					"\r\033[90m  진행: [%-50s] %.0f%% (%d/%d) | 활성: %d | 성공: %d | 오류: %d\033[0m",
					strings.Repeat("█", int(progress/2)),
					progress,
					i+1,
					stage.workers,
					activeConnections.Load(),
					successCount.Load(),
					errorCount.Load(),
				)
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
