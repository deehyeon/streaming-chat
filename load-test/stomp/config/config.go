package config

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config 설정 구조체
type Config struct {
	// ⚠️ WebSocket 전용 URL (예: ws://158.180.75.249/ws-stomp)
	ServerURL string

	// ✅ HTTP REST API 전용 Base URL (예: http://158.180.75.249 또는 http://158.180.75.249:8080)
	APIBaseURL string

	Token           string
	MyMemberId      int64
	RoomID          int64
	MessageInterval time.Duration
	HTTPClient      *http.Client

	EnableReconnect      bool
	MaxReconnectAttempts int
	InitialBackoffMs     int
	MaxBackoffMs         int
}

type Stage struct {
	Workers  int
	Name     string
	Duration int // seconds
}

var (
	Stages = []Stage{
		// {10, "10명 초소규모", 180},
		// {100, "100명 안정성 테스트", 180}, // 3분
		// {500, "500명 안정성 테스트", 180},
		// {1000, "1000명 한계 테스트", 300}, // 5분
		// {2000, "2000명 스트레스", 300},
		{5000, "5000명 극한 테스트", 300},
	}
)

func (c *Config) SetToken(token string) {
	c.Token = token
}

func (c *Config) SetMyMemberId(memberId int64) {
	c.MyMemberId = memberId
}

func (c *Config) SetRoomID(roomID int64) {
	c.RoomID = roomID
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := os.Getenv(key)
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

// ✅ 메인 Load 함수: WebSocket URL + API Base URL 둘 다 세팅
func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ .env 파일을 찾을 수 없습니다. 환경 변수에서 직접 로드합니다.")
	}

	// SERVER_URL 예시:
	//  - "158.180.75.249"
	//  - "158.180.75.249:8080"
	//  - "http://158.180.75.249"
	//  - "http://158.180.75.249:8080"
	serverURL := getEnv("SERVER_URL", "localhost:8080")

	// WebSocket URL로 자동 변환 (ws://.../ws-stomp)
	wsURL := buildWebSocketURL(serverURL)

	// HTTP REST API Base URL 생성 (http://... 형태)
	apiBaseURL := buildAPIBaseURL(serverURL)

	messageIntervalMs := getEnvAsInt("MESSAGE_INTERVAL_MS", 5000)
	enableReconnect := getEnvAsBool("ENABLE_RECONNECT", true)
	maxReconnectAttempts := getEnvAsInt("MAX_RECONNECT_ATTEMPTS", 5)
	initialBackoffMs := getEnvAsInt("INITIAL_BACKOFF_MS", 1000)
	maxBackoffMs := getEnvAsInt("MAX_BACKOFF_MS", 30000)

	log.Println("환경 변수 로드 완료")
	log.Printf("SERVER_URL=%s → WebSocket URL=%s, API_BASE_URL=%s, MESSAGE_INTERVAL=%dms\n",
		serverURL, wsURL, apiBaseURL, messageIntervalMs)

	if enableReconnect {
		log.Printf("재연결 활성화: MAX_ATTEMPTS=%d, INITIAL_BACKOFF=%dms, MAX_BACKOFF=%dms\n",
			maxReconnectAttempts, initialBackoffMs, maxBackoffMs)
	} else {
		log.Println("재연결 비활성화")
	}

	return &Config{
		ServerURL:            wsURL,
		APIBaseURL:           apiBaseURL,
		MessageInterval:      time.Duration(messageIntervalMs) * time.Millisecond,
		HTTPClient:           &http.Client{Timeout: 5 * time.Second}, // ⏱ 로그인 타임아웃 짧게
		EnableReconnect:      enableReconnect,
		MaxReconnectAttempts: maxReconnectAttempts,
		InitialBackoffMs:     initialBackoffMs,
		MaxBackoffMs:         maxBackoffMs,
	}, nil
}

// buildWebSocketURL SERVER_URL을 WebSocket URL로 변환
// 입력 예시:
//   - "158.180.75.249" → "ws://158.180.75.249/ws-stomp"
//   - "158.180.75.249:8080" → "ws://158.180.75.249:8080/ws-stomp"
//   - "http://158.180.75.249" → "ws://158.180.75.249/ws-stomp"
//   - "https://158.180.75.249" → "wss://158.180.75.249/ws-stomp"
//   - "ws://158.180.75.249/ws-stomp" → "ws://158.180.75.249/ws-stomp" (그대로)
func buildWebSocketURL(serverURL string) string {
	// 이미 ws:// 또는 wss://로 시작하면 그대로 반환
	if strings.HasPrefix(serverURL, "ws://") || strings.HasPrefix(serverURL, "wss://") {
		return serverURL
	}

	// 프로토콜 결정
	protocol := "ws://"

	// https:// 또는 http://로 시작하는 경우 처리
	if strings.HasPrefix(serverURL, "https://") {
		protocol = "wss://"
		serverURL = strings.TrimPrefix(serverURL, "https://")
	} else if strings.HasPrefix(serverURL, "http://") {
		protocol = "ws://"
		serverURL = strings.TrimPrefix(serverURL, "http://")
	}

	// 경로가 없으면 /ws-stomp 추가
	if !strings.Contains(serverURL, "/") {
		serverURL = serverURL + "/ws-stomp"
	}

	return protocol + serverURL
}

// ✅ HTTP REST API용 Base URL 생성
// 입력 예시:
//   - "158.180.75.249"           → "http://158.180.75.249"
//   - "158.180.75.249:8080"      → "http://158.180.75.249:8080"
//   - "http://158.180.75.249"    → "http://158.180.75.249"
//   - "http://158.180.75.249:80" → "http://158.180.75.249:80"
//   - "ws://158.180.75.249/ws-stomp" → "http://158.180.75.249"
func buildAPIBaseURL(serverURL string) string {
	// 이미 http(s):// 로 시작하면 그대로 사용 (뒤에 슬래시만 정리)
	if strings.HasPrefix(serverURL, "http://") || strings.HasPrefix(serverURL, "https://") {
		return strings.TrimRight(serverURL, "/")
	}

	// ws://, wss:// 인 경우 호스트 부분만 추출
	if strings.HasPrefix(serverURL, "ws://") {
		serverURL = strings.TrimPrefix(serverURL, "ws://")
	} else if strings.HasPrefix(serverURL, "wss://") {
		serverURL = strings.TrimPrefix(serverURL, "wss://")
	}

	// 경로가 있다면 호스트:포트까지만 남기고 자르기
	if idx := strings.Index(serverURL, "/"); idx != -1 {
		serverURL = serverURL[:idx]
	}

	// 최종적으로 http:// 붙여서 반환
	return "http://" + strings.TrimRight(serverURL, "/")
}
