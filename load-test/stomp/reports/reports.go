package reports

import (
	"encoding/csv"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync/atomic"
	"time"
)

// 최소값 계산
func calculateMin(result []float64) float64 {
	if len(result) == 0 {
		return 0
	}
	minResult := result[0]
	for _, v := range result {
		if v < minResult {
			minResult = v
		}
	}
	return minResult
}

// 최대값 계산
func calculateMax(result []float64) float64 {
	if len(result) == 0 {
		return 0
	}
	maxResult := result[0]
	for _, v := range result {
		if v > maxResult {
			maxResult = v
		}
	}
	return maxResult
}

// 평균값 계산
func calculateAvg(result []float64) float64 {
	if len(result) == 0 {
		return 0
	}
	avgResult := 0.0
	for _, v := range result {
		avgResult += v
	}
	return avgResult / float64(len(result))
}

// 중앙값 계산 (수정됨)
func calculateMedian(result []float64) float64 {
	if len(result) == 0 {
		return 0
	}
	// 정렬된 복사본 생성
	sorted := make([]float64, len(result))
	copy(sorted, result)
	sort.Float64s(sorted)

	n := len(sorted)
	if n%2 == 0 {
		// 짝수: 중간 두 값의 평균
		return (sorted[n/2-1] + sorted[n/2]) / 2
	}
	// 홀수: 중간 값
	return sorted[n/2]
}

// 백분위 계산 (수정됨)
func calculatePercentile(result []float64, percentile float64) float64 {
	if len(result) == 0 {
		return 0
	}
	// 정렬된 복사본 생성
	sorted := make([]float64, len(result))
	copy(sorted, result)
	sort.Float64s(sorted)

	idx := int(float64(len(sorted)-1) * percentile)
	if idx >= len(sorted) {
		idx = len(sorted) - 1
	}
	return sorted[idx]
}

// 결과 출력
func printResult(result []float64) {
	// 음수값 제거
	filteredResult := make([]float64, 0, len(result))
	for _, v := range result {
		if v >= 0 {
			filteredResult = append(filteredResult, v)
		}
	}

	if len(filteredResult) == 0 {
		fmt.Printf("\033[31m데이터 없음\033[0m")
		return
	}

	minResult := calculateMin(filteredResult)
	maxResult := calculateMax(filteredResult)
	avgResult := calculateAvg(filteredResult)
	medianResult := calculateMedian(filteredResult)
	p90Result := calculatePercentile(filteredResult, 0.9)
	p95Result := calculatePercentile(filteredResult, 0.95)
	p99Result := calculatePercentile(filteredResult, 0.99)

	fmt.Printf("\033[33mAvg: %7.2fms\033[0m, ", avgResult)
	fmt.Printf("\033[36mMin: %7.2fms\033[0m, ", minResult)
	fmt.Printf("\033[31mMax: %8.2fms\033[0m, ", maxResult)
	fmt.Printf("\033[32mMed: %7.2fms\033[0m, ", medianResult)
	fmt.Printf("\033[35mP90: %7.2fms\033[0m, ", p90Result)
	fmt.Printf("\033[34mP95: %7.2fms\033[0m, ", p95Result)
	fmt.Printf("\033[37mP99: %7.2fms\033[0m", p99Result)
}

// CSV로 결과 저장
func saveToCSV(filename string, data map[string]interface{}) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// 헤더 작성
	headers := []string{"Metric", "Value", "Unit"}
	if err := writer.Write(headers); err != nil {
		return err
	}

	// 데이터 작성
	for key, value := range data {
		record := []string{key, fmt.Sprintf("%v", value), ""}
		if err := writer.Write(record); err != nil {
			return err
		}
	}

	return nil
}

// 통계 데이터 생성
func generateStats(label string, data []float64) map[string]float64 {
	if len(data) == 0 {
		return map[string]float64{}
	}

	filteredData := make([]float64, 0, len(data))
	for _, v := range data {
		if v >= 0 {
			filteredData = append(filteredData, v)
		}
	}

	if len(filteredData) == 0 {
		return map[string]float64{}
	}

	return map[string]float64{
		label + "_avg": calculateAvg(filteredData),
		label + "_min": calculateMin(filteredData),
		label + "_max": calculateMax(filteredData),
		label + "_med": calculateMedian(filteredData),
		label + "_p90": calculatePercentile(filteredData, 0.9),
		label + "_p95": calculatePercentile(filteredData, 0.95),
		label + "_p99": calculatePercentile(filteredData, 0.99),
	}
}

