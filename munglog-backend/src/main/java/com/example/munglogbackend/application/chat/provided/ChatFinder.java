package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import org.springframework.data.domain.Slice;

import java.util.List;

public interface ChatFinder {
    // 채팅방 id로 채팅방 조회
    ChatRoom findRoomByRoomId(Long roomId);

    // 채팅방 참가자 목록 조회
    List<ChatParticipant> findChatParticipants(Long roomId);

    // 현재 채팅방의 최신 seq 조회
    long fetchCurrentRoomLatestSeq(Long roomId);

    // 내가 속한 채팅방 목록
    List<ChatRoomSummary> findRoomsByMember(Long memberId);

    // 특정 seq 이전 N건 조회하기
    Slice<ChatMessageDto> fetchMessagesBeforeSeq(Long roomId, Long beforeSeq, int size, Long memberId);

    ChatParticipant findByRoomIdAndMemberId(Long roomId, Long memberId);

    // 채팅방에 존재하는 멤버인지
    boolean isRoomMember(Long roomId, Long memberId);

    // 특정 채팅방의 최신 메시지 seq 조회
    long findLatestMessageSeq(Long roomId);
}