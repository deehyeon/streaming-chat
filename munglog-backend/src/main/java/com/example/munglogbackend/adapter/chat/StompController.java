package com.example.munglogbackend.adapter.chat;

import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.fasterxml.jackson.core.JsonProcessingException;
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

    @MessageMapping("/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,  ChatMessageDto chatMessageDto) throws JsonProcessingException {
        log.info("[STOMP] roomId={}, dto={}", roomId, chatMessageDto);
        if (!roomId.equals(chatMessageDto.roomId())) {
            throw new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND);
        }
        chatSaver.sendMessage(chatMessageDto);
    }
}