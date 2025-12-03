package stomp

import (
	"encoding/json"
	"fmt"
	"strings"
)

// MessageType 메시지 타입
type MessageType string

const (
	MessageTypeText   MessageType = "TEXT"
	MessageTypeImage  MessageType = "IMAGE"
	MessageTypeVideo  MessageType = "VIDEO"
	MessageTypeFile   MessageType = "FILE"
	MessageTypeAudio  MessageType = "AUDIO"
	MessageTypeSystem MessageType = "SYSTEM"
)

// ChatMessage 메시지 수신 구조체 (백엔드 ChatMessageDto와 동일)
type ChatMessage struct {
	RoomId   int64       `json:"roomId"`
	SenderId int64       `json:"senderId"`
	Type     MessageType `json:"type"`
	Content  string      `json:"content"`
	FileUrl  *string     `json:"fileUrl"`
	FileName *string     `json:"fileName"`
	FileSize *int64      `json:"fileSize"`
}

// CreateConnectFrame STOMP CONNECT 프레임 생성
func CreateConnectFrame(token string) string {
	return fmt.Sprintf(
		"CONNECT\n"+
			"accept-version:1.2\n"+
			"heart-beat:10000,10000\n"+
			"Authorization:Bearer %s\n"+
			"\n\x00",
		token,
	)
}

func CreateSubscribeFrame(workerID int, token string, roomId int64) string {
	subID := fmt.Sprintf("sub-%d", workerID)
	dest := fmt.Sprintf("/topic/chat/room/%d", roomId)

	return fmt.Sprintf(
		"SUBSCRIBE\n"+
			"id:%s\n"+
			"destination:%s\n"+
			"ack:auto\n"+
			"Authorization:Bearer %s\n"+
			"\n\x00",
		subID,
		dest,
		token,
	)
}

// CreateSendFrame STOMP SEND 프레임 생성
func CreateSendFrame(token string, roomId int64, senderId int64, content string) string {
	msg := ChatMessage{
		RoomId:   roomId,
		SenderId: senderId,
		Type:     MessageTypeText,
		Content:  content,
		FileUrl:  nil,
		FileName: nil,
		FileSize: nil,
	}

	bodyBytes, _ := json.Marshal(msg)
	body := string(bodyBytes)

	return fmt.Sprintf(
		"SEND\n"+
			"destination:/publish/%d\n"+
			"content-type:application/json\n"+
			"Authorization:Bearer %s\n"+
			"\n%s\x00",
		roomId,
		token,
		body,
	)
}

// ParseMessage STOMP MESSAGE 프레임 파싱
func ParseMessage(frame string) (*ChatMessage, error) {
	// STOMP MESSAGE 프레임만 처리
	if !strings.HasPrefix(frame, "MESSAGE") {
		return nil, fmt.Errorf("not a MESSAGE frame")
	}

	// 헤더와 바디 분리
	parts := strings.SplitN(frame, "\n\n", 2)
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid frame format")
	}

	bodyWithNull := parts[1]
	body := strings.TrimSuffix(bodyWithNull, "\u0000")

	var msg ChatMessage
	if err := json.Unmarshal([]byte(body), &msg); err != nil {
		return nil, fmt.Errorf("JSON 파싱 실패: %w", err)
	}

	return &msg, nil
}

// MakeMessageKey 메시지 고유 키 생성
func MakeMessageKey(workerID int, nonce int64) string {
	return fmt.Sprintf("W%d-N%d", workerID, nonce)
}

// ExtractMessageKey 메시지 content에서 키 추출
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
