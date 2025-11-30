package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;

import java.util.List;

public interface ChatRoomFinder {
    // 채팅방 id로 채팅방 조회
    ChatRoom findRoomByRoomId(Long roomId);

    // 내가 속한 채팅방 목록
    List<ChatRoomSummary> findRoomsByMember(Long memberId);

    // 그룹 채팅방 목록 조회
    List<ChatRoomSummary> findGroupChatRooms(Long memberId);
}
