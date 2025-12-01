package com.example.munglogbackend.adapter.stomp;

import com.example.munglogbackend.config.monitoring.WebSocketMetricsConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

// 스프링과 Stomp는 기본적으로 세션을 자동(내부적)으로 처리한다.
// 연결/해제 이벤트를 기록, 연결된 세션 수를 실시간으로 확인할 목적으로 이벤트 리스너를 생성
@Slf4j
@Component
@RequiredArgsConstructor
public class StompEventListener {

    private final WebSocketMetricsConfig metricsConfig;
    private final Set<String> sessions = ConcurrentHashMap.newKeySet();

    @EventListener
    public void connectHandle(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        sessions.add(sessionId);

        metricsConfig.incrementConnections(sessionId);

        log.info("✅ Stomp connected. Session ID: {}, Total sessions: {}",
                sessionId, sessions.size());
    }

    @EventListener
    public void onSubscribe(SessionSubscribeEvent e) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(e.getMessage());
        String destination = accessor.getDestination();

        metricsConfig.incrementSubscriptions(destination);

        log.info("🔔 SUB: session={}, dest={}", accessor.getSessionId(), destination);
    }

    @EventListener
    public void onUnsubscribe(SessionUnsubscribeEvent e) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(e.getMessage());
        String destination = accessor.getDestination();

        metricsConfig.decrementSubscriptions(destination);

        log.info("🔕 UNSUB: session={}, dest={}", accessor.getSessionId(), destination);
    }

    @EventListener
    public void disconnectHandle(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        sessions.remove(sessionId);

        metricsConfig.decrementConnections(sessionId);

        log.info("❌ Stomp disconnected. Session ID: {}, Total sessions: {}",
                sessionId, sessions.size());
    }
}