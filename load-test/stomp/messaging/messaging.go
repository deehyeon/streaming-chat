package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"stomp-load-test/config"
	"stomp-load-test/metrics"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// ChatMessage represents a chat message structure
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

// PendingMessages tracks sent messages waiting for response
var PendingMessages sync.Map // key: "workerID-nonce", value: time.Time

// Counters
var (
	SendMessageCount    atomic.Int64
	ReceiveMessageCount atomic.Int64
)

// MakeMessageKey generates a unique message key
func MakeMessageKey(workerID int, nonce int64) string {
	return fmt.Sprintf("W%d-N%d", workerID, nonce)
}

// ExtractMessageKey extracts message key from content
func ExtractMessageKey(content string) string {
	// content 형식: "[W{workerID}-N{nonce}] 메시지 내용"
	if strings.HasPrefix(content, "[") {
		endIdx := strings.Index(content, "]")
		if endIdx > 1 {
			return content[1:endIdx]
		}
	}
	return ""
}

// SendMessage sends a STOMP message
func SendMessage(conn *websocket.Conn, cfg *config.Config, workerID int, nonce int64) error {
	messageKey := MakeMessageKey(workerID, nonce)
	sentTime := time.Now()
	createdAt := sentTime.UTC().Format(time.RFC3339Nano)

	// pending에 저장
	PendingMessages.Store(messageKey, sentTime)

	// 메시지 content에 고유 키 포함
	content := fmt.Sprintf("[%s] Test message from worker %d", messageKey, workerID)

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
		cfg.Token,
		cfg.RoomID,
		cfg.RoomID,
		content,
		createdAt,
	)

	conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	if err := conn.WriteMessage(websocket.TextMessage, []byte(sendFrame)); err != nil {
		PendingMessages.Delete(messageKey)
		return err
	}

	SendMessageCount.Add(1)
	metrics.MessagesSent.Inc()
	return nil
}

// ReadLoop reads messages from WebSocket and calculates latency
func ReadLoop(conn *websocket.Conn, cfg *config.Config, workerID int, ctx context.Context, errorCount *atomic.Int64, successCount *atomic.Int64, messageLatencyList *[]float64, resultsMutex *sync.Mutex) {
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
			if msg.RoomId != cfg.RoomID {
				continue
			}

			// 자기가 보낸 메시지인지 content 기반으로 확인
			messageKey := ExtractMessageKey(msg.Content)
			if messageKey == "" {
				continue
			}

			// 자기 워커의 메시지인지 확인
			if !strings.HasPrefix(messageKey, fmt.Sprintf("W%d-", workerID)) {
				continue
			}

			// pending에서 찾아서 latency 계산
			if sentTimeVal, ok := PendingMessages.LoadAndDelete(messageKey); ok {
				sentTime := sentTimeVal.(time.Time)
				latency := float64(time.Since(sentTime).Microseconds()) / 1000.0 // ms

				// Prometheus 메트릭 업데이트
				metrics.MessageLatency.Observe(latency)
				metrics.MessageLatencySummary.Observe(latency)
				metrics.MessagesReceived.Inc()

				// 슬라이스에도 저장
				resultsMutex.Lock()
				*messageLatencyList = append(*messageLatencyList, latency)
				resultsMutex.Unlock()

				ReceiveMessageCount.Add(1)
				successCount.Add(1)
				metrics.SuccessTotal.Inc()
			}
		}
	}
}

// CleanupPendingMessages removes timed-out messages from pending map
func CleanupPendingMessages(ctx context.Context, timeout time.Duration) {
	ticker := time.NewTicker(timeout / 2) // 타임아웃의 절반마다 체크
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			PendingMessages.Range(func(key, value interface{}) bool {
				sentTime := value.(time.Time)
				if now.Sub(sentTime) > timeout {
					PendingMessages.Delete(key)
				}
				return true
			})
		}
	}
}
