package com.example.munglogbackend.adapter.chat;

import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.domain.chat.dto.ChatMessageDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StompController {
    private final ChatSaver chatSaver;

    @MessageMapping("/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,  ChatMessageDto chatMessageDto) throws JsonProcessingException {
        chatSaver.sendMessage(chatMessageDto);
    }
}