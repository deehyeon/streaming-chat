# STOMP Load Test

Go로 작성된 WebSocket/STOMP 프로토콜 부하 테스트 도구입니다.

## 기능

- ✅ 10,000+ 동시 WebSocket 연결 지원
- ✅ STOMP 프로토콜 완벽 지원
- ✅ JWT 인증 통합
- ✅ 실시간 Prometheus 메트릭
- ✅ 상세한 HTML 리포트
- ✅ 연결 실패 자동 재시도

## 빠른 시작

### 1. 의존성 설치

```bash
go mod download
```

### 2. 모니터링 시작 (선택사항)

```bash
cd ../../monitoring
docker-compose up -d
```

Grafana: http://localhost:3000 (admin/admin)

### 3. 부하 테스트 실행

```bash
go run main.go
```

## 설정

`main.go`에서 다음 파라미터를 수정할 수 있습니다:

```go
const (
    NumClients   = 10000              // 동시 접속 클라이언트 수
    NumRooms     = 10                 // 채팅방 수
    TestDuration = 5 * time.Minute    // 테스트 실행 시간
    RampUpPeriod = 1 * time.Minute    // 클라이언트 증가 시간
)
```

## 메트릭

### Prometheus 메트릭

- `chat_active_connections`: 현재 활성 연결 수
- `chat_messages_sent_total`: 전송된 메시지 총 수
- `chat_messages_received_total`: 수신된 메시지 총 수
- `chat_connection_errors_total`: 연결 오류 총 수
- `chat_message_latency_seconds`: 메시지 지연 시간

### 리포트

테스트 완료 후 `reports/` 디렉토리에 HTML 리포트가 생성됩니다:
- 연결 성공/실패 통계
- 메시지 처리량
- 평균/중간값/P95/P99 지연 시간
- 시간대별 차트

## 모니터링

### Grafana 대시보드

1. Grafana 접속: http://localhost:3000
2. Dashboards → STOMP Load Test
3. 실시간 메트릭 확인:
   - 활성 연결 수
   - 초당 메시지 수
   - 지연 시간 분포
   - 오류율

### Prometheus

직접 쿼리: http://localhost:9090

## 아키텍처

```
main.go
├── metrics/metrics.go      # Prometheus 메트릭 수집
├── reports/reports.go      # HTML 리포트 생성
└── WebSocket 클라이언트 풀
```

## 트러블슈팅

### "connection refused" 오류

백엔드 서버가 실행 중인지 확인:
```bash
# Spring Boot 애플리케이션 시작
cd ../../backend
./mvnw spring-boot:run
```

### 메모리 부족

클라이언트 수를 줄이거나 시스템 리소스 증가:
```go
const NumClients = 5000  // 절반으로 감소
```

## 참고 자료

- [Monitoring Guide](../../monitoring/MONITORING.md)
- [Project README](../../README.md)
