package config

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerURL            string
	Token                string
	MyMemberId           int64
	RoomID               int64
	MessageInterval      time.Duration
	HTTPClient           *http.Client
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
		{2, "소규모 테스트", 10},
		// {100, "소규모 테스트", 60},
		// {500, "중규모 테스트", 120},
		// {2000, "대규모 테스트", 180},
		// {10000, "최대 부하 테스트", 300},
	}
	// 총 워커 수: 100 + 500 + 2000 + 10000 = 12,600명
	// DB에 10,000명만 존재하므로 cumulativeOffset을 0으로 설정하여 재사용
)

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ .env 파일을 찾을 수 없습니다. 환경 변수에서 직접 로드합니다.")
	}

	serverURL := getEnv("SERVER_URL", "localhost:8080")
	messageIntervalMs := getEnvAsInt("MESSAGE_INTERVAL_MS", 5000)
	enableReconnect := getEnvAsBool("ENABLE_RECONNECT", true)
	maxReconnectAttempts := getEnvAsInt("MAX_RECONNECT_ATTEMPTS", 5)
	initialBackoffMs := getEnvAsInt("INITIAL_BACKOFF_MS", 1000)
	maxBackoffMs := getEnvAsInt("MAX_BACKOFF_MS", 30000)

	log.Println("환경 변수 로드 완료")
	log.Printf("SERVER_URL=%s, MESSAGE_INTERVAL=%dms\n", serverURL, messageIntervalMs)

	if enableReconnect {
		log.Printf("재연결 활성화: MAX_ATTEMPTS=%d, INITIAL_BACKOFF=%dms, MAX_BACKOFF=%dms\n",
			maxReconnectAttempts, initialBackoffMs, maxBackoffMs)
	} else {
		log.Println("재연결 비활성화")
	}

	return &Config{
		ServerURL:            serverURL,
		MessageInterval:      time.Duration(messageIntervalMs) * time.Millisecond,
		HTTPClient:           &http.Client{Timeout: 30 * time.Second},
		EnableReconnect:      enableReconnect,
		MaxReconnectAttempts: maxReconnectAttempts,
		InitialBackoffMs:     initialBackoffMs,
		MaxBackoffMs:         maxBackoffMs,
	}, nil
}

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
