package worker

import (
	"context"
	"log"
	"stomp-load-test/config"
	"stomp-load-test/connection"
	"stomp-load-test/messaging"
	"stomp-load-test/metrics"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// Worker represents a single load test worker
type Worker struct {
	ID                       int
	Config                   *config.Config
	ErrorCount               *atomic.Int64
	SuccessCount             *atomic.Int64
	MessageLatencyList       *[]float64
	WebSocketConnectTimeList *[]float64
	StompConnectTimeList     *[]float64
	ResultsMutex             *sync.Mutex
	ActiveConnectionsCount   *atomic.Int64 // for display purposes
}

// Run executes the worker logic
func (w *Worker) Run(wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()

	connectionStartTime := time.Now()
	defer func() {
		// 연결 유지 시간 기록
		duration := time.Since(connectionStartTime).Seconds()
		metrics.WebSocketConnectionDuration.Observe(duration)
	}()

	// 재연결 로직 활성화 여부에 따라 처리
	if w.Config.EnableReconnect {
		w.runWithReconnect(ctx)
	} else {
		w.runOnce(ctx)
	}
}

// runOnce runs worker without reconnection
func (w *Worker) runOnce(ctx context.Context) {
	metrics.ActiveConnections.Inc()
	w.ActiveConnectionsCount.Add(1)
	defer func() {
		metrics.ActiveConnections.Dec()
		w.ActiveConnectionsCount.Add(-1)
	}()

	// WebSocket 연결
	webSocketStart := time.Now()
	conn, err := connection.ConnectWebSocket(w.Config, w.ID)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}
	defer conn.Close()

	webSocketConnectTime := float64(time.Since(webSocketStart).Microseconds()) / 1000.0
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	w.ResultsMutex.Lock()
	*w.WebSocketConnectTimeList = append(*w.WebSocketConnectTimeList, webSocketConnectTime)
	w.ResultsMutex.Unlock()

	// STOMP 핸드셰이크
	stompConnectStart := time.Now()
	if err := connection.PerformStompHandshake(conn, w.Config, w.ID); err != nil {
		log.Printf("Worker %d STOMP 핸드셰이크 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	stompConnectTime := float64(time.Since(stompConnectStart).Microseconds()) / 1000.0
	metrics.StompConnectTime.Observe(stompConnectTime)

	w.ResultsMutex.Lock()
	*w.StompConnectTimeList = append(*w.StompConnectTimeList, stompConnectTime)
	w.ResultsMutex.Unlock()

	// 구독
	if err := connection.Subscribe(conn, w.Config, w.ID); err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return
	}

	// 메시지 송수신
	w.runMessageLoop(conn, ctx)
}

// runWithReconnect runs worker with reconnection support
func (w *Worker) runWithReconnect(ctx context.Context) {
	reconnectAttempts := 0

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		// 연결 시도 (ConnectWithRetry가 내부적으로 backoff 처리)
		if !w.connectAndRun(ctx, &reconnectAttempts) {
			// 재연결 불가능하면 종료
			return
		}

		// Context가 종료되었으면 정상 종료
		if ctx.Err() != nil {
			return
		}

		// 재연결 시도 (간단한 지연만 추가)
		reconnectAttempts++
		if reconnectAttempts > w.Config.MaxReconnectAttempts {
			log.Printf("Worker %d 최대 재연결 횟수 초과, 종료\n", w.ID)
			return
		}

		// 짧은 지연 후 재시도 (ConnectWithRetry가 주 백오프 담당)
		backoffTime := 1 * time.Second
		log.Printf("Worker %d 재연결 준비 중... (%d/%d)\n",
			w.ID, reconnectAttempts, w.Config.MaxReconnectAttempts)

		select {
		case <-ctx.Done():
			return
		case <-time.After(backoffTime):
			continue
		}
	}
}

// connectAndRun connects and runs message loop, returns true if reconnection should be attempted
func (w *Worker) connectAndRun(ctx context.Context, reconnectAttempts *int) bool {
	metrics.ActiveConnections.Inc()
	w.ActiveConnectionsCount.Add(1)
	defer func() {
		metrics.ActiveConnections.Dec()
		w.ActiveConnectionsCount.Add(-1)
	}()

	// WebSocket 연결 (재연결 로직 포함)
	webSocketStart := time.Now()
	conn, err := connection.ConnectWithRetry(ctx, w.Config, w.ID)
	if err != nil {
		log.Printf("Worker %d 연결 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return false // 재연결 불가
	}
	defer conn.Close()

	webSocketConnectTime := float64(time.Since(webSocketStart).Microseconds()) / 1000.0
	metrics.WebSocketConnectTime.Observe(webSocketConnectTime)

	w.ResultsMutex.Lock()
	*w.WebSocketConnectTimeList = append(*w.WebSocketConnectTimeList, webSocketConnectTime)
	w.ResultsMutex.Unlock()

	// STOMP 핸드셰이크
	stompConnectStart := time.Now()
	if err := connection.PerformStompHandshake(conn, w.Config, w.ID); err != nil {
		log.Printf("Worker %d STOMP 핸드셰이크 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return true // 재연결 시도
	}

	stompConnectTime := float64(time.Since(stompConnectStart).Microseconds()) / 1000.0
	metrics.StompConnectTime.Observe(stompConnectTime)

	w.ResultsMutex.Lock()
	*w.StompConnectTimeList = append(*w.StompConnectTimeList, stompConnectTime)
	w.ResultsMutex.Unlock()

	// 구독
	if err := connection.Subscribe(conn, w.Config, w.ID); err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", w.ID, err)
		w.ErrorCount.Add(1)
		metrics.ErrorsTotal.Inc()
		return true // 재연결 시도
	}

	// 연결 성공 시 재연결 카운트 리셋
	*reconnectAttempts = 0

	// 메시지 송수신
	disconnected := w.runMessageLoop(conn, ctx)
	return disconnected // 의도하지 않은 연결 끊김이면 true
}

// runMessageLoop runs the message send/receive loop, returns true if disconnected unexpectedly
func (w *Worker) runMessageLoop(conn *websocket.Conn, ctx context.Context) bool {
	// 메시지 수신 고루틴
	disconnected := make(chan bool, 1)
	go func() {
		messaging.ReadLoop(conn, w.Config, w.ID, ctx, w.ErrorCount, w.SuccessCount, w.MessageLatencyList, w.ResultsMutex)
		select {
		case <-ctx.Done():
			return
		default:
			disconnected <- true
		}
	}()

	// 메시지 전송
	ticker := time.NewTicker(w.Config.MessageInterval)
	defer ticker.Stop()

	var nonce int64 = 0

	for {
		select {
		case <-ctx.Done():
			return false // 정상 종료
		case <-disconnected:
			return true // 의도하지 않은 연결 끊김
		case <-ticker.C:
			nonce++
			if err := messaging.SendMessage(conn, w.Config, w.ID, nonce); err != nil {
				if ctx.Err() != nil {
					return false // context cancelled, 정상 종료
				}
				// 전송 실패 - 연결 문제
				if !strings.Contains(err.Error(), "timeout") {
					log.Printf("Worker %d 메시지 전송 실패: %v\n", w.ID, err)
					w.ErrorCount.Add(1)
					metrics.ErrorsTotal.Inc()
					return true // 재연결 필요
				}
			}
		}
	}
}
