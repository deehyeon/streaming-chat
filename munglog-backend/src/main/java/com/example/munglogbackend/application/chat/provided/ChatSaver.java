package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.domain.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.entity.ChatMessage;

public interface ChatSaver {
    /** 채팅방 생성 */
    Long create(Long memberAId, Long memberBId);

    /** 채팅 메시지 전송 */
    ChatMessage sendMessage(ChatMessageDto request);

    /** 채팅방 나가기 */
    void leaveChatRoom(Long roomId, Long memberId);

    /** 읽음 처리 */
    void updateLastRead(Long roomId, Long memberId);
}