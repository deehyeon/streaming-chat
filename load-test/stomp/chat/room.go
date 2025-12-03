package chat

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"stomp-load-test/auth"
	"stomp-load-test/config"
	"strconv"
	"strings"
	"time"
)

// ChatRoomType represents chat room type
type ChatRoomType string

const (
	ChatRoomTypePrivate ChatRoomType = "PRIVATE"
	ChatRoomTypeGroup   ChatRoomType = "GROUP"
)

// ChatRoomSummary represents chat room summary information
type ChatRoomSummary struct {
	RoomId             int64        `json:"roomId"`
	UnreadCount        int64        `json:"unreadCount"`
	ChatRoomType       ChatRoomType `json:"chatRoomType"`
	LastMessagePreview string       `json:"lastMessagePreview"`
	LastMessageAt      *time.Time   `json:"lastMessageAt"`
}

// CreatePrivateChatRoom creates a private (1:1) chat room
func CreatePrivateChatRoom(cfg *config.Config, otherMemberId int64) (int64, error) {
	if cfg == nil || cfg.HTTPClient == nil {
		return 0, fmt.Errorf("config 또는 HTTPClient가 nil 입니다")
	}
	if cfg.Token == "" || cfg.ServerURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}
	if otherMemberId == 0 {
		return 0, fmt.Errorf("otherMemberId가 설정되지 않았습니다")
	}

	// Query Parameter로 전달
	endpoint := fmt.Sprintf("http://%s/v1/chat/rooms/private?otherMemberId=%d",
		cfg.ServerURL, otherMemberId)

	req, err := http.NewRequest("POST", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("개인 채팅방 생성 요청 생성 실패: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := cfg.HTTPClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("개인 채팅방 생성 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("개인 채팅방 생성 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return 0, fmt.Errorf("개인 채팅방 생성 실패 (상태 코드 %d): %s", resp.StatusCode, string(body))
	}

	var apiResp auth.ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return 0, fmt.Errorf("개인 채팅방 생성 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("개인 채팅방 생성 API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	var roomId int64
	if err := json.Unmarshal(apiResp.Data, &roomId); err != nil {
		return 0, fmt.Errorf("채팅방 ID 파싱 실패: %w", err)
	}

	return roomId, nil
}

// CreateGroupChatRoom creates a group chat room
func CreateGroupChatRoom(cfg *config.Config, otherMemberIds []int64) (int64, error) {
	if cfg == nil || cfg.HTTPClient == nil {
		return 0, fmt.Errorf("config 또는 HTTPClient가 nil 입니다")
	}
	if cfg.Token == "" || cfg.ServerURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + cfg.ServerURL + "/v1/chat/rooms/group"

	req, err := http.NewRequest("POST", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("그룹 채팅방 생성 요청 생성 실패: %w", err)
	}

	// Query Parameter로 otherMemberIds 추가
	q := req.URL.Query()
	for _, id := range otherMemberIds {
		q.Add("otherMemberIds", strconv.FormatInt(id, 10))
	}
	req.URL.RawQuery = q.Encode()

	req.Header.Set("Authorization", "Bearer "+cfg.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := cfg.HTTPClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("그룹 채팅방 생성 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("그룹 채팅방 생성 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return 0, fmt.Errorf("그룹 채팅방 생성 실패 (상태 코드 %d): %s", resp.StatusCode, string(body))
	}

	var apiResp auth.ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return 0, fmt.Errorf("그룹 채팅방 생성 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("그룹 채팅방 생성 API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	var roomId int64
	if err := json.Unmarshal(apiResp.Data, &roomId); err != nil {
		return 0, fmt.Errorf("채팅방 ID 파싱 실패: %w", err)
	}

	return roomId, nil
}

// FetchRoomIDFromAPI fetches the first available chat room ID from API
func FetchRoomIDFromAPI(cfg *config.Config) (int64, error) {
	if cfg == nil || cfg.HTTPClient == nil {
		return 0, fmt.Errorf("config 또는 HTTPClient가 nil 입니다")
	}
	if cfg.Token == "" || cfg.ServerURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + cfg.ServerURL + "/v1/chat/rooms/me"

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 요청 생성 실패: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := cfg.HTTPClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("채팅방 목록 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("예상치 못한 상태 코드 %d: %s", resp.StatusCode, string(body))
	}

	var apiResp auth.ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return 0, fmt.Errorf("채팅방 목록 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return 0, fmt.Errorf("API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	var roomSummaries []ChatRoomSummary
	if err := json.Unmarshal(apiResp.Data, &roomSummaries); err != nil {
		return 0, fmt.Errorf("채팅방 목록 데이터 파싱 실패: %w", err)
	}

	if len(roomSummaries) == 0 {
		return 0, fmt.Errorf("서버에서 반환한 채팅방이 없습니다")
	}

	return roomSummaries[0].RoomId, nil
}

// ParseRoomID parses room ID from string
func ParseRoomID(roomIDStr string) (int64, error) {
	roomID, err := strconv.ParseInt(roomIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("ROOM_ID 파싱 실패: %w", err)
	}
	return roomID, nil
}

// ParseMemberIDs parses member IDs from comma-separated string, excluding myMemberId
func ParseMemberIDs(memberIdsStr string, myMemberId int64) []int64 {
	var otherMemberIds []int64

	if memberIdsStr != "" {
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

	return otherMemberIds
}
