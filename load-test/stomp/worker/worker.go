package worker

import (
	"context"
	"fmt"
	"log"
	"stomp-load-test/config"
	"stomp-load-test/connection"
	"stomp-load-test/metrics"
	"stomp-load-test/stomp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// MessagePattern 메시지 전송 패턴
type MessagePattern string

const (
	PatternActive   MessagePattern = "active"   // 활발하게 메시지 전송 (10%)
	PatternModerate MessagePattern = "moderate" // 가끔 메시지 전송 (30%)
	PatternPassive  MessagePattern = "passive"  // 거의 안 보냄, 수신만 (60%)
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

	// 패턴별 연결 수 추적
	PassiveConnectionCount  *atomic.Int64
	ModerateConnectionCount *atomic.Int64
	ActiveConnectionCount   *atomic.Int64

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
		PassiveConnectionCount:   &atomic.Int64{},
		ModerateConnectionCount:  &atomic.Int64{},
		ActiveConnectionCount:    &atomic.Int64{},
		PendingMessages:          &sync.Map{},
	}
}

// CleanupPendingMessages pending 메시지 타임아웃 정리 고루틴
func CleanupPendingMessages(ctx context.Context, pendingMessages *sync.Map, timeout time.Duration) {
	if timeout <= 0 {
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

// determineMessagePattern 워커 ID에 따라 메시지 전송 패턴 결정
// 10% active, 30% moderate, 60% passive
func determineMessagePattern(workerID int) MessagePattern {
	mod := workerID % 100
	if mod < 10 {
		return PatternActive // 0~9: 10%
	} else if mod < 40 {
		return PatternModerate // 10~39: 30%
	}
	return PatternPassive // 40~99: 60%
}

// readLoop 메시지 읽기 고루틴
// readLoop 메시지 읽기 고루틴
func readLoop(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Worker %d readLoop panic 복구: %v\n", workerID, r)
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return
		default:
			conn.SetReadDeadline(time.Now().Add(5 * time.Second))
			_, raw, err := conn.ReadMessage()
			if err != nil {
				// Context가 취소된 경우 정상 종료
				if ctx.Err() != nil {
					return
				}

				// 연결 종료 에러는 정상 처리
				if websocket.IsCloseError(err,
					websocket.CloseNormalClosure,
					websocket.CloseGoingAway,
					websocket.CloseAbnormalClosure) {
					log.Printf("Worker %d 연결 종료됨: %v\n", workerID, err)
					return
				}

				// 타임아웃은 계속 시도
				if strings.Contains(err.Error(), "timeout") ||
					strings.Contains(err.Error(), "i/o timeout") {
					continue
				}

				// 그 외 에러는 로그 후 종료 (반복 읽기 방지)
				log.Printf("Worker %d 메시지 수신 오류: %v\n", workerID, err)
				shared.ErrorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				return // ⚠️ 여기서 반드시 return
			}

			frame := string(raw)

			msg, err := stomp.ParseMessage(frame)
			if err != nil {
				continue
			}

			// 같은 방인지 확인
			if msg.RoomId != cfg.RoomID {
				continue
			}

			// 수신 카운트 증가
			shared.ReceiveMessageCount.Add(1)
			metrics.MessagesReceived.Inc()

			// messageKey 추출
			messageKey := stomp.ExtractMessageKey(msg.Content)
			if messageKey == "" {
				continue
			}

			// 자기 워커가 보낸 메시지인지 확인
			if !strings.HasPrefix(messageKey, fmt.Sprintf("W%d-", workerID)) {
				continue
			}

			// latency 계산
			if sentTimeVal, ok := shared.PendingMessages.LoadAndDelete(messageKey); ok {
				sentTime := sentTimeVal.(time.Time)
				latency := float64(time.Since(sentTime).Microseconds()) / 1000.0

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

// sendMessages 메시지 전송 로직 (ticker 기반)
// sendMessages 메시지 전송 로직 (ticker 기반)
func sendMessages(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context, ticker *time.Ticker) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Worker %d sendMessages panic 복구: %v\n", workerID, r)
		}
	}()

	var nonce int64 = 0
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			nonce++
			messageKey := stomp.MakeMessageKey(workerID, nonce)
			sentTime := time.Now()
			shared.PendingMessages.Store(messageKey, sentTime)

			content := fmt.Sprintf("[%s] Test message from worker %d", messageKey, workerID)
			sendFrame := stomp.CreateSendFrame(cfg.Token, cfg.RoomID, cfg.MyMemberId, content)

			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, []byte(sendFrame)); err != nil {
				// Context가 취소된 경우 정상 종료
				if ctx.Err() != nil {
					shared.PendingMessages.Delete(messageKey)
					return
				}

				log.Printf("Worker %d 메시지 전송 실패: %v\n", workerID, err)
				shared.ErrorCount.Add(1)
				metrics.ErrorsTotal.Inc()
				shared.PendingMessages.Delete(messageKey)
				return // ⚠️ 연결 실패 시 반복 전송 중지
			}
			shared.SendMessageCount.Add(1)
			metrics.MessagesSent.Inc()
		}
	}
}

