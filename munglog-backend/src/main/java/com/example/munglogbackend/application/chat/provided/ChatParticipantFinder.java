package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import java.util.List;

public interface ChatParticipantFinder {
    // 채팅방 참여자 목록
    List<ChatParticipant> findChatParticipants(Long roomId);

    // 내가 속한 채팅방 목록
    List<ChatRoomSummary> findRoomsByMember(Long memberId);

    ChatParticipant findByRoomIdAndMemberId(Long roomId, Long memberId);

    // 채팅방에 존재하는 멤버인지
    boolean isRoomMember(Long roomId, Long memberId);
}
