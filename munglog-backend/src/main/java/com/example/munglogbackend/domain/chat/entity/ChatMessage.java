package com.example.munglogbackend.domain.chat.entity;

import com.example.munglogbackend.domain.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.enumerate.MessageType;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.example.munglogbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {
    @Id
    @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatRoom room;   // 채팅방

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;   // 보낸 사람

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type; // TEXT, IMAGE, VIDEO, FILE 등

    private String fileUrl;   // 파일 URL
    private String fileName;  // 파일명
    private Long fileSize;    // 파일 크기

    @Column(nullable = false)
    private Long seq;         // 메시지 정렬용 시퀀스 번호

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "modified_at")
    private Instant modifiedAt;

    /** 메시지 생성 시 검증 */
    public static ChatMessage create(ChatMessageDto req, long seq, ChatRoom chatRoom, Member sender) {
        MessageType mt = (req.type() != null) ? req.type() : MessageType.TEXT;

        switch (mt) {
            case TEXT -> {
                if (req.content() == null || req.content().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE); // 내용 필요
                }
            }
            case IMAGE, VIDEO, FILE -> {
                if (req.fileUrl() == null || req.fileUrl().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE); // 파일 URL 필요
                }
            }
            case SYSTEM -> {
                if (req.content() == null || req.content().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE); // 시스템 메시지 내용 필요
                }
            }
        }

        return ChatMessage.builder()
                .room(chatRoom)
                .sender(sender)
                .type(mt)
                .content(req.content())    // TEXT/SYSTEM이면 사용
                .fileUrl(req.fileUrl())    // IMAGE/VIDEO/FILE이면 사용
                .fileName(req.fileName())
                .fileSize(req.fileSize())
                .seq(seq)
                .createdAt(Instant.now())
                .build();
    }

    /** 시스템 메시지 생성 (예: 누가 입장했을 때) */
    public static ChatMessage system(ChatRoom room, String content, long seq) {
        ChatMessageDto systemMessage = ChatMessageDto.system(room, content);
        return ChatMessage.create(systemMessage, seq, room, null);
    }
}