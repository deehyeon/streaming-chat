package chat

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"stomp-load-test/auth"
	"stomp-load-test/config"
	"strconv"
)

// CreateGroupRoom 단체 채팅방 생성 함수
func CreateGroupRoom(cfg *config.Config, otherMemberIds []int64) (int64, error) {
	if cfg.Token == "" || cfg.ServerURL == "" {
		return 0, fmt.Errorf("TOKEN 또는 SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + cfg.ServerURL + "/v1/chat/rooms/group"

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

	req.Header.Set("Authorization", "Bearer "+cfg.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := cfg.HTTPClient.Do(req)
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

	var apiResp auth.ApiResponse
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

// FetchRoomList 채팅방 목록 조회
func FetchRoomList(cfg *config.Config) (int64, error) {
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

	var apiResp auth.ApiResponse
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
