# STOMP Load Test 모니터링 가이드

이 문서는 STOMP 부하 테스트의 모니터링 설정 및 사용 방법을 설명합니다.

## 시작하기

### 1. 모니터링 스택 시작

```bash
# 프로젝트 루트에서
cd monitoring
docker-compose up -d
```

이 명령은 다음 서비스를 시작합니다:
- **Prometheus** (포트 9090): 메트릭 수집 및 저장
- **Grafana** (포트 3000): 메트릭 시각화

### 2. 서비스 접속

- **Grafana**: http://localhost:3000
  - 기본 계정: `admin` / `admin`
  - 첫 로그인 후 비밀번호 변경 권장

- **Prometheus**: http://localhost:9090
  - 메트릭 직접 쿼리 및 탐색

### 3. 부하 테스트 실행

```bash
cd ../load-test/stomp  # 새 디렉토리 구조
export JWT_TOKEN="your-token"
go run main.go
```

## 디렉토리 구조

```
streaming-chat/
├── monitoring/                          # 모니터링 스택
│   ├── docker-compose.yml              # Docker Compose 설정
│   ├── prometheus/
│   │   └── prometheus.yml              # Prometheus 설정
│   └── grafana/
│       ├── dashboards/                 # 대시보드 JSON
│       │   └── stomp-load-test-dashboard.json
│       └── provisioning/               # 자동 프로비저닝
│           ├── dashboards/
│           │   └── dashboard.yml
│           └── datasources/
│               └── prometheus.yml
└── load-test/
    └── stomp/                          # 부하 테스트 도구
        ├── main.go
        ├── metrics/
        └── reports/
```

## Prometheus 설정

### 메트릭 수집 대상

`monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 5s
  evaluation_interval: 5s

scrape_configs:
  - job_name: 'stomp-load-test'
    static_configs:
      - targets: ['host.docker.internal:2112']  # 부하 테스트 메트릭
```

### 새로운 메트릭 소스 추가

다른 서비스의 메트릭을 추가하려면:

```yaml
scrape_configs:
  - job_name: 'stomp-load-test'
    static_configs:
      - targets: ['host.docker.internal:2112']
  
  # Spring Boot 애플리케이션 메트릭
  - job_name: 'spring-boot-app'
    static_configs:
      - targets: ['host.docker.internal:8080']
    metrics_path: '/actuator/prometheus'
```

## Grafana 대시보드

### 기본 대시보드

**STOMP Load Test** 대시보드는 자동으로 프로비저닝됩니다:

1. Grafana 로그인
2. 왼쪽 메뉴 → Dashboards
3. "STOMP Load Test" 선택

### 대시보드 구성

#### 연결 메트릭
- **활성 연결 수**: 현재 실시간 WebSocket 연결
- **총 워커 수**: 생성된 전체 워커 수
- **성공률**: 성공한 워커 / 전체 워커

#### 메시지 메트릭
- **초당 메시지 수**: 전송/수신 메시지 처리량
- **누적 메시지 수**: 시작부터 현재까지 총 메시지
- **메시지 처리 비율**: 수신 / 전송

#### 성능 메트릭
- **메시지 지연 시간**:
  - 평균 (mean)
  - 중간값 (p50)
  - 95 백분위수 (p95)
  - 99 백분위수 (p99)
- **연결 시간**:
  - WebSocket 핸드셰이크
  - STOMP 핸드셰이크

#### 오류 메트릭
- **오류 발생률**: 초당 오류 수
- **누적 오류 수**: 총 오류 건수
- **오류 비율**: 오류 / 전체 시도

### 대시보드 커스터마이징

1. 대시보드에서 패널 선택
2. 상단 메뉴 → Edit
3. Query 또는 시각화 옵션 수정
4. 저장

새 대시보드를 영구 저장하려면:

```bash
# Grafana UI에서 대시보드 내보내기
# JSON 파일 저장
cp downloaded.json monitoring/grafana/dashboards/my-dashboard.json

# 컨테이너 재시작
cd monitoring
docker-compose restart grafana
```

## 유용한 Prometheus 쿼리

### 기본 메트릭

```promql
# 현재 활성 연결 수
stomp_load_test_active_connections

# 초당 메시지 전송률 (1분 평균)
rate(stomp_load_test_messages_sent_total[1m])

# 초당 메시지 수신률
rate(stomp_load_test_messages_received_total[1m])
```

### 지연 시간 분석

```promql
# 평균 메시지 지연 시간
rate(stomp_load_test_message_latency_seconds_sum[5m]) /
rate(stomp_load_test_message_latency_seconds_count[5m])

# P95 지연 시간 (5분 윈도우)
histogram_quantile(0.95, 
  rate(stomp_load_test_message_latency_seconds_bucket[5m])
)

# P99 지연 시간
histogram_quantile(0.99, 
  rate(stomp_load_test_message_latency_seconds_bucket[5m])
)
```

