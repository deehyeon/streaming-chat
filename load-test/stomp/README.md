# STOMP 채팅 부하 테스트 도구

10,000명의 동시 접속을 시뮬레이션하여 STOMP 기반 채팅 서버의 성능을 측정하는 도구입니다.

## ✨ v2.0 주요 기능

### 🎯 단체 채팅방 지원
- **대규모 브로드캐스트 테스트**: 10,000명이 참여하는 단체방에서 실시간 메시징 성능 측정
- **자동 단체방 생성**: 멤버 ID 지정하여 부하 테스트용 단체 채팅방 자동 생성
- **현실적인 시나리오**: 1명의 메시지가 수천명에게 전달되는 실제 부하 측정

### 🔐 자동화 기능
- **자동 로그인**: 이메일/비밀번호로 JWT 토큰 자동 획득
- **자동 채팅방 관리**: 새 단체방 생성 또는 기존 방 자동 선택
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
- 브로드캐스트 성능 (N:N 메시징)
- 성공/실패율
- 활성 연결 수

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
go mod download
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 중 하나의 방식으로 설정:

#### 🎯 권장: 기존 단체방 사용
```env
SERVER_URL=localhost:8080
EMAIL=test@test.com
PASSWORD=password123!
ROOM_ID=100  # 미리 생성한 단체 채팅방 ID
```