// activeSender 활발한 메시지 전송 (기본 간격)
func activeSender(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context) {
	ticker := time.NewTicker(cfg.MessageInterval) // 예: 5초
	defer ticker.Stop()
	sendMessages(conn, cfg, workerID, shared, ctx, ticker)
}

// moderateSender 보통 수준 메시지 전송 (기본 간격의 3배)
func moderateSender(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context) {
	ticker := time.NewTicker(cfg.MessageInterval * 3) // 예: 15초
	defer ticker.Stop()
	sendMessages(conn, cfg, workerID, shared, ctx, ticker)
}

// passiveSender 드물게 메시지 전송 (기본 간격의 10배)
func passiveSender(conn *websocket.Conn, cfg *config.Config, workerID int, shared *SharedData, ctx context.Context) {
	ticker := time.NewTicker(cfg.MessageInterval * 10) // 예: 50초
	defer ticker.Stop()
	sendMessages(conn, cfg, workerID, shared, ctx, ticker)
}

// Run 워커 실행
func Run(id int, wg *sync.WaitGroup, cfg *config.Config, shared *SharedData, ctx context.Context) {
	defer wg.Done()

	// 메시지 패턴 결정
	pattern := determineMessagePattern(id)

	// 활성 연결 수 증가
	shared.ActiveConnections.Add(1)
	metrics.ActiveConnections.Inc()

	// 패턴별 카운터 증가
	switch pattern {
	case PatternActive:
		shared.ActiveConnectionCount.Add(1)
		metrics.ActiveConnectionsGauge.Inc()
	case PatternModerate:
		shared.ModerateConnectionCount.Add(1)
		metrics.ModerateConnectionsGauge.Inc()
	case PatternPassive:
		shared.PassiveConnectionCount.Add(1)
		metrics.PassiveConnectionsGauge.Inc()
	}

	defer func() {
		shared.ActiveConnections.Add(-1)
		metrics.ActiveConnections.Dec()

		// 패턴별 카운터 감소
		switch pattern {
		case PatternActive:
			shared.ActiveConnectionCount.Add(-1)
			metrics.ActiveConnectionsGauge.Dec()
		case PatternModerate:
			shared.ModerateConnectionCount.Add(-1)
			metrics.ModerateConnectionsGauge.Dec()
		case PatternPassive:
			shared.PassiveConnectionCount.Add(-1)
			metrics.PassiveConnectionsGauge.Dec()
		}
	}()

	// WebSocket 연결 (재연결 지원)
	webSocketStart := time.Now()
	conn, err := connection.ConnectWithRetry(ctx, cfg, id)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	defer conn.Close()

	webSocketConnectTime := float64(time.Since(webSocketStart).Microseconds()) / 1000.0
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	shared.ResultsMutex.Lock()
	shared.WebSocketConnectTimeList = append(shared.WebSocketConnectTimeList, webSocketConnectTime)
	shared.ResultsMutex.Unlock()

	// STOMP 핸드셰이크
	stompConnectStart := time.Now()
	if err := connection.PerformStompHandshake(conn, cfg, id); err != nil {
		log.Printf("Worker %d STOMP 핸드셰이크 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	stompConnectTime := float64(time.Since(stompConnectStart).Microseconds()) / 1000.0
	metrics.StompConnectTime.Observe(stompConnectTime)

	shared.ResultsMutex.Lock()
	shared.StompConnectTimeList = append(shared.StompConnectTimeList, stompConnectTime)
	shared.ResultsMutex.Unlock()

	// 구독
	if err := connection.Subscribe(conn, cfg, id); err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", id, err)
		shared.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 메시지 수신 고루틴 시작
	go readLoop(conn, cfg, id, shared, ctx)

	// 패턴에 따라 메시지 전송 시작
	switch pattern {
	case PatternActive:
		activeSender(conn, cfg, id, shared, ctx)
	case PatternModerate:
		moderateSender(conn, cfg, id, shared, ctx)
	case PatternPassive:
		passiveSender(conn, cfg, id, shared, ctx)
	}
}