### 오류율 분석

```promql
# 초당 오류 발생률
rate(stomp_load_test_connection_errors_total[1m])

# 오류 비율 (백분율)
(
  rate(stomp_load_test_connection_errors_total[5m]) /
  (rate(stomp_load_test_success_total[5m]) + 
   rate(stomp_load_test_connection_errors_total[5m]))
) * 100
```

### 처리량 분석

```promql
# 메시지 처리 비율 (수신/전송)
rate(stomp_load_test_messages_received_total[1m]) /
rate(stomp_load_test_messages_sent_total[1m])

# 피크 메시지 전송률 (최근 1시간)
max_over_time(
  rate(stomp_load_test_messages_sent_total[1m])[1h:]
)
```

## 알림 설정

### Prometheus Alerting 규칙

`monitoring/prometheus/alert_rules.yml` 생성:

```yaml
groups:
  - name: stomp_load_test
    interval: 10s
    rules:
      - alert: HighErrorRate
        expr: |
          rate(stomp_load_test_connection_errors_total[5m]) > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "높은 오류 발생률 감지"
          description: "초당 {{ $value }} 건의 오류가 발생하고 있습니다."
      
      - alert: HighMessageLatency
        expr: |
          histogram_quantile(0.95, 
            rate(stomp_load_test_message_latency_seconds_bucket[5m])
          ) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "높은 메시지 지연 시간"
          description: "P95 지연 시간이 {{ $value }}초입니다."
```

`prometheus.yml`에 규칙 파일 추가:

```yaml
rule_files:
  - 'alert_rules.yml'
```

## 데이터 관리

### 데이터 영속성

메트릭 데이터는 다음 위치에 저장됩니다:

- **Prometheus**: `monitoring/prometheus-data/` (자동 생성)
- **Grafana**: `monitoring/grafana-data/` (자동 생성)

### 데이터 삭제

```bash
cd monitoring

# 컨테이너와 데이터 삭제
docker-compose down -v

# 또는 데이터만 삭제
rm -rf prometheus-data/ grafana-data/
```

### 데이터 보존 기간 설정

`docker-compose.yml`에서 Prometheus 보존 기간 조정:

```yaml
services:
  prometheus:
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'  # 30일 보존
      - '--storage.tsdb.retention.size=10GB' # 최대 10GB
```

## 트러블슈팅

### Prometheus가 메트릭을 수집하지 않음

1. **Targets 확인**: http://localhost:9090/targets
   - 상태가 "UP"인지 확인
   - "DOWN"이면 부하 테스트가 실행 중인지 확인

2. **네트워크 확인**:
   ```bash
   # macOS/Windows: host.docker.internal 사용
   # Linux: host.docker.internal 대신 172.17.0.1 사용
   
   # prometheus.yml 수정 (Linux)
   - targets: ['172.17.0.1:2112']
   ```

3. **방화벽 확인**:
   ```bash
   # 포트 2112가 열려있는지 확인
   telnet localhost 2112
   ```

### Grafana 대시보드가 표시되지 않음

1. **데이터 소스 확인**:
   - Configuration → Data Sources
   - Prometheus가 연결되어 있는지 확인
   - "Test" 버튼 클릭

2. **대시보드 수동 import**:
   - Dashboards → Import
   - `monitoring/grafana/dashboards/stomp-load-test-dashboard.json` 업로드

3. **컨테이너 재시작**:
   ```bash
   docker-compose restart grafana
   ```

### 포트 충돌

다른 애플리케이션이 포트를 사용 중이라면 `docker-compose.yml` 수정:

```yaml
services:
  prometheus:
    ports:
      - "9091:9090"  # 9090 → 9091
  
  grafana:
    ports:
      - "3001:3000"  # 3000 → 3001
```

### 컨테이너 로그 확인

```bash
cd monitoring

# 모든 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs prometheus
docker-compose logs grafana

# 실시간 로그
docker-compose logs -f
```

## 성능 최적화

### Prometheus 최적화

```yaml
# prometheus.yml
global:
  scrape_interval: 15s      # 기본 15초 (부하 감소)
  evaluation_interval: 15s
  
  # 외부 레이블 (여러 Prometheus 사용 시)
  external_labels:
    cluster: 'load-test'
    environment: 'development'
```

### Grafana 최적화

대시보드에서:
- 쿼리 범위를 적절히 제한 (예: 최근 1시간)
- 불필요한 패널 제거
- 자동 새로고침 간격 조정 (5s → 30s)

## 참고 자료

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [STOMP Load Test README](./README.md)
