package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"stomp-load-test/config"
)

// LoginRequest represents login request DTO
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// TokenInfo represents token information
type TokenInfo struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// MemberInfo represents member information
type MemberInfo struct {
	MemberId   int64  `json:"memberId"`
	MemberName string `json:"memberName"`
	MemberRole string `json:"memberRole"`
}

// LoginResponseData represents login response data
type LoginResponseData struct {
	TokenInfo  TokenInfo  `json:"tokenInfo"`
	MemberInfo MemberInfo `json:"memberInfo"`
}

// ApiResponse represents API response wrapper
type ApiResponse struct {
	Result string          `json:"result"`
	Data   json.RawMessage `json:"data"`
	Error  interface{}     `json:"error"`
}

// AutoLogin performs automatic login and returns access token and member ID
func AutoLogin(cfg *config.Config, email, password string) (string, int64, error) {
	if cfg == nil || cfg.HTTPClient == nil {
		return "", 0, fmt.Errorf("config 또는 HTTPClient가 nil 입니다")
	}
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

	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(jsonData))
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

	var loginResp LoginResponseData
	if err := json.Unmarshal(apiResp.Data, &loginResp); err != nil {
		return "", 0, fmt.Errorf("로그인 응답 데이터 파싱 실패: %w", err)
	}

	if loginResp.TokenInfo.AccessToken == "" {
		return "", 0, fmt.Errorf("로그인 성공했으나 accessToken이 비어 있습니다")
	}

	return loginResp.TokenInfo.AccessToken, loginResp.MemberInfo.MemberId, nil
}
