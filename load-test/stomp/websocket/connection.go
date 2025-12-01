package websocket

import (
	"fmt"
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
	header.Add("Origin", "http://localhost:3000")
	header.Add("Authorization", "Bearer "+cfg.Token)

	conn, _, err := dialer.Dial("ws://"+cfg.ServerURL+"/ws-stomp", header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %v", err)
	}

	return conn, nil
}
