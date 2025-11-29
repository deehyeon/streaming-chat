# STOMP Load Test - 10,000 동시 접속 부하테스트

Go로 작성된 WebSocket/STOMP 프로토콜 부하 테스트 도구입니다.

## 주요 기능

- ✅ **10,000명 동시 접속 지원** - 스테이지 기반으로 점진적 부하 증가
- ✅ **장기간 연결 유지** - 각 워커가 스테이지 duration 동안 연결 유지
- ✅ **정확한 메시지 식별** - 워커별 고유 키로 자기 메시지만 추적
- ✅ STOMP 프로토콜 완벽 지원
- ✅ JWT 인증 통합
- ✅ 실시간 Prometheus 메트릭
- ✅ CSV 리포트 생성

## 빠른 시작

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일 편집
```

```env
TOKEN=your_jwt_token
SERVER_URL=localhost:8080
ROOM_ID=1
MESSAGE_INTERVAL_MS=1000
```

### 2. 의존성 설치

```bash
go mod download
```

### 3. 클라이언트 환경 설정 (10,000 연결 시 필수)

```bash
# Linux: open file limit 증가
ulimit -n 65535

# macOS: 동일
ulimit -n 65535
```

### 4. 모니터링 시작 (선택사항)

```bash
cd ../../monitoring
docker-compose up -d
```

- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

### 5. 부하 테스트 실행

```bash
go run main.go
```

## 스테이지 구성

기본 스테이지 설정 (main.go에서 수정 가능):

| Stage | 이름 | 워커 수 | 유지 시간 |
|-------|------|---------|----------|
| 1 | 워밍업 | 500 | 60초 |
| 2 | 초기 부하 | 2,000 | 90초 |
| 3 | 중간 부하 | 5,000 | 120초 |
| 4 | 피크 부하 | 10,000 | 180초 |
| 5 | 부하 감소 | 5,000 | 60초 |
| 6 | 쿨다운 | 1,000 | 60초 |

각 스테이지에서:
- 워커들이 ramp-up 기간(10초) 동안 점진적으로 생성됨
- 스테이지 duration 동안 연결을 유지하며 주기적으로 메시지 전송
- Grafana에서 안정적인 "동시 접속 N명" 곡선 확인 가능

## 동작 방식

### 이전 버전과의 차이점

| 항목 | 이전 | 현재 |
|------|------|------|
| 워커 동작 | 메시지 1회 전송 후 즉시 종료 | 스테이지 종료까지 연결 유지 |
| 메시지 식별 | senderId만 확인 | 고유 키(workerID-nonce) 사용 |
| 동시 접속 | 불안정 | 안정적 유지 |
| 메시지 전송 | 1회만 | 주기적 반복 (기본 1초) |

### 메시지 식별 방식

```
[W12345-N1] Test message from worker 12345
```

- `W12345`: Worker ID
- `N1`: 해당 워커의 메시지 순번 (nonce)
- 브로드캐스트로 받은 메시지 중 자기 것만 latency 계산

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| TOKEN | ✅ | - | JWT 인증 토큰 |
| SERVER_URL | ✅ | - | 서버 주소 (예: localhost:8080) |
| ROOM_ID | ❌ | API 조회 | 테스트할 채팅방 ID |
| MESSAGE_INTERVAL_MS | ❌ | 1000 | 메시지 전송 간격(ms) |

## Prometheus 메트릭

| 메트릭 | 타입 | 설명 |
|--------|------|------|
| stomp_load_test_active_connections | Gauge | 현재 활성 연결 수 |
| stomp_load_test_messages_sent_total | Counter | 전송된 메시지 총 수 |
| stomp_load_test_messages_received_total | Counter | 수신된 메시지 총 수 |
| stomp_load_test_errors_total | Counter | 오류 총 수 |
| stomp_load_test_message_latency_ms | Histogram | 메시지 왕복 지연 시간 |
| stomp_load_test_websocket_connect_ms | Histogram | WebSocket 연결 시간 |
| stomp_load_test_stomp_connect_ms | Histogram | STOMP 연결 시간 |
| stomp_load_test_current_stage | Gauge | 현재 스테이지 번호 |

## 서버 측 체크리스트

10,000 동시 접속을 위해 서버에서도 튜닝이 필요합니다:

### Linux 서버

```bash
# /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535

# /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
```

### Spring Boot

```yaml
# application.yml
server:
  tomcat:
    max-connections: 15000
    accept-count: 5000
    threads:
      max: 500
```

### Netty (WebSocket)

```java
// Netty worker threads
NettyChannelOption.of(ChannelOption.SO_BACKLOG, 10000);
```

## 트러블슈팅

### "too many open files" 오류

```bash
ulimit -n 65535
```

### 클라이언트 CPU 과부하

- MESSAGE_INTERVAL_MS 값을 늘려 메시지 전송 빈도 감소
- 로그 레벨을 ERROR로 제한

### 서버 연결 거부

- 서버의 max-connections 설정 확인
- WebSocket idle timeout 확인 (heart-beat: 10000,10000 사용 중)

## 리포트

테스트 완료 후 생성되는 파일:

- `load_test.log`: 상세 로그
- `load_test_result.csv`: 통계 데이터

## 아키텍처

```
main.go
├── worker()          # 개별 클라이언트 시뮬레이션
├── readLoop()        # 메시지 수신 고루틴
├── metrics/          # Prometheus 메트릭
└── reports/          # CSV 리포트 생성
```

## 참고 자료

- [Monitoring Guide](../../monitoring/MONITORING.md)
- [Project README](../../README.md)