func MakeReport(
	totalWorkers int,
	messageLatencyList []float64,
	webSocketConnectTimeList []float64,
	stompConnectTimeList []float64,
	sendMessageCount *atomic.Int64,
	receiveMessageCount *atomic.Int64,
	errorCount *atomic.Int64,
	successCount *atomic.Int64,
	testDuration time.Duration,
) {
	fmt.Printf("\n\n\033[1;36m%s\033[0m\n", strings.Repeat("═", 120))
	fmt.Printf("\033[1;36m%s 전체 테스트 결과 통계 %s\033[0m\n", strings.Repeat(" ", 45), strings.Repeat(" ", 45))
	fmt.Printf("\033[1;36m%s\033[0m\n\n", strings.Repeat("═", 120))

	// ⚠️ 수정: 성공률 계산 로직
	sent := sendMessageCount.Load()
	success := successCount.Load()
	received := receiveMessageCount.Load()
	errors := errorCount.Load()

	var successRate float64
	if sent > 0 {
		successRate = float64(success) / float64(sent) * 100
	} else {
		successRate = 0
	}

	// 기본 정보
	fmt.Printf("\033[1m📊 테스트 요약\033[0m\n")
	fmt.Printf("  총 워커 수: \033[1;33m%d\033[0m\n", totalWorkers)
	fmt.Printf("  테스트 시간: \033[1;33m%v\033[0m\n", testDuration.Round(time.Millisecond))
	// ⚠️ 수정: 올바른 성공률 표시
	fmt.Printf("  메시지 성공률: \033[1;32m%.2f%%\033[0m (%d/%d 전송 성공)\n\n",
		successRate,
		success,
		sent)

	// 메시지 통계
	fmt.Printf("\033[1m📨 메시지 통계\033[0m\n")
	fmt.Printf("  전송: \033[32m%d\033[0m\n", sent)
	fmt.Printf("  수신: \033[32m%d\033[0m (브로드캐스트 포함)\n", received)
	fmt.Printf("  성공: \033[32m%d\033[0m (왕복 확인 완료)\n", success)
	fmt.Printf("  실패: \033[33m%d\033[0m (타임아웃/미수신)\n", sent-success)
	fmt.Printf("  오류: \033[31m%d\033[0m\n\n", errors)

	// 성능 메트릭
	fmt.Printf("\033[1m⚡ 성능 메트릭\033[0m\n\n")

	fmt.Printf("  \033[1m메시지 지연 시간\033[0m (성공한 %d개 메시지 기준)\n  ", success)
	printResult(messageLatencyList)
	fmt.Printf("\n\n")

	fmt.Printf("  \033[1mWebSocket 연결 시간\033[0m\n  ")
	printResult(webSocketConnectTimeList)
	fmt.Printf("\n\n")

	fmt.Printf("  \033[1mSTOMP 연결 시간\033[0m\n  ")
	printResult(stompConnectTimeList)
	fmt.Printf("\n\n")

	fmt.Printf("\033[1;36m%s\033[0m\n", strings.Repeat("═", 120))

	// CSV로 저장
	csvData := make(map[string]interface{})
	csvData["total_workers"] = totalWorkers
	csvData["test_duration_seconds"] = testDuration.Seconds()
	csvData["messages_sent"] = sent
	csvData["messages_received"] = received
	csvData["messages_success"] = success
	csvData["messages_failed"] = sent - success
	csvData["error_count"] = errors
	csvData["success_rate_percent"] = successRate

	// 통계 데이터 추가
	for k, v := range generateStats("message_latency", messageLatencyList) {
		csvData[k] = v
	}
	for k, v := range generateStats("websocket_connect", webSocketConnectTimeList) {
		csvData[k] = v
	}
	for k, v := range generateStats("stomp_connect", stompConnectTimeList) {
		csvData[k] = v
	}

	if err := saveToCSV("load_test_result.csv", csvData); err != nil {
		fmt.Printf("\033[31m⚠ CSV 저장 실패: %v\033[0m\n", err)
	}
}
