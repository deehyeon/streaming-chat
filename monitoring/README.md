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
