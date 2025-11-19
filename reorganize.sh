#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Repository Reorganization Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 현재 위치 확인
if [ ! -d "stomp-load-test" ]; then
    echo -e "${YELLOW}Error: stomp-load-test directory not found!${NC}"
    echo "Please run this script from the repository root."
    exit 1
fi

echo -e "${GREEN}Step 1: Creating new directory structure...${NC}"
mkdir -p load-test/stomp
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/provisioning/datasources

echo -e "${GREEN}Step 2: Moving monitoring files...${NC}"
# Prometheus
cp stomp-load-test/prometheus.yml monitoring/prometheus/
cp stomp-load-test/MONITORING.md monitoring/
cp stomp-load-test/docker-compose.yml monitoring/

# Grafana
cp -r stomp-load-test/grafana/* monitoring/grafana/

echo -e "${GREEN}Step 3: Moving load test files...${NC}"
# Load test files
cp stomp-load-test/main.go load-test/stomp/
cp stomp-load-test/go.mod load-test/stomp/
cp stomp-load-test/go.sum load-test/stomp/
cp stomp-load-test/.gitignore load-test/stomp/
cp -r stomp-load-test/metrics load-test/stomp/
cp -r stomp-load-test/reports load-test/stomp/

echo -e "${GREEN}Step 4: Updating docker-compose.yml paths...${NC}"
# Update prometheus.yml path in docker-compose
sed -i 's|./prometheus.yml|./prometheus/prometheus.yml|g' monitoring/docker-compose.yml

# Update grafana paths in docker-compose
sed -i 's|./grafana/provisioning|./grafana/provisioning|g' monitoring/docker-compose.yml
sed -i 's|./grafana/dashboards|./grafana/dashboards|g' monitoring/docker-compose.yml

echo -e "${GREEN}Step 5: Creating README files...${NC}"

# Create load-test README
cat > load-test/README.md << 'EOF'
# Load Testing Tools

이 디렉토리는 streaming-chat 프로젝트의 다양한 부하 테스트 도구들을 포함합니다.

## 디렉토리 구조

```
load-test/
├── stomp/          # WebSocket/STOMP 부하 테스트
└── README.md       # 이 파일
```

## Available Tests

### STOMP Load Test (`stomp/`)
WebSocket과 STOMP 프로토콜을 사용하는 채팅 시스템의 부하 테스트 도구입니다.

- **언어**: Go
- **기능**: 
  - 10,000+ 동시 WebSocket 연결
  - 실시간 메트릭 수집
  - Prometheus 통합
  - 상세한 성능 리포트

자세한 내용은 [stomp/README.md](./stomp/README.md)를 참조하세요.

## Future Tests

향후 추가될 테스트 도구들:

- **HTTP Load Test**: REST API 엔드포인트 부하 테스트
- **Integration Test**: 전체 시스템 통합 테스트
- **Stress Test**: 시스템 한계 테스트

## Monitoring

모든 부하 테스트의 모니터링은 [`../monitoring`](../monitoring/) 디렉토리의 Prometheus와 Grafana를 사용합니다.

```bash
# 모니터링 시작
cd ../monitoring
docker-compose up -d

# 부하 테스트 실행
cd ../load-test/stomp
go run main.go
```

## 개발 가이드

새로운 부하 테스트를 추가할 때:

1. `load-test/` 하위에 새 디렉토리 생성
2. README.md 작성
3. Prometheus 메트릭 통합
4. 이 파일에 테스트 도구 문서화

## 참고 자료

- [Monitoring Setup](../monitoring/MONITORING.md)
- [Project Documentation](../README.md)
EOF

# Create load-test/stomp README
cat > load-test/stomp/README.md << 'EOF'
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
EOF

# Create monitoring README
cat > monitoring/README.md << 'EOF'
# Monitoring Stack

streaming-chat 프로젝트의 통합 모니터링 스택입니다.

## 구성 요소

- **Prometheus**: 메트릭 수집 및 저장
- **Grafana**: 메트릭 시각화 및 대시보드

## 빠른 시작

### 1. 시작

```bash
docker-compose up -d
```

### 2. 접속

- **Grafana**: http://localhost:3000
  - 기본 계정: `admin` / `admin`
  - 대시보드가 자동으로 프로비저닝됩니다

- **Prometheus**: http://localhost:9090
  - 메트릭 쿼리 및 탐색

### 3. 종료

```bash
docker-compose down
```

## 디렉토리 구조

```
monitoring/
├── docker-compose.yml              # Docker Compose 설정
├── prometheus/
│   └── prometheus.yml              # Prometheus 설정
├── grafana/
│   ├── dashboards/                 # 대시보드 JSON 파일
│   │   └── stomp-load-test-dashboard.json
│   └── provisioning/               # 자동 프로비저닝 설정
│       ├── dashboards/
│       │   └── dashboard.yml
│       └── datasources/
│           └── prometheus.yml
├── MONITORING.md                   # 상세 가이드
└── README.md                       # 이 파일
```

## 사용 가능한 대시보드

### STOMP Load Test Dashboard

WebSocket/STOMP 부하 테스트의 실시간 모니터링:

- **연결 메트릭**
  - 활성 연결 수
  - 연결 성공/실패율
  - 연결 지속 시간

- **메시지 메트릭**
  - 초당 메시지 수 (전송/수신)
  - 총 메시지 수
  - 메시지 처리량

- **성능 메트릭**
  - 메시지 지연 시간 (평균, P95, P99)
  - 지연 시간 히스토그램
  - 시간대별 추이

- **오류 메트릭**
  - 오류 발생률
  - 오류 유형별 분류
  - 오류 추이

## 메트릭 수집 대상

현재 Prometheus는 다음 대상에서 메트릭을 수집합니다:

- `localhost:8081/metrics` - STOMP Load Test 메트릭
- (향후 추가) Spring Boot 애플리케이션 메트릭
- (향후 추가) 시스템 메트릭

## 커스터마이징

### 새로운 메트릭 소스 추가

`prometheus/prometheus.yml`에 새로운 job 추가:

```yaml
scrape_configs:
  - job_name: 'my-new-service'
    static_configs:
      - targets: ['localhost:8082']
```

### 새로운 대시보드 추가

1. Grafana UI에서 대시보드 생성
2. JSON 모델 내보내기
3. `grafana/dashboards/`에 저장
4. 컨테이너 재시작 (자동 로드됨)

## 데이터 영속성

- **Prometheus**: `./prometheus-data` (자동 생성)
- **Grafana**: `./grafana-data` (자동 생성)

데이터를 삭제하려면:
```bash
docker-compose down -v
```

## 트러블슈팅

### 포트 충돌

이미 사용 중인 포트가 있다면 `docker-compose.yml`에서 변경:

```yaml
services:
  grafana:
    ports:
      - "3001:3000"  # 3000 대신 3001 사용
```

### 대시보드가 안 보임

1. Grafana 재시작: `docker-compose restart grafana`
2. 수동 import: Configuration → Data Sources → Prometheus 확인

### 메트릭이 수집되지 않음

1. Prometheus targets 확인: http://localhost:9090/targets
2. 수집 대상 애플리케이션이 실행 중인지 확인
3. `prometheus.yml`의 targets 주소 확인

## 참고 자료

- [상세 모니터링 가이드](./MONITORING.md)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
EOF

echo -e "${GREEN}Step 6: Creating top-level README update guide...${NC}"
cat > load-test-migration-notes.md << 'EOF'
# Repository Reorganization

## 변경 사항

### Before
```
streaming-chat/
└── stomp-load-test/
    ├── main.go (부하테스트)
    ├── grafana/ (모니터링)
    ├── prometheus.yml (모니터링)
    └── docker-compose.yml (모니터링)
```

### After
```
streaming-chat/
├── load-test/
│   └── stomp/           # WebSocket/STOMP 부하테스트
│       ├── main.go
│       ├── metrics/
│       └── reports/
│
└── monitoring/          # 전체 프로젝트 모니터링
    ├── prometheus/
    ├── grafana/
    └── docker-compose.yml
```

## 다음 단계

1. ✅ 새 디렉토리 구조 생성
2. ✅ 파일 복사 완료
3. ✅ 설정 파일 경로 수정
4. ✅ README 파일 생성

### 수동으로 해야 할 작업

```bash
# 1. 변경사항 커밋
git add load-test/ monitoring/ load-test-migration-notes.md
git commit -m "refactor: Separate monitoring and load-test directories

- Move monitoring tools (Prometheus, Grafana) to monitoring/
- Reorganize load tests under load-test/ for future expansion
- Update documentation and paths
- Prepare structure for additional test types"

# 2. 기존 디렉토리 삭제 (선택사항)
git rm -r stomp-load-test/
git commit -m "chore: Remove old stomp-load-test directory"

# 3. Push
git push origin refactor/separate-monitoring-and-load-test
```

## 브랜치 정보

- 브랜치 이름: `refactor/separate-monitoring-and-load-test`
- 이미 생성되어 있습니다

## 추가 작업 (선택사항)

### 루트 README.md 업데이트

프로젝트 루트의 README.md에 다음 섹션 추가:

```markdown
## Project Structure

\`\`\`
streaming-chat/
├── backend/         # Spring Boot backend
├── frontend/        # React/Vue frontend
├── load-test/       # Performance testing tools
│   └── stomp/       # WebSocket load testing
└── monitoring/      # Monitoring stack (Prometheus, Grafana)
\`\`\`

## Testing

### Load Testing

See [load-test/README.md](./load-test/README.md)

### Monitoring

See [monitoring/README.md](./monitoring/README.md)
```

## 향후 계획

이제 다른 종류의 테스트를 쉽게 추가할 수 있습니다:

```
load-test/
├── stomp/           # ✅ 완료
├── http/            # 📝 예정: REST API 부하테스트
├── integration/     # 📝 예정: 통합 테스트
└── stress/          # 📝 예정: 스트레스 테스트
```
EOF

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Reorganization complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the new structure"
echo -e "2. Check 'load-test-migration-notes.md' for commit instructions"
echo -e "3. Test the new paths"
echo -e "\n${BLUE}New structure:${NC}"
tree -L 3 -I 'node_modules|vendor' load-test monitoring 2>/dev/null || find load-test monitoring -type f | head -20

echo -e "\n${GREEN}Done! 🎉${NC}"
