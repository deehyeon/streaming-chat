package com.example.munglogbackend.application.chat;

import com.example.munglogbackend.application.chat.provided.ChatFinder;
import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.application.chat.required.ChatMessageRepository;
import com.example.munglogbackend.application.chat.required.ChatParticipantRepository;
import com.example.munglogbackend.application.chat.required.ChatRoomRepository;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.domain.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.domain.chat.entity.ChatMessage;
import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.example.munglogbackend.domain.member.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ChatModifyService implements ChatSaver {
    private final MemberFinder memberFinder;
    private final ChatFinder chatFinder;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;

    private final SimpMessagingTemplate messagingTemplate;     // STOMP 브로드캐스트

    @Override
    public Long create(Long memberAId, Long memberBId) {
        if(memberAId.equals(memberBId)) {throw new ChatException(ChatErrorType.SELF_CHAT_NOT_ALLOWED);}

        Member memberA = memberFinder.findById(memberAId);
        Member memberB = memberFinder.findById(memberBId);

        Optional<ChatRoom> chatRoomBetweenMembers = chatRoomRepository.findByMembers(memberAId, memberBId);
        if (chatRoomBetweenMembers.isPresent()) {return chatRoomBetweenMembers.get().getId();}

        ChatRoom chatRoom = ChatRoom.createWithMembers(List.of(memberA, memberB));
        ChatRoom newChatRoom = chatRoomRepository.save(chatRoom);

        return newChatRoom.getId();
    }

    @Override
    public ChatMessage sendMessage(ChatMessageDto request) {
        // 채팅방 및 발신자 검증
        ChatRoom chatRoom = chatRoomRepository.findById(request.roomId()).orElseThrow(() -> new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND));
        Member sender = memberFinder.findById(request.senderId());
        chatParticipantRepository.findByChatRoom_IdAndMember_Id(request.roomId(), sender.getId()).orElseThrow(() -> new ChatException(ChatErrorType.MEMBER_NOT_IN_CHAT_ROOM));

        // 채팅 메시지 저장
        long seq = chatFinder.findLatestMessageSeq(request.roomId()) + 1;
        ChatMessage chatMessage = ChatMessage.create(request, seq, chatRoom, sender);
        ChatMessage saved = chatMessageRepository.save(chatMessage);
        chatRoom.updateLastMessage(saved.getCreatedAt(), saved.getContent());

        // 발신자 본인의 읽음 처리 업데이트
        updateLastRead(request.roomId(), request.senderId());
        long currentSeq = chatFinder.fetchCurrentRoomLatestSeq(request.roomId());

        // STOMP 채팅방으로 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/room/" + request.roomId(), toPayload(chatMessage));

        // 채팅방 요약 정보 개인 토픽으로 전송
        List<ChatParticipant> chatRoomMembers = chatFinder.findChatParticipants(request.roomId());
        for (ChatParticipant m : chatRoomMembers) {
            Long memberId = m.getMember().getId();

            // 읽지 않은 메시지 수 계산
            long unread = getUnreadMessageCount(request, m, memberId, currentSeq);

            messagingTemplate.convertAndSend("/topic/user." + memberId + ".room-summary", ChatRoomSummary.of(chatRoom, unread, chatRoom.getLastMessagePreview(), chatRoom.getLastMessageAt()));
            log.info("📡 [convertAndSend] 개인 토픽 전송: /topic/user.{}.room-summary", memberId);
        }
        return chatMessage;
    }

    @Override
    public void leaveChatRoom(Long roomId, Long memberId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND));

        chatRoom.removeMember(memberId);

        if(chatRoom.getMembers().isEmpty()) {
            chatRoomRepository.delete(chatRoom);
        }
    }

    @Override
    public void updateLastRead(Long roomId, Long memberId) {
        chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND));

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndMember_Id(roomId, memberId)
                .orElseThrow(() -> new ChatException(ChatErrorType.NOT_INCLUDED_IN_CHAT_ROOM));

        long lastReadSeq = chatFinder.findLatestMessageSeq(roomId);

        participant.updateLastRead(lastReadSeq);
    }

    private Map<String, Object> toPayload(ChatMessage m) {
        Map<String, Object> payload = new HashMap<>();

        payload.put("roomId",   m.getRoom().getId());                 // 반드시 값 있음
        payload.put("senderId", m.getSender().getId());               // 반드시 값 있음
        payload.put("type",     m.getType().name());     // enum은 name()로 문자열 전송 권장
        payload.put("seq",      m.getSeq());
        payload.put("createdAt", m.getCreatedAt());

        // TEXT/SYSTEM일 때만 content
        if (m.getContent() != null && !m.getContent().isBlank()) {
            payload.put("content", m.getContent());
        }
        // IMAGE/VIDEO/FILE일 때만 파일 정보
        if (m.getFileUrl() != null && !m.getFileUrl().isBlank()) {
            payload.put("fileUrl", m.getFileUrl());
        }
        if (m.getFileName() != null && !m.getFileName().isBlank()) {
            payload.put("fileName", m.getFileName());
        }
        if (m.getFileSize() != null) {
            payload.put("fileSize", m.getFileSize());
        }

        return payload;
    }

    private static long getUnreadMessageCount(ChatMessageDto request, ChatParticipant m, Long memberId, long currentSeq) {
        long lastReadSeq = Optional.ofNullable(m.getLastReadSeq()).orElse(0L);
        long unread = memberId.equals(request.senderId()) ? 0L : Math.max(0, currentSeq - lastReadSeq);
        return unread;
    }
}
