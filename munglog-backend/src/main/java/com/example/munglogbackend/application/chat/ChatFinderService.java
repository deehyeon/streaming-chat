package com.example.munglogbackend.application.chat;

import com.example.munglogbackend.application.chat.provided.ChatMessageFinder;
import com.example.munglogbackend.application.chat.provided.ChatParticipantFinder;
import com.example.munglogbackend.application.chat.provided.ChatRoomFinder;
import com.example.munglogbackend.application.chat.required.ChatMessageRepository;
import com.example.munglogbackend.application.chat.required.ChatParticipantRepository;
import com.example.munglogbackend.application.chat.required.ChatRoomRepository;
import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.application.chat.dto.ChatRoomSummary;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.domain.chat.entity.ChatMessage;
import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.enumerate.ChatRoomType;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.springframework.data.domain.Sort.Direction.DESC;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatFinderService implements ChatRoomFinder, ChatParticipantFinder, ChatMessageFinder {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberFinder memberFinder;

    /**
     * roomId에 해당하는 채팅방을 조회한다.
     * **/
    @Override
    public ChatRoom findRoomByRoomId(Long roomId) {
        return chatRoomRepository.findById(roomId).orElseThrow(() -> new ChatException(ChatErrorType.CHAT_ROOM_NOT_FOUND));
    }

    /**
     * roomId에 해당하는 채팅방의 참가자 목록을 조회한다.
     * **/
    @Override
    public List<ChatParticipant> findChatParticipants(Long roomId) {
        return chatParticipantRepository.findAllByChatRoomId(roomId);
    }

    /**
     * roomId에 해당하는 채팅방에서 나를 제외한 참가자 ID 목록을 조회한다.
     * **/
    @Override
    public List<Long> findChatParticipantIdsExcludingMe(Long roomId, Long memberId) {
        return chatParticipantRepository.findAllByChatRoom_IdAndMember_IdNot(roomId, memberId)
                .stream()
                .map(cp -> cp.getMember().getId())
                .toList();
    }

    /**
     * memberId가 참가하고 있는 채팅방 요약 리스트를 조회한다.
     * **/
    @Override
    public List<ChatRoomSummary> findRoomsByMember(Long memberId) {
        List<ChatParticipant> chatParticipants = chatParticipantRepository.findAllByMember_Id(memberId);
        List<ChatRoom> chatRooms = chatParticipants.stream()
                .map(ChatParticipant::getChatRoom)
                .distinct()
                .toList();
        List<Long> roomIds = chatRooms.stream().map(ChatRoom::getId).toList();

        // 방별 최신 seq
        Map<Long, Long> latestSeqMap = chatMessageRepository.findMaxSeqForRoomIds(roomIds);

        // 방별 unreadCount 계산
        Map<Long, Long> unreadMap = new HashMap<>();
        for (ChatParticipant cp : chatParticipants) {
            Long roomId = cp.getChatRoom().getId();
            long unread = getUnReadCount(cp, latestSeqMap, roomId);
            unreadMap.put(roomId, unread);
        }

        // 5) ChatRoomSummary 리스트로 반환
        return chatRooms.stream()
                .sorted(Comparator.comparing(ChatRoom::getLastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(room -> {
                    long unread = unreadMap.getOrDefault(room.getId(), 0L);
                    return ChatRoomSummary.of(room, unread,room.getChatRoomType(), room.getLastMessagePreview(), room.getLastMessageAt());
                }).toList();
    }

    /**
     * 모든 그룹 채팅방 요약 리스트를 조회한다.
     * **/
    @Override
    public List<ChatRoomSummary> findGroupChatRooms(Long memberId) {
        List<ChatParticipant> chatParticipants = chatParticipantRepository.findAllByMember_Id(memberId);
        memberFinder.findActiveById(memberId);
        List<ChatRoom> groupChatRooms = chatRoomRepository.findAllByChatRoomType(ChatRoomType.GROUP);

        List<Long> roomIds = groupChatRooms.stream().map(ChatRoom::getId).toList();

        // 방별 최신 seq
        Map<Long, Long> latestSeqMap = chatMessageRepository.findMaxSeqForRoomIds(roomIds);

        // 방별 unreadCount 계산
        Map<Long, Long> unreadMap = new HashMap<>();
        for (ChatParticipant cp : chatParticipants) {
            Long roomId = cp.getChatRoom().getId();
            long unread = getUnReadCount(cp, latestSeqMap, roomId);
            unreadMap.put(roomId, unread);
        }

        return groupChatRooms.stream()
                .sorted(Comparator.comparing(ChatRoom::getLastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(room -> {
                    long unread = unreadMap.getOrDefault(room.getId(), 0L);
                    return ChatRoomSummary.of(room, unread,room.getChatRoomType(), room.getLastMessagePreview(), room.getLastMessageAt());
                }).toList();
    }

    /**
     * roomId에 해당하는 채팅방의 beforeSeq 이전 메시지들을 size만큼 조회한다.
     * **/
    @Override
    public Slice<ChatMessageDto> fetchMessagesBeforeSeq(Long roomId, Long beforeSeq, int size, Long memberId) {
        // 멤버가 채팅방의 구성원인지 확인
        chatParticipantRepository.findByChatRoom_IdAndMember_Id(roomId, memberId)
                .orElseThrow(() -> new ChatException(ChatErrorType.MEMBER_NOT_IN_CHAT_ROOM));

        // 사이즈에 제한을 둔다.
        if (size > 100) {size = 100;}

        Pageable pageable = PageRequest.of(0, size + 1, Sort.by(DESC, "seq"));
        List<ChatMessage> rows;

        if (beforeSeq == null) {
            rows = chatMessageRepository.findByRoomIdOrderBySeqDesc(roomId, pageable);
        } else {
            rows = chatMessageRepository.findByRoomIdAndSeqLessThanOrderBySeqDesc(roomId, beforeSeq, pageable);
        }

        boolean hasNext = rows.size() > size;
        if (hasNext) rows = rows.subList(0, size);

        // 화면 노출은 보통 오래된→최신 순이 편하므로 ASC로 뒤집기
        Collections.reverse(rows);

        List<ChatMessageDto> content = rows.stream().map(ChatMessageDto::fromEntity).toList();
        return new SliceImpl<>(content, PageRequest.of(0, size), hasNext);
    }

    /**
     * roomId와 memberId에 해당하는 채팅방 참가자 정보를 조회한다.
     * **/
    @Override
    public ChatParticipant findByRoomIdAndMemberId(Long roomId, Long memberId) {
        return chatParticipantRepository
                .findByChatRoom_IdAndMember_Id(roomId, memberId)
                .orElseThrow(() -> new ChatException(ChatErrorType.NOT_INCLUDED_IN_CHAT_ROOM));

    }

    /**
     * memberId가 roomId 채팅방의 구성원인지 확인한다.
     * **/
    @Override
    public boolean isRoomMember(Long roomId, Long memberId) {
        return chatParticipantRepository.findByChatRoom_IdAndMember_Id(roomId, memberId).isPresent();
    }

    /**
     * roomId에 해당하는 채팅방의 최신 메시지 seq를 조회한다.
     * **/
    @Override
    public long findLatestMessageSeq(Long roomId) {
        return chatMessageRepository.findLatestMessageSeq(roomId);
    }

    /** 읽지 않은 메시지 수 계산 */
    private static long getUnReadCount(ChatParticipant cp, Map<Long, Long> latestSeqMap, Long roomId) {
        long lastReadSeq = cp.getLastReadSeq();
        long latestSeq = latestSeqMap.getOrDefault(roomId, 0L);
        return Math.max(latestSeq - lastReadSeq, 0L);
    }
}