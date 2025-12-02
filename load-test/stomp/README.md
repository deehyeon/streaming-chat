# STOMP 채팅 부하 테스트 도구 v3.0 🚀

10,000명의 동시 접속을 시뮬레이션하여 STOMP 기반 채팅 서버의 성능을 측정하는 도구입니다.

## ✨ v3.0 주요 업데이트

### 🔄 재연결 및 백오프 기능
- **Exponential Backoff**: `github.com/cenkalti/backoff/v4` 라이브러리 사용
- **자동 재연결**: 연결 끊김 시 지능적인 재연결 시도
- **Jitter 적용**: 동시 재연결로 인한 thundering herd 방지
- **재연결 메트릭**: 재연결 시도 횟수 및 소요 시간 측정

### 📊 향상된 모니터링
- **연결 유지 시간**: 각 워커의 WebSocket 연결 유지 시간 측정
- **재연결 통계**: 재연결 빈도 및 성공률 추적
- **Prometheus 메트릭 추가**:
  - `stomp_load_test_websocket_duration_seconds`: WebSocket 연결 유지 시간
  - `stomp_load_test_connection_retries_total`: 총 재연결 시도 횟수
  - `stomp_load_test_reconnection_time_ms`: 재연결 소요 시간
  - `stomp_load_test_active_reconnections`: 현재 재연결 중인 워커 수

### 🏗️ 코드 리팩토링
- **모듈화된 구조**: 역할별로 패키지 분리
  ```
  load-test/stomp/
  ├── auth/          # 인증 관련 로직
  ├── chat/          # 채팅방 관리
  ├── config/        # 설정 관리
  ├── connection/    # WebSocket 연결 및 재연결
  ├── messaging/     # 메시지 송수신
  ├── metrics/       # Prometheus 메트릭
  ├── reports/       # 테스트 결과 리포트
  ├── worker/        # 워커 로직
  └── main.go        # 메인 진입점 (간결화)
  ```
- **유지보수성 향상**: 각 패키지가 명확한 책임을 가짐
- **테스트 용이성**: 모듈별 독립적 테스트 가능

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
go mod download
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음과 같이 설정:

```env
# 서버 설정
SERVER_URL=localhost:8080

# 인증 (TOKEN 또는 EMAIL/PASSWORD)
EMAIL=test@test.com
PASSWORD=password123!

# 채팅방 (ROOM_ID 또는 CREATE_NEW_ROOM)
ROOM_ID=100

# 재연결 설정 (v3.0 신규)
ENABLE_RECONNECT=true
MAX_RECONNECT_ATTEMPTS=5
INITIAL_BACKOFF_MS=1000
MAX_BACKOFF_MS=30000
```

### 3. 실행
```bash
go run main.go
```

또는 빌드 후 실행:
```bash
go build -o stomp-load-test
./stomp-load-test
```

## 📋 환경 변수 상세

### 필수 설정
| 변수 | 설명 | 예시 |
|------|------|------|
| `SERVER_URL` | 서버 주소 (프로토콜 제외) | `localhost:8080` |

### 인증 설정 (택1)
| 변수 | 설명 | 예시 |
|------|------|------|
| `TOKEN` | JWT 토큰 직접 입력 | `eyJhbGciOiJIUzI1...` |
| `EMAIL` + `PASSWORD` | 자동 로그인용 계정 정보 | `test@test.com` |

### 채팅방 설정 (택1)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ROOM_ID` | 단체 채팅방 ID 직접 지정 | 자동 선택 |
| `CREATE_NEW_ROOM` | 새 단체방 생성 여부 | `false` |
| `MEMBER_IDS` | 단체방 멤버 ID (쉼표 구분) | - |

### 재연결 설정 (v3.0 신규)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ENABLE_RECONNECT` | 재연결 기능 활성화 | `false` |
| `MAX_RECONNECT_ATTEMPTS` | 최대 재연결 시도 횟수 | `5` |
| `INITIAL_BACKOFF_MS` | 초기 백오프 시간 (ms) | `1000` |
| `MAX_BACKOFF_MS` | 최대 백오프 시간 (ms) | `30000` |

### 테스트 설정 (선택)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `MESSAGE_INTERVAL_MS` | 메시지 전송 간격 (ms) | `1000` |

## 🔍 측정 지표

### 연결 성능
- **WebSocket 연결 시간**: Handshake 완료까지의 시간
- **STOMP 연결 시간**: STOMP CONNECT → CONNECTED 시간
- **연결 유지 시간**: 각 워커의 WebSocket 연결 유지 시간 (v3.0 신규)

### 메시지 성능
- **메시지 왕복 지연시간 (RTT)**: 메시지 전송 → 수신까지의 시간
- **브로드캐스트 성능**: N:N 메시징 처리 능력
- **처리량**: 초당 메시지 전송/수신 수

