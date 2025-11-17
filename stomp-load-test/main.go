package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"stomp-load-test/reports"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

type Stage struct {
	workers  int
	name     string
	duration int
}

// 스테이지 설정
var (
	stages = []Stage{
		{300, "초기 부하", 10},
		{300, "피크 부하", 10},
		{300, "최종 부하", 10},
	}
)

// 전역 변수
var (
	token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTczODYwMzIzN30.2BQZ2P8qooLUeuE6Nl1RyBMpdAoJFum5ChfFK5l_eaY"
	url   = "118.36.152.40:13305"

	// 동시성 안전한 데이터 수집
	resultsMutex            sync.Mutex
	webSocketConnectTimeList []float64
	stompConnectTimeList     []float64
	messageLatencyList       []float64

	// atomic 카운터
	sendMessageCount    atomic.Int64
	receiveMessageCount atomic.Int64
	errorCount          atomic.Int64
	successCount        atomic.Int64
)

// WebSocket 연결
func connectWebSocket(id int) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
	}
	header := http.Header{}
	header.Add("Origin", "http://"+url)
	header.Add("Authorization", "Bearer "+token)

	conn, _, err := dialer.Dial("ws://"+url+"/ws-stomp", header)
	if err != nil {
		return nil, fmt.Errorf("WebSocket 연결 실패: %v", err)
	}

	return conn, nil
}

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	isFinish := false

	// WebSocket 연결 시작
	webSocketStart := time.Now().UnixNano()
	conn, err := connectWebSocket(id)
	if err != nil {
		log.Printf("Worker %d WebSocket 연결 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}
	defer conn.Close()

	webSocketEnd := time.Now().UnixNano()
	webSocketConnectTime := float64(webSocketEnd-webSocketStart) / 1e6

	// STOMP Connect Frame 전송
	connectFrame := fmt.Sprintf("CONNECT\nAuthorization:Bearer %s\naccept-version:1.2,1.1,1.0\nheart-beat:2000,2000\n\n\u0000", token)

	stompConnectStart := time.Now().UnixNano() // 수정: Nanosecond() -> UnixNano()
	err = conn.WriteMessage(websocket.TextMessage, []byte(connectFrame))
	if err != nil {
		log.Printf("Worker %d STOMP CONNECT 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}

	// CONNECTED 프레임 수신 대기
	_, _, err = conn.ReadMessage()
	if err != nil {
		log.Printf("Worker %d STOMP CONNECTED 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}
	stompConnectEnd := time.Now().UnixNano()
	stompConnectTime := float64(stompConnectEnd-stompConnectStart) / 1e6

	// 구독 메시지 전송
	subscribeFrame := "SUBSCRIBE\nid:sub-1\ndestination:/exchange/chat.exchange/chat.room.3e53eb09-7f4f-4e45-a31b-61ea8556d3b3\n\n\u0000"
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeFrame))
	if err != nil {
		log.Printf("Worker %d 구독 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}

	// 구독 응답 대기
	_, _, err = conn.ReadMessage()
	if err != nil {
		log.Printf("Worker %d 구독 응답 수신 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}

	// 메시지 수신을 위한 고루틴
	go func() {
		for !isFinish {
			_, message, err := conn.ReadMessage()
			if err != nil {
				if !isFinish {
					log.Printf("Worker %d 메시지 수신 오류: %v\n", id, err)
					errorCount.Add(1)
				}
				isFinish = true
				return
			}

			messageStr := string(message)
			if strings.HasPrefix(messageStr, "MESSAGE") {
				lines := strings.Split(messageStr, "\n")
				if len(lines) < 13 {
					continue
				}
				jsonStr := strings.TrimSpace(strings.Trim(lines[12], "\x00"))

				var jsonData struct {
					Message string `json:"message"`
				}
				if err := json.Unmarshal([]byte(jsonStr), &jsonData); err != nil {
					continue
				}
				parts := strings.Split(jsonData.Message, "-")
				if len(parts) < 2 {
					continue
				}

				if strings.TrimSpace(parts[0]) == fmt.Sprintf("Worker %d", id) {
					timestamp := strings.TrimSpace(parts[1])
					receivedTime, err := strconv.ParseInt(timestamp, 10, 64)
					if err != nil {
						errorCount.Add(1)
						isFinish = true
						return
					}
					currentTime := time.Now().UnixNano()
					latency := float64(currentTime-receivedTime) / 1e6 // ms로 변환

					// 동시성 안전한 데이터 추가
					resultsMutex.Lock()
					messageLatencyList = append(messageLatencyList, latency)
					webSocketConnectTimeList = append(webSocketConnectTimeList, webSocketConnectTime)
					stompConnectTimeList = append(stompConnectTimeList, stompConnectTime)
					resultsMutex.Unlock()

					receiveMessageCount.Add(1)
					successCount.Add(1)
					isFinish = true
					return
				}
			}
		}
	}()

	// 채팅 메시지 전송
	currentTimeMs := time.Now().UnixNano()
	message := fmt.Sprintf("Worker %d - %d", id, currentTimeMs)
	sendFrame := fmt.Sprintf("SEND\ndestination:/pub/chat.message.3e53eb09-7f4f-4e45-a31b-61ea8556d3b3\n\n{\"message\":\"%s\"}\u0000", message)

	err = conn.WriteMessage(websocket.TextMessage, []byte(sendFrame))
	if err != nil {
		log.Printf("Worker %d 메시지 전송 실패: %v\n", id, err)
		errorCount.Add(1)
		return
	}
	sendMessageCount.Add(1)

	// 메시지 수신 대기 (최대 30초)
	timeout := time.After(30 * time.Second)
	for !isFinish {
		select {
		case <-timeout:
			log.Printf("Worker %d 타임아웃\n", id)
			errorCount.Add(1)
			return
		default:
			time.Sleep(time.Millisecond * 100)
		}
	}
}

func main() {
	// 로그 파일 설정
	logFile, err := os.OpenFile("load_test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		log.SetOutput(logFile)
		defer logFile.Close()
	}

	var wg sync.WaitGroup
	totalWorkers := 0
	for _, stage := range stages {
		totalWorkers += stage.workers
	}

	currentWorker := 1
	testStartTime := time.Now()

	fmt.Printf("\n\033[1;36m╔═══════════════════════════════════════════════════════════╗\033[0m\n")
	fmt.Printf("\033[1;36m║        STOMP 채팅 서버 부하 테스트 시작                    ║\033[0m\n")
	fmt.Printf("\033[1;36m╚═══════════════════════════════════════════════════════════╝\033[0m\n")
	fmt.Printf("\n서버: \033[1;33m%s\033[0m\n", url)
	fmt.Printf("총 워커: \033[1;33m%d명\033[0m\n", totalWorkers)
	fmt.Printf("스테이지: \033[1;33m%d개\033[0m\n\n", len(stages))

	for stageIdx, stage := range stages {
		startTime := time.Now()
		stageDuration := time.Duration(stage.duration) * time.Second
		interval := stageDuration / time.Duration(stage.workers)

		fmt.Printf("\033[1;34m┌─ Stage %d: %s (%d 워커, %d초) ─┐\033[0m\n",
			stageIdx+1, stage.name, stage.workers, stage.duration)

		for i := 0; i < stage.workers; i++ {
			wg.Add(1)
			go worker(currentWorker, &wg)
			currentWorker++

			elapsedTime := time.Since(startTime)
			if elapsedTime < stageDuration {
				time.Sleep(interval)
			}

			// 진행상황 출력 (10% 단위)
			if (i+1)%(stage.workers/10) == 0 || i == stage.workers-1 {
				progress := float64(i+1) / float64(stage.workers) * 100
				fmt.Printf("\r\033[90m  진행: [%-50s] %.0f%% (%d/%d) | 성공: %d | 오류: %d\033[0m",
					strings.Repeat("█", int(progress/2)),
					progress,
					i+1,
					stage.workers,
					successCount.Load(),
					errorCount.Load())
			}
		}
		fmt.Printf("\n\033[1;34m└─ Stage %d 완료 (소요시간: %v) ─┘\033[0m\n\n",
			stageIdx+1, time.Since(startTime).Round(time.Millisecond))

		// 각 스테이지 사이에 잠시 대기
		if stageIdx < len(stages)-1 {
			time.Sleep(time.Second)
		}
	}

	fmt.Printf("\n\033[1;32m✓ 모든 워커 생성 완료\033[0m\n")
	fmt.Printf("\033[90m워커 종료 대기 중...\033[0m\n\n")

	wg.Wait()

	testDuration := time.Since(testStartTime)

	// 리포트 생성
	reports.MakeReport(
		totalWorkers,
		messageLatencyList,
		webSocketConnectTimeList,
		stompConnectTimeList,
		&sendMessageCount,
		&receiveMessageCount,
		&errorCount,
		&successCount,
		testDuration,
	)

	fmt.Printf("\n\033[1;36m테스트 완료! 결과가 'load_test_result.csv' 파일에 저장되었습니다.\033[0m\n\n")
}
