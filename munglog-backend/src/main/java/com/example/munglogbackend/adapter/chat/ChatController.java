package com.example.munglogbackend.adapter.chat;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.chat.provided.ChatFinder;
import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.domain.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.dto.ChatRoomSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatSaver chatSaver;
    private final ChatFinder chatFinder;

    // 개인 채팅방 개설 또는 기존 roomId return
    @PostMapping("/private")
    public Long createPrivateChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestParam Long otherMemberId) {
        return chatSaver.create(authDetails.getMemberId(), otherMemberId);
    }

    // 내 채팅방 목록 조회 : roomId, roomName, 그룹채팅여부, 메시지읽음개수
    @GetMapping("/rooms/me")
    public List<ChatRoomSummary> getMyChatRooms(
            @AuthenticationPrincipal AuthDetails authDetails) {
        return chatFinder.findRoomsByMember(authDetails.getMemberId());
    }

    // 메시지 조회
    @GetMapping("/rooms/{roomId}/messages")
    public Slice<ChatMessageDto> getMessages(
            @PathVariable Long roomId,
            @RequestParam(required = false) Long beforeSeq,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal AuthDetails authDetails
    ) {
        return chatFinder.fetchMessagesBeforeSeq(roomId, beforeSeq, size, authDetails.getMemberId());
    }

    // 채팅 메시지 읽음 처리
    @PostMapping("/rooms/{roomId}/read")
    public void markMessagesAsRead(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long roomId) {
        chatSaver.updateLastRead(roomId, authDetails.getMemberId(), chatFinder.findLatestMessageSeq(roomId));
    }

    // 채팅방 나가기
    @DeleteMapping("/rooms/{roomId}")
    public void leaveChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long roomId) {
        chatSaver.leaveChatRoom(roomId, authDetails.getMemberId());
    }
}
