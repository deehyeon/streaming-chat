package com.example.munglogbackend.adapter.stomp;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final StompHandler stompHandler;

    @Value("${stomp.relay.host}")
    private String relayHost;

    @Value("${stomp.relay.port}")
    private int relayPort;

    @Value("${stomp.relay.login}")
    private String relayLogin;

    @Value("${stomp.relay.passcode}")
    private String relayPasscode;

    @Value("${stomp.relay.system-login}")
    private String systemLogin;

    @Value("${stomp.relay.system-passcode}")
    private String systemPasscode;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 부하테스트 / 서버 간 통신용 (순수 WebSocket)
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*");

        registry.addEndpoint("/connect")
                .setAllowedOrigins("http://localhost:3001")
                .withSockJS(); // ws://가 아닌 http:// 엔드포인트를 사용할 수 있게 해주는 sockJs 라이브러리를 통한 요청을 허용하는 설정
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트에서 메시지를 보낼 때 사용할 prefix 설정
        // /publish로 시작하는 메시지는 @MessageMapping 어노테이션이 붙은 메서드로 라우팅 된다.
        // 예: @MessageMapping("/chat") -> 실제 경로는 /publish/chat
        registry.setApplicationDestinationPrefixes(("/publish"));

        // 클라이언트로 메시지를 보낼 때 사용할 prefix 설정
        // /topic으로 시작하는 메시지는 메시지 브로커가 해당 구독자에게 전달한다.
        // 예: /topic/chatroom/1
        registry.enableStompBrokerRelay("/queue", "/topic", "/exchange", "/amq/queue")
                .setRelayHost(relayHost)
                .setRelayPort(relayPort)
                .setClientLogin(relayLogin)
                .setClientPasscode(relayPasscode)
                .setSystemLogin(systemLogin)
                .setSystemPasscode(systemPasscode)
                .setVirtualHost("/");             // 기본 vhost
    }

    // 웹소켓 요청(connect, subscribe, disconnect)등의 요청시에는 http header등 http 메시지를 넣어올 수 있고, 이를 interceptor를 통해 가로채 토큰 등을 검증할 수 있음.
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompHandler);
    }
}