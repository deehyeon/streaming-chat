package com.example.munglogbackend.config.monitoring;

import io.micrometer.core.instrument.*;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
@Getter
public class WebSocketMetricsConfig {
    private final MeterRegistry meterRegistry;

    // === 연결 관련 메트릭 ===
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicInteger activeSubscriptions = new AtomicInteger(0);
    private final AtomicLong totalConnectionFailures = new AtomicLong(0);

    // 연결 시작 시간 추적 (세션 ID -> 연결 시작 시간)
    private final ConcurrentHashMap<String, Instant> connectionStartTimes = new ConcurrentHashMap<>();

    // 토픽별 구독자 수 추적
    private final ConcurrentHashMap<String, AtomicInteger> subscribersPerTopic = new ConcurrentHashMap<>();

    // === 메시지 관련 메트릭 ===
    private final AtomicLong failedMessages = new AtomicLong(0);
    private final AtomicInteger messageQueueSize = new AtomicInteger(0);

    // Counter들
    private final Counter connectCounter;
    private final Counter disconnectCounter;
    private final Counter subscribeCounter;
    private final Counter unsubscribeCounter;
    private final Counter connectionFailureCounter;
    private final Counter failedMessageCounter;

    // Timer들
    private final Timer stompReceiveTimer;
    private final Timer connectionDurationTimer;

    // destination별 메시지 카운터 캐시
    private final ConcurrentHashMap<String, Counter> messageCounters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Counter> broadcastCounters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Counter> unicastCounters = new ConcurrentHashMap<>();

    public WebSocketMetricsConfig(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Gauge 등록
        registerGauges();

        // Counter 등록
        this.connectCounter = Counter.builder("websocket.connections.total")
                .tag("type", "connect")
                .description("Total WebSocket connections")
                .register(meterRegistry);

        this.disconnectCounter = Counter.builder("websocket.connections.total")
                .tag("type", "disconnect")
                .description("Total WebSocket disconnections")
                .register(meterRegistry);

        this.subscribeCounter = Counter.builder("stomp.subscriptions.total")
                .tag("type", "subscribe")
                .description("Total STOMP subscriptions")
                .register(meterRegistry);

        this.unsubscribeCounter = Counter.builder("stomp.subscriptions.total")
                .tag("type", "unsubscribe")
                .description("Total STOMP unsubscriptions")
                .register(meterRegistry);

        this.connectionFailureCounter = Counter.builder("websocket.connection.failures.total")
                .description("Total WebSocket connection failures")
                .register(meterRegistry);

        this.failedMessageCounter = Counter.builder("stomp.messages.failed.total")
                .description("Total failed messages")
                .register(meterRegistry);

        // Timer 등록
        this.stompReceiveTimer = Timer.builder("stomp.message.processing.time")
                .tag("type", "stomp_receive")
                .description("STOMP message processing time")
                .register(meterRegistry);

        this.connectionDurationTimer = Timer.builder("websocket.connection.duration")
                .description("WebSocket connection duration")
                .register(meterRegistry);
    }

    private void registerGauges() {
        // 활성 WebSocket 연결 수
        Gauge.builder("websocket.connections.active", activeConnections, AtomicInteger::get)
                .description("Current number of active WebSocket connections")
                .register(meterRegistry);

        // 활성 구독 수
        Gauge.builder("stomp.subscriptions.active", activeSubscriptions, AtomicInteger::get)
                .description("Current number of active STOMP subscriptions")
                .register(meterRegistry);

        // 메시지 큐 대기 크기
        Gauge.builder("stomp.message.queue.size", messageQueueSize, AtomicInteger::get)
                .description("Current message queue size")
                .register(meterRegistry);

        // 총 연결 실패 수
        Gauge.builder("websocket.connection.failures.current", totalConnectionFailures, AtomicLong::get)
                .description("Current total connection failures")
                .register(meterRegistry);
    }

    // === 연결 관련 메서드 ===

    public void incrementConnections(String sessionId) {
        activeConnections.incrementAndGet();
        connectCounter.increment();
        connectionStartTimes.put(sessionId, Instant.now());
    }

    public void decrementConnections(String sessionId) {
        activeConnections.decrementAndGet();
        disconnectCounter.increment();

        // 연결 지속 시간 기록
        Instant startTime = connectionStartTimes.remove(sessionId);
        if (startTime != null) {
            Duration duration = Duration.between(startTime, Instant.now());
            connectionDurationTimer.record(duration);
        }
    }

    public void recordConnectionFailure() {
        totalConnectionFailures.incrementAndGet();
        connectionFailureCounter.increment();
    }

    // === 구독 관련 메서드 ===

    public void incrementSubscriptions(String destination) {
        if (destination == null) {
            log.info("‼️destination is null");
            return;
        }
        activeSubscriptions.incrementAndGet();
        subscribeCounter.increment();

        // 토픽별 구독자 수 증가
        subscribersPerTopic.computeIfAbsent (destination, k -> {
            AtomicInteger count = new AtomicInteger(0);
            Gauge.builder("stomp.subscribers.per.topic", count, AtomicInteger::get)
                    .tag("destination", k)
                    .description("Number of subscribers per topic")
                    .register(meterRegistry);
            return count;
        }).incrementAndGet();
    }

    public void decrementSubscriptions(String destination) {
        if (destination == null) {
            log.info("‼️destination is null");
            return;
        }
        activeSubscriptions.updateAndGet(v -> Math.max(0, v - 1));
        unsubscribeCounter.increment();

        // 토픽별 구독자 수 감소
        AtomicInteger count = subscribersPerTopic.get(destination);
        if (count != null) {
            count.updateAndGet(v -> Math.max(0, v - 1));
        }
    }

    // === 메시지 관련 메서드 ===

    public void recordMessageSent(String destination, boolean isBroadcast) {
        // 전체 메시지 카운트
        messageCounters.computeIfAbsent(destination, dest ->
                Counter.builder("stomp.messages.sent.total")
                        .tag("destination", dest)
                        .description("Total messages sent to destination")
                        .register(meterRegistry)
        ).increment();

        // 브로드캐스트 vs 유니캐스트 구분
        if (isBroadcast) {
            broadcastCounters.computeIfAbsent(destination, dest ->
                    Counter.builder("stomp.messages.broadcast.total")
                            .tag("destination", dest)
                            .description("Total broadcast messages")
                            .register(meterRegistry)
            ).increment();
        } else {
            unicastCounters.computeIfAbsent(destination, dest ->
                    Counter.builder("stomp.messages.unicast.total")
                            .tag("destination", dest)
                            .description("Total unicast messages")
                            .register(meterRegistry)
            ).increment();
        }
    }

    public void recordMessageFailure() {
        failedMessages.incrementAndGet();
        failedMessageCounter.increment();
    }

    public void updateMessageQueueSize(int size) {
        messageQueueSize.set(size);
    }

    // === Timer 관련 메서드 ===

    public Timer.Sample startTimer() {
        return Timer.start(meterRegistry);
    }

    public void stopTimer(Timer.Sample sample, String messageType) {
        sample.stop(Timer.builder("stomp.message.processing.time")
                .tag("type", messageType)
                .description("Message processing time by type")
                .register(meterRegistry));
    }

    public Timer.Sample startStompReceiveTimer() {
        return Timer.start(meterRegistry);
    }

    public void stopStompReceiveTimer(Timer.Sample sample) {
        sample.stop(stompReceiveTimer);
    }
}