# 📊 Prometheus & Grafana 모니터링 가이드

## 🎯 개요

부하테스트 실행 중 실시간으로 메트릭을 수집하고 Grafana 대시보드에서 시각화할 수 있습니다.

## 🚀 빠른 시작

### 1. Docker Compose로 Prometheus + Grafana 시작

```bash
# stomp-load-test 폴더에서
docker-compose up -d
```

이 명령어로 다음이 자동으로 실행됩니다:
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000`

### 2. 부하테스트 실행

```bash
go run main.go
```

부하테스트가 시작되면:
- Prometheus 메트릭 서버: `http://localhost:2112/metrics`
- 테스트 실행 중에도 메트릭이 실시간으로 수집됩니다

### 3. Grafana 대시보드 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인:
   - Username: `admin`
   - Password: `admin`
3. "STOMP Load Test Dashboard" 선택

## 📈 대시보드 패널 설명

### 1. **Active Connections**
- 현재 활성 WebSocket 연결 수
- 실시간으로 증가/감소 추이 확인

### 2. **Message Latency P95**
- 메시지 왕복 지연시간 95번째 백분위
- 게이지로 표시, 임계값 설정 (녹색/노랑/빨강)

### 3. **Message Latency Percentiles**
- P50, P90, P95, P99 백분위 지연시간
- 시간에 따른 추이 그래프

### 4. **Message Throughput**
- 초당 메시지 전송/수신 속도
- 처리량(throughput) 확인

### 5. **Connection Time P95**
- WebSocket 및 STOMP 연결 시간
- P95 백분위 비교

### 6. **Success vs Error Rate**
- 성공/실패 비율
- 초당 발생 횟수

### 7. **Summary Stats**
- Total Workers: 총 워커 수
- Messages Sent: 총 전송 메시지
- Messages Received: 총 수신 메시지
- Total Errors: 총 에러 수

## 🔧 커스터마이징

### Prometheus 설정 변경

`prometheus.yml` 파일 수정:

```yaml
global:
  scrape_interval: 5s  # 메트릭 수집 주기 변경

scrape_configs:
  - job_name: 'stomp-load-test'
    static_configs:
      - targets: ['host.docker.internal:2112']
```

### Grafana 대시보드 커스터마이징

1. Grafana에서 대시보드 열기
2. 우측 상단 ⚙️ (Settings) 클릭
3. "JSON Model" 탭에서 수정
4. `grafana/dashboards/stomp-load-test-dashboard.json`에 저장

### 새로운 메트릭 추가

#### 1. `metrics/metrics.go`에 메트릭 정의

```go
var CustomMetric = promauto.NewGauge(prometheus.GaugeOpts{
    Name: "stomp_load_test_custom_metric",
    Help: "Custom metric description",
})
```

#### 2. `main.go`에서 메트릭 업데이트

```go
metrics.CustomMetric.Set(someValue)
```

#### 3. Grafana 대시보드에 패널 추가

```
PromQL: stomp_load_test_custom_metric
```

## 📊 유용한 PromQL 쿼리

### 평균 지연시간
```promql
rate(stomp_load_test_message_latency_ms_sum[1m]) / rate(stomp_load_test_message_latency_ms_count[1m])
```

### 에러율 (%)
```promql
(rate(stomp_load_test_errors_total[1m]) / rate(stomp_load_test_messages_sent_total[1m])) * 100
```

### 처리량 (messages/sec)
```promql
rate(stomp_load_test_messages_received_total[1m])
```

### 백분위 지연시간
```promql
histogram_quantile(0.95, rate(stomp_load_test_message_latency_ms_bucket[1m]))
```

## 🐛 문제 해결

### Prometheus가 메트릭을 수집하지 못함

**증상**: Grafana에 "No data" 표시

**해결**:
1. `http://localhost:2112/metrics` 확인 (메트릭이 노출되는지)
2. Prometheus 타겟 확인: `http://localhost:9090/targets`
3. `prometheus.yml`에서 타겟 주소 확인

Mac/Windows:
```yaml
targets: ['host.docker.internal:2112']
```

Linux:
```yaml
targets: ['172.17.0.1:2112']
```

### Grafana 대시보드가 비어있음

**해결**:
1. Grafana에서 Configuration → Data Sources 확인
2. Prometheus 연결 상태 "Test" 버튼으로 확인
3. 대시보드 Time Range를 "Last 15 minutes"로 설정
4. Refresh 간격을 "5s"로 설정

### 메트릭 서버가 시작되지 않음

**증상**: "Metrics server error"

**해결**:
1. 포트 2112가 사용 중인지 확인
```bash
lsof -i :2112
```
2. 다른 포트 사용:
```go
startMetricsServer("8080")  // main.go에서 변경
```

## 📁 파일 구조

```
stomp-load-test/
├── docker-compose.yml          # Docker Compose 설정
├── prometheus.yml              # Prometheus 설정
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml  # Prometheus 데이터소스 자동 설정
│   │   └── dashboards/
│   │       └── dashboard.yml   # 대시보드 자동 로드 설정
│   └── dashboards/
│       └── stomp-load-test-dashboard.json  # 대시보드 정의
└── metrics/
    └── metrics.go              # Prometheus 메트릭 정의
```

## 🎨 대시보드 미리보기

대시보드는 다음을 시각화합니다:
- 📈 실시간 활성 연결 수
- ⏱️ 메시지 지연시간 (P50/P90/P95/P99)
- 🚀 초당 처리량 (throughput)
- 🔌 연결 시간 분포
- ⚠️ 성공/에러 비율
- 📊 누적 통계 (총 메시지, 에러 등)

## 💡 활용 팁

### 1. 실시간 모니터링
부하테스트 실행 전에 Grafana를 열어두고 실시간으로 지표를 관찰하세요.

### 2. 성능 비교
여러 테스트 결과를 Grafana 대시보드의 Time Range를 조정해서 비교할 수 있습니다.

### 3. 알림 설정
Grafana에서 특정 임계값을 초과하면 알림을 받을 수 있습니다:
- 에러율 > 5%
- P95 지연시간 > 500ms
- 활성 연결 수 < 예상치

### 4. 데이터 보존
Prometheus 데이터는 Docker volume에 저장되므로 컨테이너 재시작 후에도 유지됩니다.

## 🧹 정리

### 모니터링 스택 중지

```bash
docker-compose down
```

### 데이터까지 삭제

```bash
docker-compose down -v
```

## 📚 참고 자료

- [Prometheus 문서](https://prometheus.io/docs/)
- [Grafana 문서](https://grafana.com/docs/)
- [PromQL 가이드](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Go Prometheus Client](https://github.com/prometheus/client_golang)

---

**Happy Monitoring! 📊**
