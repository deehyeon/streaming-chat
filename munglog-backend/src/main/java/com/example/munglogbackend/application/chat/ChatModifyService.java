package com.example.munglogbackend.application.chat;

import com.example.munglogbackend.application.chat.provided.ChatMessageFinder;
import com.example.munglogbackend.application.chat.provided.ChatParticipantFinder;
import com.example.munglogbackend.application.chat.provided.ChatRoomFinder;
import com.example.munglogbackend.application.chat.provided.ChatSaver;
import com.example.munglogbackend.application.chat.required.ChatMessageRepository;
import com.example.munglogbackend.application.chat.required.ChatRoomRepository;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.config.monitoring.WebSocketMetricsConfig;
import com.example.munglogbackend.domain.chat.entity.ChatMessage;
import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.enumerate.ChatRoomType;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.example.munglogbackend.domain.member.Member;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ChatModifyService implements ChatSaver {
    private final MemberFinder memberFinder;
    private final ChatRoomFinder chatRoomFinder;
    private final ChatMessageFinder chatMessageFinder;
    private final ChatParticipantFinder chatParticipantFinder;

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSeqGenerator chatSeqGenerator;

    private final RabbitTemplate rabbitTemplate;
    private final WebSocketMetricsConfig metricsConfig;

    @Override
    public Long createPrivateChatRoom(Long memberAId, Long memberBId) {
        if(memberAId.equals(memberBId)) {throw new ChatException(ChatErrorType.SELF_CHAT_NOT_ALLOWED);}

        Member memberA = memberFinder.findActiveById(memberAId);
        Member memberB = memberFinder.findActiveById(memberBId);

        Optional<ChatRoom> chatRoomBetweenMembers = chatRoomRepository.findByMembers(memberAId, memberBId);
        if (chatRoomBetweenMembers.isPresent()) {return chatRoomBetweenMembers.get().getId();}

        ChatRoom chatRoom = ChatRoom.createPrivateChatRoom(memberA, memberB);
        ChatRoom newChatRoom = chatRoomRepository.save(chatRoom);

        return newChatRoom.getId();
    }

    @Override
    public Long createGroupChatRoom(Long creatorId, List<Long> otherMemberIds) {
        memberFinder.findActiveById(creatorId);

        List<Long> allMemberIds = new ArrayList<>();
        allMemberIds.add(creatorId);
        allMemberIds.addAll(otherMemberIds);
        List<Long> uniqueMemberIds = allMemberIds.stream().distinct().toList();

        // Fetch members
        List<Member> members = uniqueMemberIds.stream()
                .map(memberFinder::findActiveById)
                .toList();

        ChatRoom chatRoom = ChatRoom.createGroupChatRoom(members);
        chatRoomRepository.save(chatRoom);
        return chatRoom.getId();
    }

    @Override
    public void joinGroupChatRoom(Long memberId, Long roomId) {
        Member member = memberFinder.findActiveById(memberId);
        ChatRoom chatRoom = chatRoomFinder.findRoomByRoomId(roomId);

        if (chatRoom.getChatRoomType() != ChatRoomType.GROUP) {
            throw new ChatException(ChatErrorType.NOT_GROUP_CHAT);
        }

        chatRoom.addMember(member);
    }

    @Override
    public ChatMessage sendMessage(ChatMessageDto request) {
        Timer.Sample sample = metricsConfig.startTimer();

        try {
            // 채팅방 및 발신자 검증
            ChatRoom chatRoom = chatRoomFinder.findRoomByRoomId(request.roomId());
            Member sender = memberFinder.findActiveById(request.senderId());
            chatParticipantFinder.findByRoomIdAndMemberId(chatRoom.getId(), sender.getId());

            // 채팅 메시지 저장
            long seq = chatSeqGenerator.nextSeq(chatRoom.getId());
            ChatMessage chatMessage = ChatMessage.create(request, seq, chatRoom.getId(), sender.getId());
            ChatMessage saved = chatMessageRepository.save(chatMessage);
            chatRoom.updateLastMessage(saved.getCreatedAt(), saved.getContent());

            // 발신자 본인의 읽음 처리 업데이트
            updateLastRead(request.roomId(), request.senderId());
            long currentSeq = chatMessageFinder.findLatestMessageSeq(request.roomId());

            // STOMP 채팅방으로 브로드캐스트
            String destination = "/topic/chat.room." + request.roomId();
            rabbitTemplate.convertAndSend(destination, toPayload(chatMessage));

            // 메시지 전송 카운트 추가
            metricsConfig.recordMessageSent("chat_message", true);

            // 채팅방 요약 정보 개인 토픽으로 전송
            List<ChatParticipant> chatRoomMembers = chatParticipantFinder.findChatParticipants(request.roomId());
            for (ChatParticipant participant : chatRoomMembers) {
                Long memberId = participant.getMember().getId();

                // 읽지 않은 메시지 수 계산
                long unread = getUnreadMessageCount(request, participant, memberId, currentSeq);

                String userDestination = "/topic/user." + memberId + ".room-summary";
                rabbitTemplate.convertAndSend(userDestination, ChatRoomSummary.of(chatRoom, unread, chatRoom.getChatRoomType(), chatRoom.getLastMessagePreview(), chatRoom.getLastMessageAt()));

                // 개인 토픽 전송도 카운트
                metricsConfig.recordMessageSent("user_room_summary", false);

                log.info("📡 [convertAndSend] 개인 토픽 전송: /topic/user.{}.room-summary", memberId);
            }
            return chatMessage;

        } catch (Exception e) {
            metricsConfig.recordMessageFailure();
            log.error("메시지 전송 실패", e);
            throw e;
        } finally {
            metricsConfig.stopTimer(sample, "send_message");
        }
    }

    @Override
    public void leaveChatRoom(Long roomId, Long memberId) {
        ChatRoom chatRoom = chatRoomFinder.findRoomByRoomId(roomId);

        chatRoom.removeMember(memberId);

        if(chatRoom.getMembers().isEmpty()) {
            chatRoomRepository.delete(chatRoom);
        }
    }

    @Override
    public void updateLastRead(Long roomId, Long memberId) {
        chatRoomFinder.findRoomByRoomId(roomId);
        ChatParticipant participant = chatParticipantFinder.findByRoomIdAndMemberId(roomId, memberId);
        long lastReadSeq = chatMessageFinder.findLatestMessageSeq(roomId);

        participant.updateLastRead(lastReadSeq);
    }

    private Map<String, Object> toPayload(ChatMessage m) {
        Map<String, Object> payload = new HashMap<>();

        payload.put("roomId",   m.getRoomId());                 // 반드시 값 있음
        payload.put("senderId", m.getSenderId());               // 반드시 값 있음
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

    private static long getUnreadMessageCount(ChatMessageDto request, ChatParticipant participant, Long memberId, long currentSeq) {
        long lastReadSeq = Optional.ofNullable(participant.getLastReadSeq()).orElse(0L);
        long unread = memberId.equals(request.senderId()) ? 0L : Math.max(0, currentSeq - lastReadSeq);
        return unread;
    }
}
