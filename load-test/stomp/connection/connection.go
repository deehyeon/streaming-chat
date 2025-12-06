package connection

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"stomp-load-test/config"
	"stomp-load-test/metrics"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/gorilla/websocket"
)

// ConnectWebSocket establishes a WebSocket connection
func ConnectWebSocket(cfg *config.Config, workerID int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}

	header := http.Header{}
	header.Add("Authorization", "Bearer "+cfg.Token)

	conn, _, err := dialer.Dial(cfg.ServerURL, header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %w", err)
	}

	return conn, nil
}

// ConnectWithRetry connects to WebSocket with exponential backoff retry
func ConnectWithRetry(ctx context.Context, cfg *config.Config, workerID int) (*websocket.Conn, error) {
	if !cfg.EnableReconnect {
		return ConnectWebSocket(cfg, workerID)
	}

	var conn *websocket.Conn
	var err error
	var retryCount int

	// Exponential Backoff 설정
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.InitialInterval = time.Duration(cfg.InitialBackoffMs) * time.Millisecond
	expBackoff.MaxInterval = time.Duration(cfg.MaxBackoffMs) * time.Millisecond
	expBackoff.MaxElapsedTime = 5 * time.Minute
	expBackoff.Multiplier = 2.0
	expBackoff.RandomizationFactor = 0.5 // ±50% 랜덤화 (thundering herd 방지)

	// 최대 재시도 횟수 제한
	backoffWithMaxRetries := backoff.WithMaxRetries(expBackoff, uint64(cfg.MaxReconnectAttempts))

	// Context 연동
	backoffWithContext := backoff.WithContext(backoffWithMaxRetries, ctx)

	// 재연결 시작 시 한 번만 Inc
	metrics.ActiveReconnections.Inc()
	defer metrics.ActiveReconnections.Dec()

	operation := func() error {
		select {
		case <-ctx.Done():
			return backoff.Permanent(ctx.Err())
		default:
		}

		conn, err = ConnectWebSocket(cfg, workerID)
		if err != nil {
			log.Printf("Worker %d 연결 실패, 재시도 중... %v\n", workerID, err)
			metrics.ConnectionRetries.Inc()
			retryCount++
			return err
		}
		return nil
	}

	// 재연결 시도
	reconnectStart := time.Now()
	err = backoff.Retry(operation, backoffWithContext)
	if err != nil {
		metrics.FailedReconnections.Inc()
		return nil, fmt.Errorf("Worker %d 최대 재시도 횟수 초과: %w", workerID, err)
	}

	// 재연결이 실제로 발생했을 때만 시간 기록
	if retryCount > 0 {
		reconnectDuration := float64(time.Since(reconnectStart).Milliseconds())
		metrics.ReconnectionTime.Observe(reconnectDuration)
		metrics.SuccessfulReconnections.Inc()
		log.Printf("✓ Worker %d 재연결 성공 (시도: %d회, 소요: %.2fms)\n", workerID, retryCount, reconnectDuration)
	}

	return conn, nil
}

// PerformStompHandshake performs STOMP CONNECT and waits for CONNECTED
func PerformStompHandshake(conn *websocket.Conn, cfg *config.Config, workerID int) error {
	connectFrame := fmt.Sprintf(
		"CONNECT\nAuthorization:Bearer %s\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\u0000",
		cfg.Token,
	)

	if err := conn.WriteMessage(websocket.TextMessage, []byte(connectFrame)); err != nil {
		return fmt.Errorf("STOMP CONNECT 실패: %w", err)
	}

	// CONNECTED 프레임 수신 대기
	conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	if _, _, err := conn.ReadMessage(); err != nil {
		return fmt.Errorf("STOMP CONNECTED 수신 실패: %w", err)
	}
	conn.SetReadDeadline(time.Time{}) // Clear deadline

	return nil
}

// Subscribe subscribes to a STOMP topic
func Subscribe(conn *websocket.Conn, cfg *config.Config, workerID int) error {
	subscribeFrame := fmt.Sprintf(
		"SUBSCRIBE\nid:sub-%d\nAuthorization:Bearer %s\ndestination:/topic/chat/room/%d\n\n\u0000",
		workerID,
		cfg.Token,
		cfg.RoomID,
	)

	if err := conn.WriteMessage(websocket.TextMessage, []byte(subscribeFrame)); err != nil {
		return fmt.Errorf("구독 실패: %w", err)
	}

	return nil
}
