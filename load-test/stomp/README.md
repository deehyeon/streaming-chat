# STOMP 채팅 부하 테스트 도구

10,000명의 동시 접속을 시뮬레이션하여 STOMP 기반 채팅 서버의 성능을 측정하는 도구입니다.

## 주요 기능

### ✨ 자동화 기능
- **자동 로그인**: 이메일/비밀번호로 JWT 토큰 자동 획득
- **자동 채팅방 관리**: 새 채팅방 생성 또는 기존 방 자동 선택
- **Graceful Shutdown**: Ctrl+C로 안전한 종료
- **메모리 관리**: 타임아웃된 메시지 자동 정리

### 📊 모니터링
- **실시간 메트릭**: Prometheus 메트릭 서버 (포트 2112)
- **상세 리포트**: CSV 형식의 테스트 결과
- **진행 상황 출력**: 실시간 워커 생성 및 메시지 전송 현황

### 🔍 측정 지표
- WebSocket 연결 시간
- STOMP 연결 시간
- 메시지 왕복 지연시간 (RTT)
- 성공/실패율
- 활성 연결 수

## 설치 및 실행

### 1. 의존성 설치
```bash
go mod download
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 중 하나의 방식으로 설정:

#### 방법 1: 토큰 직접 입력 (빠른 테스트)
```env
SERVER_URL=localhost:8080
TOKEN=your_jwt_token_here
ROOM_ID=1
```

#### 방법 2: 자동 로그인 + 기존 방 사용 (권장)
```env
SERVER_URL=localhost:8080
EMAIL=test@example.com
PASSWORD=your_password
# ROOM_ID 생략 시 첫 번째 채팅방 자동 선택
```

#### 방법 3: 자동 로그인 + 새 채팅방 생성
```env
SERVER_URL=localhost:8080
EMAIL=test@example.com
PASSWORD=your_password
CREATE_NEW_ROOM=true
ROOM_NAME=Load Test Room
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

## 환경 변수 상세

### 필수 설정
| 변수 | 설명 | 예시 |
|------|------|------|
| `SERVER_URL` | 서버 주소 (프로토콜 제외) | `localhost:8080` |

### 인증 설정 (택1)
| 변수 | 설명 | 예시 |
|------|------|------|
| `TOKEN` | JWT 토큰 직접 입력 | `eyJhbGciOiJIUzI1...` |
| `EMAIL` + `PASSWORD` | 자동 로그인용 계정 정보 | `test@example.com` |

### 채팅방 설정 (선택)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ROOM_ID` | 채팅방 ID 직접 지정 | 자동 선택 |
| `CREATE_NEW_ROOM` | 새 채팅방 생성 여부 | `false` |
| `ROOM_NAME` | 생성할 채팅방 이름 | `Load Test Room {timestamp}` |

### 테스트 설정 (선택)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `MESSAGE_INTERVAL_MS` | 메시지 전송 간격 (ms) | `1000` |

## 사용 예시

### 시나리오 1: 처음 사용하는 경우
```env
SERVER_URL=localhost:8080
EMAIL=test@example.com
PASSWORD=testpass123
CREATE_NEW_ROOM=true
```

실행 시:
1. ✓ 자동 로그인 성공
2. ✓ 새 채팅방 생성 완료 (ROOM_ID=123, NAME=Load Test Room 2024-01-15 10:30:00)
3. 부하 테스트 시작...

### 시나리오 2: 기존 계정으로 빠른 테스트
```env
SERVER_URL=production.example.com:8080
EMAIL=loadtest@example.com
PASSWORD=secure_password
```

실행 시:
1. ✓ 자동 로그인 성공
2. ✓ 기존 채팅방 조회 완료 (ROOM_ID=456)
3. 부하 테스트 시작...

### 시나리오 3: 반복 테스트 (토큰 재사용)
```env
SERVER_URL=localhost:8080
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ROOM_ID=789
```

## 스테이지 설정

`main.go`의 `stages` 변수를 수정하여 테스트 시나리오 변경:

```go
var stages = []Stage{
    {1000, "워밍업", 60},           // 1,000명, 60초
    {5000, "중간 부하", 300},       // 5,000명, 300초
    {10000, "최대 부하", 600},      // 10,000명, 600초
}
```

## 모니터링

### Prometheus 메트릭
```bash
curl http://localhost:2112/metrics
```

주요 메트릭:
- `websocket_connect_time`: WebSocket 연결 시간 (ms)
- `stomp_connect_time`: STOMP 연결 시간 (ms)
- `message_latency`: 메시지 왕복 지연시간 (ms)
- `active_connections`: 현재 활성 연결 수
- `messages_sent_total`: 전송된 메시지 총 수
- `messages_received_total`: 수신된 메시지 총 수

### Grafana 대시보드

Prometheus 데이터 소스 추가 후 메트릭 시각화 가능

## 테스트 결과

테스트 완료 후 `load_test_result.csv` 파일이 생성됩니다:

```csv
Metric,Value
Total Workers,10000
Total Test Duration,900.5s
...
```

## 개선 사항

### v2.0 (현재 버전)
- ✅ 자동 로그인 기능
- ✅ 채팅방 자동 생성/선택
- ✅ Graceful shutdown
- ✅ Pending 메시지 타임아웃 정리
- ✅ 향상된 에러 핸들링

### v1.0
- ✅ 기본 부하 테스트
- ✅ Prometheus 메트릭
- ✅ CSV 리포트

## 문제 해결

### "자동 로그인 실패"
- 이메일/비밀번호 확인
- 서버 URL 확인 (프로토콜 제외)
- 로그인 API 엔드포인트 확인 (`/api/v1/auth/login`)

### "채팅방 조회/생성 실패"
- 토큰 유효성 확인
- API 엔드포인트 확인 (`/api/v1/chat/rooms`)
- 권한 확인

### "WebSocket 연결 실패"
- 서버 WebSocket 엔드포인트 확인 (`/ws-stomp`)
- 방화벽/포트 설정 확인

## 라이선스

MIT
