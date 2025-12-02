package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// Counter: 누적 카운터
	TotalWorkers = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_total_workers",
		Help: "Total number of workers created",
	})

	MessagesSent = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_messages_sent_total",
		Help: "Total number of messages sent",
	})

	MessagesReceived = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_messages_received_total",
		Help: "Total number of messages received",
	})

	ErrorsTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_errors_total",
		Help: "Total number of errors",
	})

	SuccessTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_success_total",
		Help: "Total number of successful operations",
	})

	ConnectionRetries = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_load_test_connection_retries_total",
		Help: "Total number of connection retry attempts",
	})

	// Gauge: 현재 상태
	ActiveConnections = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_load_test_active_connections",
		Help: "Number of currently active connections",
	})

	CurrentStage = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_load_test_current_stage",
		Help: "Current test stage number",
	})

	ActiveReconnections = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_load_test_active_reconnections",
		Help: "Number of workers currently attempting to reconnect",
	})

	AverageConnectionDuration = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_load_test_avg_connection_duration_seconds",
		Help: "Average WebSocket connection duration",
	})

	// Histogram: 지연시간 분포
	MessageLatency = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_load_test_message_latency_ms",
		Help:    "Message round-trip latency in milliseconds",
		Buckets: []float64{10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000},
	})

	WebSocketConnectTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_load_test_websocket_connect_ms",
		Help:    "WebSocket connection time in milliseconds",
		Buckets: []float64{50, 100, 250, 500, 1000, 2500, 5000},
	})

	StompConnectTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_load_test_stomp_connect_ms",
		Help:    "STOMP connection time in milliseconds",
		Buckets: []float64{10, 25, 50, 100, 250, 500, 1000},
	})

	WebSocketConnectionDuration = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_load_test_websocket_duration_seconds",
		Help:    "WebSocket connection duration in seconds",
		Buckets: []float64{10, 30, 60, 120, 300, 600, 1800, 3600},
	})

	ReconnectionTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_load_test_reconnection_time_ms",
		Help:    "Time taken to reconnect after disconnect",
		Buckets: []float64{100, 500, 1000, 2000, 5000, 10000, 30000},
	})

	// Summary: 백분위 계산
	MessageLatencySummary = promauto.NewSummary(prometheus.SummaryOpts{
		Name:       "stomp_load_test_message_latency_summary_ms",
		Help:       "Message latency summary with percentiles",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.01, 0.99: 0.001},
	})
)

// ResetMetrics resets all metrics (useful for multiple test runs)
func ResetMetrics() {
	ActiveConnections.Set(0)
	CurrentStage.Set(0)
	ActiveReconnections.Set(0)
	AverageConnectionDuration.Set(0)
}
