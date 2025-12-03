package worker

import (
	"context"
	"fmt"
	"log"
	"stomp-load-test/config"
	"stomp-load-test/metrics"
	"stomp-load-test/stomp"
	ws "stomp-load-test/websocket"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// SharedData 워커들이 공유하는 데이터
type SharedData struct {
	ResultsMutex             sync.Mutex
	WebSocketConnectTimeList []float64
	StompConnectTimeList     []float64
	MessageLatencyList       []float64

	SendMessageCount    *atomic.Int64
	ReceiveMessageCount *atomic.Int64
	ErrorCount          *atomic.Int64
	SuccessCount        *atomic.Int64
	ActiveConnections   *atomic.Int64

	PendingMessages *sync.Map // key: "workerID-nonce", value: time.Time
}

// NewSharedData 공유 데이터 초기화
func NewSharedData() *SharedData {
	return &SharedData{
		WebSocketConnectTimeList: []float64{},
		StompConnectTimeList:     []float64{},
		MessageLatencyList:       []float64{},
		SendMessageCount:         &atomic.Int64{},
		ReceiveMessageCount:      &atomic.Int64{},
		ErrorCount:               &atomic.Int64{},
		SuccessCount:             &atomic.Int64{},
		ActiveConnections:        &atomic.Int64{},
		PendingMessages:          &sync.Map{},
	}
}

// CleanupPendingMessages pending 메시지 타임아웃 정리 고루틴
func CleanupPendingMessages(ctx context.Context, pendingMessages *sync.Map, timeout time.Duration) {
	if timeout <= 0 {
		// Nothing to clean or misconfiguration; fail fast or just return.
		return
	}
	ticker := time.NewTicker(timeout / 2)

	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			pendingMessages.Range(func(key, value interface{}) bool {
				sentTime, ok := value.(time.Time)
				if !ok {
					pendingMessages.Delete(key)
					return true
				}
				if now.Sub(sentTime) > timeout {
					pendingMessages.Delete(key)
				}
				return true
			})
		}
	}
}

// readLoop 메시지 읽기 고루틴
func readLoop(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context) {
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
				shared.ErrorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				return
			}

			frame := string(raw)

			// STOMP MESSAGE 프레임 파싱
			msg, err := stomp.ParseMessage(frame)
			if err != nil {
				// CONNECTED, RECEIPT, HEARTBEAT 등 MESSAGE가 아닌 경우일 수 있으니 조용히 스킵
				continue
			}

			// 1️⃣ 같은 방인지 확인 (필수 필터)
			if msg.RoomId != cfg.RoomID {
				continue
			}

			// 2️⃣ 일단 "이 방으로 들어온 메시지"는 전부 수신 카운트에 반영
			shared.ReceiveMessageCount.Add(1)
			metrics.MessagesReceived.Inc()

			// 3️⃣ content 기반으로 messageKey 추출 (없으면 latency 측정은 건너뜀)
			messageKey := stomp.ExtractMessageKey(msg.Content)
			if messageKey == "" {
				// 방 통계용 수신 카운트만 반영하고 종료
				continue
			}

			// 4️⃣ 자기 워커가 보낸 메시지인지 확인 (latency 측정은 "자기 것"만)
			if !strings.HasPrefix(messageKey, fmt.Sprintf("W%d-", workerID)) {
				// 다른 워커 / 다른 클라이언트가 보낸 메시지 → 수신 카운트만 유지
				continue
			}

			// 5️⃣ pending에서 찾아서 latency 계산
			if sentTimeVal, ok := shared.PendingMessages.LoadAndDelete(messageKey); ok {
				sentTime := sentTimeVal.(time.Time)
				latency := float64(time.Since(sentTime).Microseconds()) / 1000.0 // ms

				// Prometheus 메트릭 업데이트
				metrics.MessageLatency.Observe(latency)
				metrics.MessageLatencySummary.Observe(latency)

				shared.ResultsMutex.Lock()
				shared.MessageLatencyList = append(shared.MessageLatencyList, latency)
				shared.ResultsMutex.Unlock()

				shared.SuccessCount.Add(1)
				metrics.SuccessTotal.Inc()
			}
		}
	}
}

// Run 워커 실행
func Run(id int, wg *sync.WaitGroup, cfg *config.Config, shared *SharedData, ctx context.Context) {
	defer wg.Done()

	// 활성 연결 수 증가
	shared.ActiveConnections.Add(1)
	metrics.ActiveConnections.Inc()
	defer func() {
		shared.ActiveConnections.Add(-1)
		metrics.ActiveConnections.Dec()
	}()

	// WebSocket 연결 시작
	webSocketStart := time.Now()
	conn, err := ws.Connect(cfg, id)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	defer conn.Close()

	webSocketConnectTime := float64(time.Since(webSocketStart).Microseconds()) / 1000.0
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	// 연결 시간 저장
	shared.ResultsMutex.Lock()
	shared.WebSocketConnectTimeList = append(shared.WebSocketConnectTimeList, webSocketConnectTime)
	shared.ResultsMutex.Unlock()

	// STOMP CONNECT 프레임 전송
	connectFrame := stomp.CreateConnectFrame(cfg.Token)

	stompConnectStart := time.Now()
	if err := conn.WriteMessage(websocket.TextMessage, []byte(connectFrame)); err != nil {
		log.Printf("Worker %d STOMP CONNECT 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// CONNECTED 프레임 수신 대기
	conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	if _, _, err := conn.ReadMessage(); err != nil {
		log.Printf("Worker %d STOMP CONNECTED 수신 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	stompConnectTime := float64(time.Since(stompConnectStart).Microseconds()) / 1000.0
	metrics.StompConnectTime.Observe(stompConnectTime)

	// 연결 시간 저장
	shared.ResultsMutex.Lock()
	shared.StompConnectTimeList = append(shared.StompConnectTimeList, stompConnectTime)
	shared.ResultsMutex.Unlock()

	// 구독 메시지 전송
	subscribeFrame := stomp.CreateSubscribeFrame(id, cfg.Token, cfg.RoomID)
	if err := conn.WriteMessage(websocket.TextMessage, []byte(subscribeFrame)); err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 메시지 수신을 위한 고루틴 시작
	go readLoop(conn, cfg, id, shared, ctx)

	// 주기적으로 메시지 전송
	ticker := time.NewTicker(cfg.MessageInterval)
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
			messageKey := stomp.MakeMessageKey(id, nonce)
			sentTime := time.Now()

			// pending에 저장
			shared.PendingMessages.Store(messageKey, sentTime)

			// 메시지 content에 고유 키 포함
			content := fmt.Sprintf("[%s] Test message from worker %d", messageKey, id)

			sendFrame := stomp.CreateSendFrame(cfg.Token, cfg.RoomID, cfg.MyMemberId, content)

			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, []byte(sendFrame)); err != nil {
				log.Printf("Worker %d 메시지 전송 실패: %v\n", id, err)
				shared.ErrorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				shared.PendingMessages.Delete(messageKey)
				// 연결 끊어짐, 종료
				return
			}
			shared.SendMessageCount.Add(1)
			metrics.MessagesSent.Inc()
		}
	}
}
