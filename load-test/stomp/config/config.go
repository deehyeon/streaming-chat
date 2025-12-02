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
	ServerURL       string
	Token           string
	RoomID          int64
	MessageInterval time.Duration
	HTTPClient      *http.Client
	MyMemberId      int64

	// Reconnection settings
	EnableReconnect      bool
	MaxReconnectAttempts int
	InitialBackoffMs     int
	MaxBackoffMs         int
}

type Stage struct {
	Workers  int
	Name     string
	Duration int // 초 단위: 워커들이 연결을 유지하는 시간
}

var (
	// 스테이지 설정 - 10,000명 동시 접속 테스트
	Stages = []Stage{
		{1000, "워밍업", 60},
		{3000, "중간 트래픽 정밀 측정", 300},
	}
)

func Load() (*Config, error) {
	// .env 파일 로드
	if err := godotenv.Load(); err != nil {
		log.Println(".env 파일을 찾지 못했습니다. (운영 환경일 수 있습니다)")
	}

	cfg := &Config{
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}

	// 환경변수 읽기
	cfg.ServerURL = os.Getenv("SERVER_URL")
	if cfg.ServerURL == "" {
		log.Fatal("환경 변수 SERVER_URL 값이 비어 있습니다.")
	}

	// 메시지 전송 간격 설정 (기본값: 1000ms)
	cfg.MessageInterval = 1000 * time.Millisecond
	if messageIntervalStr := os.Getenv("MESSAGE_INTERVAL_MS"); messageIntervalStr != "" {
		if ms, err := strconv.Atoi(messageIntervalStr); err == nil && ms > 0 {
			cfg.MessageInterval = time.Duration(ms) * time.Millisecond
		}
	}

	// Reconnection 설정
	cfg.EnableReconnect = os.Getenv("ENABLE_RECONNECT") == "true"
	cfg.MaxReconnectAttempts = getEnvInt("MAX_RECONNECT_ATTEMPTS", 5)
	cfg.InitialBackoffMs = getEnvInt("INITIAL_BACKOFF_MS", 1000)
	cfg.MaxBackoffMs = getEnvInt("MAX_BACKOFF_MS", 30000)

	log.Println("환경 변수 로드 완료")
	log.Printf("SERVER_URL=%s, MESSAGE_INTERVAL=%v\n", cfg.ServerURL, cfg.MessageInterval)
	if cfg.EnableReconnect {
		log.Printf("재연결 활성화: MAX_ATTEMPTS=%d, INITIAL_BACKOFF=%dms, MAX_BACKOFF=%dms\n",
			cfg.MaxReconnectAttempts, cfg.InitialBackoffMs, cfg.MaxBackoffMs)
	}

	return cfg, nil
}

func getEnvInt(key string, defaultValue int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return defaultValue
}

func (c *Config) SetToken(token string) {
	c.Token = token
}

func (c *Config) SetRoomID(roomID int64) {
	c.RoomID = roomID
}

func (c *Config) SetMyMemberId(memberId int64) {
	c.MyMemberId = memberId
}
