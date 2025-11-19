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
