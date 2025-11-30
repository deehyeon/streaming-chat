package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"stomp-load-test/metrics"
	"stomp-load-test/reports"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
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

// 로그인 요청 DTO
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// 토큰 정보
type TokenInfo struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// 멤버 정보
type MemberInfo struct {
	MemberId   int64  `json:"memberId"`
	MemberName string `json:"memberName"`
	MemberRole string `json:"memberRole"`
}

// 로그인 응답 데이터
type LoginResponseData struct {
	TokenInfo  TokenInfo  `json:"tokenInfo"`
	MemberInfo MemberInfo `json:"memberInfo"`
}

// API 응답 래퍼
type ApiResponse struct {
	Result string          `json:"result"`
	Data   json.RawMessage `json:"data"`
	Error  interface{}     `json:"error"`
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
		{3000, "중간 트래픽 정밀 측정", 300},
	}
)

// 전역 변수
var (
	token           string
	serverURL       string
	roomID          int64
	messageInterval time.Duration // 메시지 전송 간격

	// HTTP 클라이언트 (타임아웃 설정)
	httpClient = &http.Client{
		Timeout: 30 * time.Second,
	}

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

	// graceful shutdown을 위한 context
	mainCtx    context.Context
	mainCancel context.CancelFunc
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

// 자동 로그인 함수
func autoLogin(email, password string) (string, int64, error) {
	if serverURL == "" {
		return "", 0, fmt.Errorf("SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + serverURL + "/v1/auth/login"

	loginReq := LoginRequest{
		Email:    email,
		Password: password,
	}

	jsonData, err := json.Marshal(loginReq)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 요청 JSON 생성 실패: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, strings.NewReader(string(jsonData)))
	if err != nil {
		return "", 0, fmt.Errorf("로그인 요청 생성 실패: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", 0, fmt.Errorf("로그인 실패 (상태 코드 %d): %s", resp.StatusCode, string(body))
	}

	var apiResp ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return "", 0, fmt.Errorf("로그인 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return "", 0, fmt.Errorf("로그인 API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	// Data를 LoginResponseData로 변환
	var loginResp LoginResponseData
	if err := json.Unmarshal(apiResp.Data, &loginResp); err != nil {
		return "", 0, fmt.Errorf("로그인 응답 데이터 파싱 실패: %w", err)
	}

	if loginResp.TokenInfo.AccessToken == "" {
		return "", 0, fmt.Errorf("로그인 성공했으나 accessToken이 비어 있습니다")
	}

	return loginResp.TokenInfo.AccessToken, loginResp.MemberInfo.MemberId, nil
}

// 단체 채팅방 생성 함수 (실제 API 스펙에 맞춤)
func createGroupChatRoom(otherMemberIds []int64) (int64, error) {
	if token == "" || serverURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + serverURL + "/v1/chat/rooms/group"

	req, err := http.NewRequest("POST", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("채팅방 생성 요청 생성 실패: %w", err)
	}

	// Query Parameter로 otherMemberIds 추가
	q := req.URL.Query()
	for _, id := range otherMemberIds {
		q.Add("otherMemberIds", strconv.FormatInt(id, 10))
	}
	req.URL.RawQuery = q.Encode()

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("채팅방 생성 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("채팅방 생성 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return 0, fmt.Errorf("채팅방 생성 실패 (상태 코드 %d): %s", resp.StatusCode, string(body))
	}

	var apiResp ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return 0, fmt.Errorf("채팅방 생성 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("채팅방 생성 API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	// Data를 int64로 변환 (roomId)
	var roomId int64
	if err := json.Unmarshal(apiResp.Data, &roomId); err != nil {
		return 0, fmt.Errorf("채팅방 ID 파싱 실패: %w", err)
	}

	return roomId, nil
}

// 채팅방 목록 조회 (기존 함수 - 필요시 사용)
func fetchRoomIDFromAPI() (int64, error) {
	if token == "" || serverURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + serverURL + "/v1/chat/rooms/me"

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 요청 생성 실패: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return 0, fmt.Errorf("채팅방 목록 응답 읽기 실패: %w", err)
		}
		return 0, fmt.Errorf("예상치 못한 상태 코드 %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 응답 읽기 실패: %w", err)
	}

	var apiResp ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return 0, fmt.Errorf("채팅방 목록 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	// Data를 []int64 배열로 파싱 (roomId 리스트)
	var roomIds []int64
	if err := json.Unmarshal(apiResp.Data, &roomIds); err != nil {
		return 0, fmt.Errorf("채팅방 목록 데이터 파싱 실패: %w", err)
	}

	if len(roomIds) == 0 {
		return 0, fmt.Errorf("서버에서 반환한 채팅방이 없습니다")
	}

	return roomIds[0], nil
}

// pending 메시지 타임아웃 정리 고루틴
func cleanupPendingMessages(ctx context.Context, timeout time.Duration) {
	ticker := time.NewTicker(timeout / 2) // 타임아웃의 절반마다 체크
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			pendingMessages.Range(func(key, value interface{}) bool {
				sentTime := value.(time.Time)
				if now.Sub(sentTime) > timeout {
					pendingMessages.Delete(key)
					// 타임아웃 메시지는 로그만 남기고 에러 카운트하지 않음 (정상적인 상황일 수 있음)
				}
				return true
			})
		}
	}
}

func init() {
	// .env 파일 로드
	if err := godotenv.Load(); err != nil {
		log.Println(".env 파일을 찾지 못했습니다. (운영 환경일 수 있습니다)")
	}

	// 환경변수 읽기
	serverURL = os.Getenv("SERVER_URL")
	messageIntervalStr := os.Getenv("MESSAGE_INTERVAL_MS")

	// SERVER_URL 필수 검증
	if serverURL == "" {
		log.Fatal("환경 변수 SERVER_URL 값이 비어 있습니다.")
	}

	// 메시지 전송 간격 설정 (기본값: 1000ms)
	messageInterval = 1000 * time.Millisecond
	if messageIntervalStr != "" {
		if ms, err := strconv.Atoi(messageIntervalStr); err == nil && ms > 0 {
			messageInterval = time.Duration(ms) * time.Millisecond
		}
	}

	// 인증 처리 (우선순위: TOKEN > EMAIL/PASSWORD)
	token = os.Getenv("TOKEN")
	var myMemberId int64

	if token == "" {
		email := os.Getenv("EMAIL")
		password := os.Getenv("PASSWORD")

		if email != "" && password != "" {
			log.Println("TOKEN 미설정 → EMAIL/PASSWORD로 자동 로그인 시도")
			accessToken, memberId, err := autoLogin(email, password)
			if err != nil {
				log.Fatalf("자동 로그인 실패: %v", err)
			}
			token = accessToken
			myMemberId = memberId
			log.Printf("✓ 자동 로그인 성공 (memberId=%d)\n", memberId)
		} else {
			log.Fatal("환경 변수 TOKEN 또는 (EMAIL + PASSWORD)가 필요합니다.")
		}
	}

	// ROOM_ID 처리 (우선순위: ROOM_ID > 새로운 단체방 생성 > 기존 방 조회)
	roomIDStr := os.Getenv("ROOM_ID")
	if roomIDStr != "" {
		parsedRoomID, err := strconv.ParseInt(roomIDStr, 10, 64)
		if err != nil {
			log.Fatalf("ROOM_ID 파싱 실패: %v", err)
		}
		roomID = parsedRoomID
		log.Println("✓ 환경 변수 ROOM_ID 사용")
	} else {
		createNewRoom := os.Getenv("CREATE_NEW_ROOM")
		if createNewRoom == "true" {
			log.Println("ROOM_ID 미설정 + CREATE_NEW_ROOM=true → 새 단체 채팅방 생성 시도")

			// 멤버 ID 목록 파싱 (다른 멤버들만)
			memberIdsStr := os.Getenv("MEMBER_IDS")
			var otherMemberIds []int64

			if memberIdsStr != "" {
				// 쉼표로 구분된 멤버 ID 파싱
				idStrs := strings.Split(memberIdsStr, ",")
				for _, idStr := range idStrs {
					idStr = strings.TrimSpace(idStr)
					if id, err := strconv.ParseInt(idStr, 10, 64); err == nil {
						// 자기 자신은 제외 (서버에서 자동 추가됨)
						if id != myMemberId {
							otherMemberIds = append(otherMemberIds, id)
						}
					}
				}
			}

			fetchedRoomID, err := createGroupChatRoom(otherMemberIds)
			if err != nil {
				log.Fatalf("단체 채팅방 생성 실패: %v", err)
			}
			roomID = fetchedRoomID
			log.Printf("✓ 새 단체 채팅방 생성 완료 (ROOM_ID=%d, OTHER_MEMBERS=%v)\n", roomID, otherMemberIds)
		} else {
			log.Println("ROOM_ID 미설정 → 채팅방 목록 API에서 첫 번째 방 조회 시도")
			fetchedRoomID, err := fetchRoomIDFromAPI()
			if err != nil {
				log.Fatalf("API를 통한 ROOM_ID 조회 실패: %v", err)
			}
			roomID = fetchedRoomID
			log.Printf("✓ 기존 채팅방 조회 완료 (ROOM_ID=%d)\n", roomID)
		}
	}

	log.Println("환경 변수 로드 완료")
	log.Printf("SERVER_URL=%s, ROOM_ID=%d, MESSAGE_INTERVAL=%v\n", serverURL, roomID, messageInterval)
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

	conn, _, err := dialer.Dial("ws://"+serverURL+"/ws-stomp", header)
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
	// graceful shutdown을 위한 context 설정
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

	// pending 메시지 타임아웃 정리 고루틴 시작 (30초 타임아웃)
	go cleanupPendingMessages(mainCtx, 30*time.Second)

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
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", serverURL)
	fmt.Printf("방 ID: \033[1;33m%d\033[0m\n", roomID)
	fmt.Printf("메시지 전송 간격: \033[1;33m%v\033[0m\n", messageInterval)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n", len(stages))
	fmt.Printf("\033[1;32m📊 Prometheus metrics: http://localhost:2112/metrics\033[0m\n")
	fmt.Printf("\033[1;32m📈 Grafana dashboard: http://localhost:3000\033[0m\n\n")

	testStartTime := time.Now()

	for stageIdx, stage := range stages {
		// 메인 context가 취소되었는지 확인
		select {
		case <-mainCtx.Done():
			fmt.Printf("\033[1;33m테스트 중단됨\033[0m\n")
			goto END_TEST
		default:
		}

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
		stageCtx, stageCancel := context.WithTimeout(mainCtx, stageDuration)

		var wg sync.WaitGroup
		stageStartTime := time.Now()

		// 워커 생성 (ramp-up)
		for i := 0; i < stage.workers; i++ {
			// 메인 context 체크
			select {
			case <-mainCtx.Done():
				stageCancel()
				goto WAIT_WORKERS
			default:
			}

			wg.Add(1)
			go worker(stageIdx*100000+i+1, &wg, stageCtx) // 고유한 worker ID

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
				case <-stageCtx.Done():
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
		<-stageCtx.Done()
		stageCancel()

	WAIT_WORKERS:
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

END_TEST:
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

	// 메트릭 서버 유지 (10초간 대기 후 종료)
	fmt.Printf("\033[90m메트릭 확인을 위해 10초간 대기합니다... (Ctrl+C로 즉시 종료 가능)\033[0m\n")
	select {
	case <-time.After(10 * time.Second):
		fmt.Printf("\033[1;32m정상 종료\033[0m\n")
	case <-mainCtx.Done():
		fmt.Printf("\033[1;33m종료됨\033[0m\n")
	}
}
