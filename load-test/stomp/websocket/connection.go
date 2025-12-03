package websocket

import (
	"fmt"
	"io"
	"net/http"
	"stomp-load-test/config"
	"time"

	"github.com/gorilla/websocket"
)

// Connect WebSocket 연결
func Connect(cfg *config.Config, workerID int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}
	header := http.Header{}
	header.Add("Authorization", "Bearer "+cfg.Token)

	conn, resp, err := dialer.Dial("ws://"+cfg.ServerURL+"/ws-stomp", header)
	if err != nil {
		if resp != nil {
			body, _ := io.ReadAll(resp.Body)
			return nil, fmt.Errorf(
				"WebSocket 연결 실패: status=%d, body=%s, err=%v",
				resp.StatusCode, string(body), err,
			)
		}
		return nil, fmt.Errorf("WebSocket 연결 실패 (resp 없음): %v", err)
	}

	return conn, nil
}
