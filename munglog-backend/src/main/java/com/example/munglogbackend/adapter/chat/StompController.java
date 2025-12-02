package com.example.munglogbackend.adapter.chat;

import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.config.monitoring.WebSocketMetricsConfig;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class StompController {
    private final ChatSaver chatSaver;
    private final WebSocketMetricsConfig metricsConfig;

    @MessageMapping("/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,  ChatMessageDto chatMessageDto) throws JsonProcessingException {
        Timer.Sample sample = metricsConfig.startTimer();

        try {
            log.info("[STOMP] roomId={}, senderId={}", roomId, chatMessageDto.senderId());
            if (!roomId.equals(chatMessageDto.roomId())) {
                throw new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND);
            }
            chatSaver.sendMessage(chatMessageDto);

        } finally {
            // 메시지 처리 시간 측정 종료
            metricsConfig.stopTimer(sample, "stomp_receive");
        }
    }
}