#### 옵션 2: 자동으로 단체방 생성
```env
SERVER_URL=localhost:8080
EMAIL=test@test.com
PASSWORD=password123!
CREATE_NEW_ROOM=true
ROOM_NAME=Load Test Group Room
MEMBER_IDS=1,2,3,4,5  # 멤버 ID 목록
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
| `ROOM_NAME` | 생성할 채팅방 이름 | `Load Test Room {timestamp}` |
| `MEMBER_IDS` | 단체방 멤버 ID (쉼표 구분) | 자동 로그인 시 자신만 포함 |

### 테스트 설정 (선택)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `MESSAGE_INTERVAL_MS` | 메시지 전송 간격 (ms) | `1000` |

## 🎯 사용 시나리오

### 시나리오 1: 단체방 사전 준비 (권장) ⭐

**준비 단계:**
1. 서버에서 단체 채팅방 생성 (예: roomId=100)
2. 테스트 계정들을 모두 채팅방에 추가

**실행:**
```env
SERVER_URL=localhost:8080
EMAIL=test@test.com
PASSWORD=password123!
ROOM_ID=100
```

**장점:**
- 가장 빠르고 안정적
- 반복 테스트에 적합
- 실제 서비스 환경과 동일

### 시나리오 2: 자동 단체방 생성

```env
SERVER_URL=localhost:8080
EMAIL=test@test.com
PASSWORD=password123!
CREATE_NEW_ROOM=true
ROOM_NAME=Load Test 10K Users
MEMBER_IDS=1,2,3,4,5
```

**실행 시:**
1. ✓ 자동 로그인 성공 (memberId=1)
2. ✓ 새 단체 채팅방 생성 완료 (ROOM_ID=123, MEMBERS=[1,2,3,4,5])
3. 부하 테스트 시작...

### 시나리오 3: 토큰으로 빠른 테스트

```env
SERVER_URL=production.example.com:8080
TOKEN=eyJhbGciOiJIUzUxMiJ9...
ROOM_ID=100
```

## 📊 테스트 단계별 가이드

### Phase 1: 소규모 검증 (100-1,000명)
```go
var stages = []Stage{
    {100, "초기 테스트", 60},
    {500, "중간 테스트", 120},
    {1000, "1차 목표", 180},
}
```

**목표:**
- 기본 연결 안정성 확인
- 메시지 전송/수신 정상 작동
- 메트릭 수집 검증

### Phase 2: 중규모 부하 (3,000-5,000명)
```go
var stages = []Stage{
    {3000, "중간 부하", 300},
    {5000, "높은 부하", 600},
}
```

**목표:**
- 브로드캐스트 지연 시간 측정
- 서버 리소스 사용량 모니터링
- 병목 지점 파악

### Phase 3: 대규모 목표 (10,000명)
```go
var stages = []Stage{
    {10000, "최대 부하", 600},
}
```

**목표:**
- 10,000명 동시 접속 유지
- 안정적인 메시지 브로드캐스트
- 서버 확장성 검증

## 🔧 스테이지 설정

`main.go`의 `stages` 변수를 수정하여 테스트 시나리오 변경:

```go
var stages = []Stage{
    {워커수, "설명", 유지시간(초)},
}
```

예시:
```go
var stages = []Stage{
    {1000, "워밍업", 60},           // 1,000명, 60초
    {3000, "중간 부하", 300},       // 3,000명, 300초
    {5000, "높은 부하", 300},       // 5,000명, 300초
    {10000, "최대 부하", 600},      // 10,000명, 600초
}
```

## 📈 모니터링

### Prometheus 메트릭
```bash
curl http://localhost:2112/metrics
```

**주요 메트릭:**
- `websocket_connect_time`: WebSocket 연결 시간 (ms)
- `stomp_connect_time`: STOMP 연결 시간 (ms)
- `message_latency`: 메시지 왕복 지연시간 (ms)
- `active_connections`: 현재 활성 연결 수
- `messages_sent_total`: 전송된 메시지 총 수
- `messages_received_total`: 수신된 메시지 총 수
- `errors_total`: 총 에러 수
- `success_total`: 총 성공 수

### Grafana 대시보드

Prometheus 데이터 소스 추가 후 메트릭 시각화 가능

## 📄 테스트 결과

테스트 완료 후 `load_test_result.csv` 파일이 생성됩니다:

```csv
Metric,Value
Total Workers,10000
Total Test Duration,900.5s
WebSocket Connect Time (avg),45.3ms
STOMP Connect Time (avg),12.7ms
Message Latency (avg),123.5ms
Message Latency (p95),245.8ms
Message Latency (p99),412.3ms
Messages Sent,3000000
Messages Received,2998500
Success Rate,99.95%
Error Count,1500
```

## 🎓 부하 테스트 모범 사례

### 1. 점진적 부하 증가 (Ramp-up)
- 10초에 걸쳐 워커를 점진적으로 생성
- 서버가 연결을 안정적으로 받을 시간 확보

### 2. 충분한 유지 시간
- 최소 5분 이상 연결 유지 권장
- 메모리 누수, 성능 저하 패턴 관찰

### 3. 메시지 전송 간격 조절
- 너무 짧으면: 서버 과부하, 비현실적
- 너무 길면: 실제 사용 패턴과 차이
- 권장: 1초 (일반 채팅) ~ 10초 (조용한 채팅)

### 4. 모니터링 필수
- 서버 CPU, 메모리, 네트워크 사용량
- 데이터베이스 쿼리 성능
- Redis/메시지 큐 상태

## 🚨 문제 해결

### "자동 로그인 실패"
- 이메일/비밀번호 확인
- 서버 URL 확인 (프로토콜 제외)
- 로그인 API 엔드포인트 확인 (`/api/v1/auth/login`)

### "단체 채팅방 생성 실패"
- 토큰 유효성 확인
- API 엔드포인트 확인 (`/api/v1/chat/rooms/group`)
- MEMBER_IDS 형식 확인 (쉼표로 구분)
- 권한 확인

### "WebSocket 연결 실패"
- 서버 WebSocket 엔드포인트 확인 (`/ws-stomp`)
- 방화벽/포트 설정 확인
- 서버 최대 연결 수 설정 확인

### "메시지 수신율 낮음"
- 서버 브로드캐스트 성능 병목
- 네트워크 대역폭 부족
- Redis Pub/Sub 설정 확인
- 메시지 큐 오버플로우

## 🆚 1:1 vs 단체 채팅방 비교

### 1:1 채팅방 (비권장)
```
채팅방 5,000개 × 2명 = 10,000 연결
메시지 1개 → 1명 수신
브로드캐스트 부하: 낮음
```

### 단체 채팅방 (권장) ⭐
```
채팅방 1개 × 10,000명 = 10,000 연결
메시지 1개 → 9,999명 수신
브로드캐스트 부하: 약 10,000배!
```

**결론**: 단체 채팅방으로 테스트해야 실제 부하를 측정할 수 있습니다!

## 📦 버전 히스토리

### v2.0 (현재)
- ✅ 단체 채팅방 지원
- ✅ 자동 로그인 기능
- ✅ 단체방 자동 생성
- ✅ Graceful shutdown
- ✅ Pending 메시지 타임아웃 정리
- ✅ 향상된 에러 핸들링
- ✅ MemberId 자동 추출

### v1.0
- ✅ 기본 부하 테스트
- ✅ Prometheus 메트릭
- ✅ CSV 리포트

## 🤝 기여

이슈나 개선 사항은 GitHub Issues에 등록해주세요.

## 📄 라이선스

MIT
