# STOMP Load Test

WebSocket/STOMP 프로토콜 부하 테스트 도구입니다.

## 주요 기능

- ✅ 대규모 동시 WebSocket 연결 지원
- ✅ STOMP 프로토콜 완벽 지원
- ✅ JWT 인증 통합
- ✅ 실시간 Prometheus 메트릭
- ✅ 상세한 HTML 리포트
- ✅ 연결 실패 자동 재시도
- ✅ 단계별 부하 증가 (Staged Load)

## 빠른 시작

### 1. 의존성 설치

```bash
go mod download
```

### 2. 환경변수 설정

```bash
# JWT 토큰 설정 (필수)
export JWT_TOKEN="your-jwt-token-here"

# 서버 URL 설정 (선택, 기본값: localhost:8080)
export TARGET_URL="118.36.152.40:13305"
```

### 3. 모니터링 시작 (선택사항)

```bash
cd ../monitoring  # 새 구조에서는 monitoring 폴더로 이동
docker-compose up -d
```

Grafana: http://localhost:3000 (admin/admin)

### 4. 부하 테스트 실행

```bash
go run main.go
```

## 설정

`main.go`의 `stages` 배열을 수정하여 부하 테스트 시나리오를 조정할 수 있습니다:

```go
stages := []Stage{
    {workers: 300, name: "초기 부하", duration: 10},  // 10초 동안 300명 접속
    {workers: 300, name: "피크 부하", duration: 10},  // 10초 동안 추가 300명
    {workers: 300, name: "최종 부하", duration: 10}, // 10초 동안 추가 300명
}
```

### 설정 항목

- `workers`: 해당 스테이지에서 생성할 워커(클라이언트) 수
- `name`: 스테이지 이름
- `duration`: 워커를 생성하는 데 걸리는 시간 (초)

## 메트릭

### Prometheus 메트릭

부하 테스트는 다음 메트릭을 `http://localhost:2112/metrics`로 노출합니다:

- `stomp_load_test_active_connections`: 현재 활성 연결 수
- `stomp_load_test_messages_sent_total`: 전송된 메시지 총 수
- `stomp_load_test_messages_received_total`: 수신된 메시지 총 수
- `stomp_load_test_connection_errors_total`: 연결 오류 총 수
- `stomp_load_test_success_total`: 성공한 워커 수
- `stomp_load_test_message_latency_seconds`: 메시지 왕복 지연 시간 (히스토그램)
- `stomp_load_test_message_latency_summary`: 메시지 지연 시간 (요약)
- `stomp_load_test_websocket_connect_time_seconds`: WebSocket 연결 시간
- `stomp_load_test_stomp_connect_time_seconds`: STOMP 핸드셰이크 시간
- `stomp_load_test_total_workers`: 전체 워커 수
- `stomp_load_test_current_stage`: 현재 실행 중인 스테이지

### 리포트

테스트 완료 후 다음 파일들이 생성됩니다:

- `load_test_result.csv`: 원시 데이터
- `reports/load_test_report_YYYYMMDD_HHMMSS.html`: HTML 시각화 리포트
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

예제 쿼리:
```promql
# 초당 메시지 전송률
rate(stomp_load_test_messages_sent_total[1m])

# P95 지연 시간
histogram_quantile(0.95, rate(stomp_load_test_message_latency_seconds_bucket[5m]))

# 오류율
rate(stomp_load_test_connection_errors_total[1m])
```

## 아키텍처

```
main.go
├── metrics/metrics.go      # Prometheus 메트릭 정의 및 수집
├── reports/reports.go      # HTML 리포트 생성
└── worker goroutines       # 각 클라이언트 시뮬레이션
    ├── WebSocket 연결
    ├── STOMP 핸드셰이크
    ├── 채널 구독
    ├── 메시지 전송
    └── 메시지 수신 (별도 goroutine)
```

## 트러블슈팅

### "JWT_TOKEN 환경변수가 설정되지 않았습니다" 오류

환경변수를 설정하세요:
```bash
export JWT_TOKEN="eyJhbGci..."
```

### "connection refused" 오류

백엔드 서버가 실행 중인지 확인:
```bash
# Spring Boot 애플리케이션 시작
cd ../../munglog-backend  # 또는 해당 백엔드 경로
./mvnw spring-boot:run
```

### 메모리 부족

워커 수를 줄이거나 시스템 리소스 증가:
```go
stages := []Stage{
    {workers: 100, name: "초기 부하", duration: 10},  // 300 → 100으로 감소
    // ...
}
```

### Data race 경고

Go 1.21 이상에서는 data race가 해결되었습니다. 이전 버전을 사용 중이라면:
```bash
go version  # Go 버전 확인
go get -u golang.org/dl/go1.21  # 최신 버전으로 업그레이드
```

## 보안 주의사항

⚠️ **JWT 토큰을 코드에 하드코딩하지 마세요!** 항상 환경변수를 사용하세요.

```bash
# ✅ 좋은 예
export JWT_TOKEN="..."
go run main.go

# ❌ 나쁜 예
# main.go에 token = "..." 직접 작성
```

## 참고 자료

- [Monitoring Guide](../monitoring/MONITORING.md)
- [Project README](../README.md)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [STOMP Protocol](https://stomp.github.io/)
