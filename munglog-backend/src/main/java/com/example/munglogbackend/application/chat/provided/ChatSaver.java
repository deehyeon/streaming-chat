package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.entity.ChatMessage;

import java.util.List;

public interface ChatSaver {
    /** 1대1 채팅방 생성 */
    Long createPrivateChatRoom(Long memberAId, Long memberBId);

    /** 그룹 채팅방 생성 */
    Long createGroupChatRoom(Long creatorId, List<Long> otherMemberIds);

    void joinGroupChatRoom(Long memberId, Long roomId);

    /** 채팅 메시지 전송 */
    ChatMessage sendMessage(ChatMessageDto request);

    /** 채팅방 나가기 */
    void leaveChatRoom(Long roomId, Long memberId);

    /** 읽음 처리 */
    void updateLastRead(Long roomId, Long memberId);
}