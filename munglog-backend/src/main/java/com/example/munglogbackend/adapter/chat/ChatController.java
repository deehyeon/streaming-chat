package com.example.munglogbackend.adapter.chat;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.chat.provided.ChatMessageFinder;
import com.example.munglogbackend.application.chat.provided.ChatParticipantFinder;
import com.example.munglogbackend.application.chat.provided.ChatRoomFinder;
import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/chat")
@RequiredArgsConstructor
@Validated
@Tag(name = "CHAT", description = "채팅 API")
public class ChatController {
    private final ChatSaver chatSaver;
    private final ChatRoomFinder chatRoomFinder;
    private final ChatMessageFinder chatMessageFinder;
    private final ChatParticipantFinder chatParticipantFinder;

    // 개인 채팅방 개설 또는 기존 roomId return
    @Operation(summary = "1대1 채팅방 개설", description = """
    ## 1대1 채팅방을 만듭니다.
    - 채팅할 사람의 memberId를 입력합니다.
    - 상대방과의 채팅방이 이미 존재하는 경우, 기존 roomId를 반환합니다.
    """)
    @PostMapping("/rooms/private")
    public ApiResponse<Long> createPrivateChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestParam Long otherMemberId) {
        return ApiResponse.success(chatSaver.createPrivateChatRoom(authDetails.getMemberId(), otherMemberId));
    }

    // 그룹 채팅방 개설
    @Operation(summary = "그룹 채팅방 개설", description = """
    ## 그룹 채팅방을 만듭니다.
    - 채팅할 사람의 memberId 목록을 입력합니다.
    """)
    @PostMapping("/rooms/group")
    public ApiResponse<Long> createGroupChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestParam @Size(min = 0, max = 50, message = "그룹 채팅은 최대 50명까지 가능합니다") List<Long> otherMemberIds
    ) {
        return ApiResponse.success(chatSaver.createGroupChatRoom(authDetails.getMemberId(), otherMemberIds));
    }

    @GetMapping("/rooms/{roomId}/participants")
    public ApiResponse<List<Long>> getChatRoomParticipants(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long roomId
    ) {
        return ApiResponse.success(
                chatParticipantFinder.findChatParticipantIdsExcludingMe(roomId, authDetails.getMemberId())
        );
    }

    // 그룹 채팅방 개설
    @Operation(summary = "그룹 채팅방에 참여한다.", description = """
    ## 이미 존재하는 그룹 채팅방에 참여한다.
    - 참여할 채팅방의 id를 입력해 참여한다.
    """)
    @PostMapping("/rooms/{roomId}")
    public ApiResponse<?> joinGroupChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long roomId
    ) {
        chatSaver.joinGroupChatRoom(authDetails.getMemberId(), roomId);
        return ApiResponse.success();
    }

    @Operation(summary = "전체 채팅방 목록을 조회한다.", description = """
    ## 채팅방 목록 전체를 조회한다.
    - 그룹 채팅방만 조회가 가능하다.
    """
    )
    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomSummary>> getGroupChatRooms(
            @AuthenticationPrincipal AuthDetails authDetails
    ) {
        return ApiResponse.success(chatRoomFinder.findGroupChatRooms(authDetails.getMemberId()));
    }

    // 내 채팅방 목록 조회 : roomId, roomName, 그룹채팅여부, 메시지읽음개수
    @Operation(summary = "내 채팅방 목록 조회", description = """
    ## 나의 채팅방 목록을 조횝합니다.
    - 내가 속해있는 채팅방 목록을 조회힙니다.
    - 각 채팅방마다 roomId, roomName, 그룹채팅 여부, 메시지 읽음 개수를 반환받습니다.
    """)
    @GetMapping("/rooms/me")
    public ApiResponse<List<ChatRoomSummary>> getMyChatRooms(
            @AuthenticationPrincipal AuthDetails authDetails) {
        return ApiResponse.success(chatRoomFinder.findRoomsByMember(authDetails.getMemberId()));
    }

    // 메시지 조회
    @Operation(summary = "채팅방 메시지 조회", description = """
    ## 채팅방의 메시지를 조회합니다.
    - 기본으로 최근 50개를 조회합니다.
    """)
    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<Slice<ChatMessageDto>> getMessages(
            @PathVariable Long roomId,
            @RequestParam(required = false) Long beforeSeq,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal AuthDetails authDetails
    ) {
        return ApiResponse.success(chatMessageFinder.fetchMessagesBeforeSeq(roomId, beforeSeq, size, authDetails.getMemberId()));
    }

    // 채팅 메시지 읽음 처리
    @Operation(summary = "채팅 메시지 읽음 처리", description = """
    ## 채팅 메시지를 읽음 처리합니다.
    - 채팅방의 채팅 메시지를 읽음 처리합니다.
    """)
    @PostMapping("/rooms/{roomId}/read")
    public ApiResponse<?> markMessagesAsRead(
            @AuthenticationPrincipal AuthDetails authDetails, @PathVariable Long roomId) {
        chatSaver.updateLastRead(roomId, authDetails.getMemberId());
        return ApiResponse.success();
    }

    // 채팅방 나가기
    @Operation(summary = "채팅방 나가기", description = """
    ## 채팅방을 나갑니다.
    """)
    @DeleteMapping("/rooms/{roomId}")
    public ApiResponse<?> leaveChatRoom(
            @AuthenticationPrincipal AuthDetails authDetails, @PathVariable Long roomId) {
        chatSaver.leaveChatRoom(roomId, authDetails.getMemberId());
        return ApiResponse.success();
    }
}