### 안정성
- **성공률**: 정상 연결 및 메시지 처리 비율
- **에러율**: 연결 실패 및 메시지 전송 실패 비율
- **재연결 통계**: 재연결 빈도 및 성공률 (v3.0 신규)

## 📊 Prometheus 메트릭

### 카운터 (Counter)
- `stomp_load_test_messages_sent_total`: 전송된 메시지 총 수
- `stomp_load_test_messages_received_total`: 수신된 메시지 총 수
- `stomp_load_test_errors_total`: 총 에러 수
- `stomp_load_test_connection_retries_total`: 총 재연결 시도 횟수 (v3.0 신규)

### 게이지 (Gauge)
- `stomp_load_test_active_connections`: 현재 활성 연결 수
- `stomp_load_test_active_reconnections`: 현재 재연결 중인 워커 수 (v3.0 신규)
- `stomp_load_test_avg_connection_duration_seconds`: 평균 연결 유지 시간 (v3.0 신규)

### 히스토그램 (Histogram)
- `stomp_load_test_message_latency_ms`: 메시지 지연시간 분포
- `stomp_load_test_websocket_connect_ms`: WebSocket 연결 시간 분포
- `stomp_load_test_websocket_duration_seconds`: 연결 유지 시간 분포 (v3.0 신규)
- `stomp_load_test_reconnection_time_ms`: 재연결 소요 시간 분포 (v3.0 신규)

### Grafana 쿼리 예시

```promql
# 평균 메시지 지연시간
rate(stomp_load_test_message_latency_ms_sum[5m]) / 
rate(stomp_load_test_message_latency_ms_count[5m])

# 재연결 빈도 (분당)
rate(stomp_load_test_connection_retries_total[1m]) * 60

# P95 연결 유지 시간
histogram_quantile(0.95, stomp_load_test_websocket_duration_seconds_bucket)

# 활성 연결 수 추이
stomp_load_test_active_connections
```

## 🎯 스테이지 설정

`config/config.go`의 `Stages` 변수를 수정하여 테스트 시나리오 변경:

```go
var Stages = []Stage{
    {1000, "워밍업", 60},           // 1,000명, 60초
    {3000, "중간 부하", 300},       // 3,000명, 300초
    {5000, "높은 부하", 300},       // 5,000명, 300초
    {10000, "최대 부하", 600},      // 10,000명, 600초
}
```

## 🔧 재연결 동작 방식

### Exponential Backoff
```
재시도 1: 1초 후
재시도 2: 2초 후
재시도 3: 4초 후
재시도 4: 8초 후
재시도 5: 16초 후
...
최대: 30초 (MAX_BACKOFF_MS)
```

### Jitter (랜덤화)
- 각 재연결 시도 시간에 ±50% 랜덤 값 추가
- 동시 재연결로 인한 서버 부하 분산
- Thundering herd 문제 방지

### 재연결 트리거
- WebSocket 연결 끊김
- STOMP 핸드셰이크 실패
- 메시지 전송 실패 (타임아웃 제외)

## 📄 테스트 결과

테스트 완료 후 `load_test_result.csv` 파일이 생성됩니다:

```csv
Metric,Value,Unit
total_workers,10000,
test_duration_seconds,900.5,
websocket_connect_avg,45.3,ms
message_latency_avg,123.5,ms
message_latency_p95,245.8,ms
success_rate,99.95,%
connection_retries_total,150,
```

## 🚨 문제 해결

### "WebSocket 연결 실패" (재연결 활성화 시)
- 자동으로 재연결 시도됨
- `MAX_RECONNECT_ATTEMPTS` 초과 시 워커 종료
- 메트릭에서 재연결 빈도 확인

### "재연결이 너무 자주 발생"
- `INITIAL_BACKOFF_MS` 값 증가 (예: 2000)
- `MAX_BACKOFF_MS` 값 증가 (예: 60000)
- 서버 성능 및 네트워크 상태 점검

### "재연결이 실패함"
- 서버 로그 확인
- 토큰 유효기간 확인
- 방화벽 설정 확인

## 📦 버전 히스토리

### v3.0 (현재)
- ✅ Exponential Backoff 재연결 기능
- ✅ 연결 유지 시간 모니터링
- ✅ 재연결 메트릭 추가
- ✅ 코드 리팩토링 (모듈화)
- ✅ 향상된 에러 핸들링

### v2.0
- ✅ 단체 채팅방 지원
- ✅ 자동 로그인 기능
- ✅ Graceful shutdown
- ✅ Pending 메시지 타임아웃 정리

### v1.0
- ✅ 기본 부하 테스트
- ✅ Prometheus 메트릭
- ✅ CSV 리포트

## 🤝 기여

이슈나 개선 사항은 GitHub Issues에 등록해주세요.

## 📄 라이선스

MIT
