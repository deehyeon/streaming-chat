package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// 기본 카운터
	MessagesSent = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_messages_sent_total",
		Help: "Total number of messages sent",
	})

	MessagesReceived = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_messages_received_total",
		Help: "Total number of messages received",
	})

	ErrorsTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_errors_total",
		Help: "Total number of errors",
	})

	SuccessTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_success_total",
		Help: "Total number of successful message round-trips",
	})

	// 연결 수
	ActiveConnections = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_active_connections",
		Help: "Number of currently active WebSocket connections",
	})

	// 패턴별 연결 수
	PassiveConnectionsGauge = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "websocket_passive_connections",
		Help: "Number of passive connections (receive only, rarely send)",
	})

	ModerateConnectionsGauge = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "websocket_moderate_connections",
		Help: "Number of moderate activity connections",
	})

	ActiveConnectionsGauge = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "websocket_active_connections",
		Help: "Number of highly active connections (frequent senders)",
	})

	// 지연 시간 (Histogram)
	MessageLatency = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_message_latency_ms",
		Help:    "Message round-trip latency in milliseconds",
		Buckets: []float64{1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000},
	})

	WebSocketConnectTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_websocket_connect_time_ms",
		Help:    "WebSocket connection time in milliseconds",
		Buckets: []float64{10, 50, 100, 250, 500, 1000, 2500, 5000},
	})

	StompConnectTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_connect_time_ms",
		Help:    "STOMP CONNECT handshake time in milliseconds",
		Buckets: []float64{10, 50, 100, 250, 500, 1000, 2500, 5000},
	})

	// 지연 시간 (Summary) - 백분위수 추적
	MessageLatencySummary = promauto.NewSummary(prometheus.SummaryOpts{
		Name:       "stomp_message_latency_summary_ms",
		Help:       "Message latency summary with quantiles",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.01, 0.99: 0.001},
	})

	// 현재 Stage 번호
	CurrentStage = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_current_stage",
		Help: "Current test stage number",
	})

	// 총 워커 수
	TotalWorkers = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_total_workers",
		Help: "Total number of workers created",
	})

	// 재연결 관련 메트릭
	ConnectionRetries = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_connection_retries_total",
		Help: "Total number of connection retry attempts",
	})

	ActiveReconnections = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "stomp_active_reconnections",
		Help: "Number of workers currently attempting to reconnect",
	})

	ReconnectionTime = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "stomp_reconnection_time_ms",
		Help:    "Time taken to successfully reconnect in milliseconds",
		Buckets: []float64{100, 500, 1000, 2500, 5000, 10000, 30000, 60000, 120000},
	})

	SuccessfulReconnections = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_successful_reconnections_total",
		Help: "Total number of successful reconnections",
	})

	FailedReconnections = promauto.NewCounter(prometheus.CounterOpts{
		Name: "stomp_failed_reconnections_total",
		Help: "Total number of failed reconnections (max retries exceeded)",
	})
)
