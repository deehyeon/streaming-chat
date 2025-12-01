package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"stomp-load-test/config"
	"strings"
)

// 로그인 요청 DTO
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// 토큰 정보
type TokenInfo struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// 멤버 정보
type MemberInfo struct {
	MemberId   int64  `json:"memberId"`
	MemberName string `json:"memberName"`
	MemberRole string `json:"memberRole"`
}

// 로그인 응답 데이터
type LoginResponseData struct {
	TokenInfo  TokenInfo  `json:"tokenInfo"`
	MemberInfo MemberInfo `json:"memberInfo"`
}

// API 응답 래퍼
type ApiResponse struct {
	Result string          `json:"result"`
	Data   json.RawMessage `json:"data"`
	Error  interface{}     `json:"error"`
}

// Login 자동 로그인 함수
func Login(cfg *config.Config, email, password string) (string, int64, error) {
	if cfg.ServerURL == "" {
		return "", 0, fmt.Errorf("SERVER_URL이 비어 있습니다")
	}

	endpoint := "http://" + cfg.ServerURL + "/v1/auth/login"

	loginReq := LoginRequest{
		Email:    email,
		Password: password,
	}

	jsonData, err := json.Marshal(loginReq)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 요청 JSON 생성 실패: %w", err)
	}

	req, err := http.NewRequest("POST", endpoint, strings.NewReader(string(jsonData)))
	if err != nil {
		return "", 0, fmt.Errorf("로그인 요청 생성 실패: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := cfg.HTTPClient.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 API 호출 실패: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, fmt.Errorf("로그인 응답 읽기 실패: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", 0, fmt.Errorf("로그인 실패 (상태 코드 %d): %s", resp.StatusCode, string(body))
	}

	var apiResp ApiResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return "", 0, fmt.Errorf("로그인 응답 JSON 파싱 실패: %w", err)
	}

	if apiResp.Result != "SUCCESS" {
		return "", 0, fmt.Errorf("로그인 API result != SUCCESS: %s, error=%v", apiResp.Result, apiResp.Error)
	}

	// Data를 LoginResponseData로 변환
	var loginResp LoginResponseData
	if err := json.Unmarshal(apiResp.Data, &loginResp); err != nil {
		return "", 0, fmt.Errorf("로그인 응답 데이터 파싱 실패: %w", err)
	}

	if loginResp.TokenInfo.AccessToken == "" {
		return "", 0, fmt.Errorf("로그인 성공했으나 accessToken이 비어 있습니다")
	}

	return loginResp.TokenInfo.AccessToken, loginResp.MemberInfo.MemberId, nil
}
