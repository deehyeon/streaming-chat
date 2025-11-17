# STOMP Load Testing Tool 🚀

고성능 Go 기반 STOMP 프로토콜 부하 테스트 도구

## ✨ 주요 특징

- 🔥 **10,000+ 동시 접속 지원**: 고루틴 기반 경량 아키텍처
- 📊 **상세한 통계**: 평균/중앙값/백분위(P90/P95/P99) 제공
- 🎯 **정확한 측정**: Race Condition 해결된 안전한 데이터 수집
- 📈 **단계별 부하 증가**: Stage 기반 점진적 부하 테스트
- 💾 **CSV 결과 저장**: 자동으로 결과를 CSV 파일로 저장
- 🎨 **실시간 진행률**: 컬러풀한 콘솔 출력

## 🏗️ 아키텍처

### JMeter vs Go 비교

| 항목 | JMeter (OS Thread) | Go (Goroutine) |
|------|-------------------|----------------|
| 메모리 사용 (10,000명) | ~10GB | ~20MB |
| 스레드 오버헤드 | 1-2MB/스레드 | 2KB/고루틴 |
| 컨텍스트 스위칭 | OS 레벨 (느림) | Go 런타임 (빠름) |
| 확장성 | 분산 테스트 필요 | 단일 머신으로 충분 |

### 고루틴의 장점

```
10,000개 고루틴 (각 2KB)
        ↓
  Go 런타임 스케줄러
        ↓
8개 OS 스레드 (CPU 코어 수)
```

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd stomp-load-test
go mod download
```

### 2. 설정 변경

`main.go` 파일에서 다음 값들을 수정하세요:

```go
var (
    token = "your-jwt-token-here"  // JWT 토큰
    url   = "your-server:port"     // 서버 주소
)

// 스테이지 설정
var stages = []Stage{
    {300, "초기 부하", 10},   // 300명, 10초에 걸쳐
    {300, "피크 부하", 10},   // 추가 300명, 10초에 걸쳐
    {300, "최종 부하", 10},   // 추가 300명, 10초에 걸쳐
}
```

### 3. 테스트 실행

```bash
go run main.go
```

## 📊 결과 해석

### 콘솔 출력 예시

```
════════════════════════════════════════════════════════════
                    전체 테스트 결과 통계
════════════════════════════════════════════════════════════

📊 테스트 요약
  총 워커 수: 900
  테스트 시간: 45.234s
  성공률: 98.67% (888/900)

📨 메시지 통계
  전송: 888
  수신: 888
  오류: 12

⚡ 성능 메트릭

  메시지 지연 시간
  Avg: 45.23ms, Min: 12.34ms, Max: 234.56ms, 
  Med: 42.11ms, P90: 78.90ms, P95: 98.76ms, P99: 187.65ms

  WebSocket 연결 시간
  Avg: 123.45ms, Min: 89.12ms, Max: 456.78ms, 
  Med: 115.23ms, P90: 234.56ms, P95: 289.01ms, P99: 398.76ms
```

### CSV 출력

`load_test_result.csv` 파일이 자동으로 생성됩니다:

```csv
Metric,Value,Unit
total_workers,900,
success_rate,98.67,
message_latency_avg,45.23,
message_latency_p95,98.76,
...
```

## 🔧 커스터마이징

### 구독 경로 변경

```go
// main.go - worker 함수 내
subscribeFrame := "SUBSCRIBE\nid:sub-1\ndestination:/your/subscription/path\n\n\u0000"
```

### 메시지 발행 경로 변경

```go
// main.go - worker 함수 내
sendFrame := fmt.Sprintf("SEND\ndestination:/your/publish/path\n\n{\"message\":\"%s\"}\u0000", message)
```

### 타임아웃 설정

```go
// WebSocket 연결 타임아웃
dialer := websocket.Dialer{
    HandshakeTimeout: 30 * time.Second,  // 변경 가능
}

// 메시지 수신 타임아웃
timeout := time.After(30 * time.Second)  // 변경 가능
```

## 📈 성능 최적화 팁

### 1. 시스템 리소스 제한 해제

```bash
# Linux/Mac
ulimit -n 65535  # 파일 디스크립터 제한 증가
```

### 2. Go 런타임 튜닝

```bash
# CPU 코어 수 명시
GOMAXPROCS=16 go run main.go

# GC 튜닝
GOGC=50 go run main.go  # GC를 더 자주 실행
```

### 3. 단계적 부하 증가

```go
// 급격한 부하보다는 점진적으로
var stages = []Stage{
    {100, "워밍업", 10},
    {500, "중간 부하", 20},
    {1000, "고부하", 30},
    {2000, "피크", 40},
}
```

## 🐛 문제 해결

### "too many open files" 에러

```bash
ulimit -n 65535
```

### 메모리 부족

- 스테이지당 워커 수를 줄이세요
- 테스트 duration을 늘려서 천천히 증가시키세요

### 타임아웃 발생

- 네트워크 연결 확인
- 서버 성능 확인
- 타임아웃 값 증가

## 📝 로그

- **콘솔 로그**: 진행 상황 및 최종 결과
- **파일 로그**: `load_test.log` - 상세한 에러 로그
- **CSV 결과**: `load_test_result.csv` - 통계 데이터

## 🔍 주요 개선 사항

### 원본 코드 대비 수정사항

1. ✅ **Race Condition 해결**: `sync.Mutex`로 동시성 안전성 확보
2. ✅ **통계 함수 수정**: 정렬 후 정확한 중앙값/백분위 계산
3. ✅ **타이밍 측정 수정**: `Nanosecond()` → `UnixNano()`
4. ✅ **CSV 저장 기능**: 자동으로 결과 파일 생성
5. ✅ **에러 핸들링 개선**: 타임아웃 및 예외 처리 강화
6. ✅ **진행률 표시**: 실시간 프로그레스 바 추가
7. ✅ **P99 백분위 추가**: 더 상세한 통계 제공

## 📚 참고 자료

- [STOMP Protocol Specification](https://stomp.github.io/)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)
- [Go Concurrency Patterns](https://go.dev/blog/pipelines)

## 📄 라이센스

MIT License

---

**Made with ❤️ for high-performance load testing**
