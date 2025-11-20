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
