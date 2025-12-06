package com.example.munglogbackend.domain.chat.entity;

import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import com.example.munglogbackend.domain.chat.enumerate.MessageType;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "chat_messages")
public class ChatMessage {
    @Id
    private String id;   // MongoDB 기본 ID

    @Field("room_id")
    private Long roomId;   // 채팅방 ID (문자열로 저장)

    @Field("sender_id")
    private Long senderId; // 발신자 ID

    @Field("content")
    private String content;

    @Field("type")
    private MessageType type; // TEXT, IMAGE, VIDEO, FILE, SYSTEM

    @Field("file_url")
    private String fileUrl;

    @Field("file_name")
    private String fileName;

    @Field("file_size")
    private Long fileSize;

    @Field("seq")
    private long seq; // 정렬용 시퀀스 번호 (MongoDB에서는 직접 관리)

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("modified_at")
    private Instant modifiedAt;


    /** 메시지 생성 정적 팩토리 */
    public static ChatMessage create(ChatMessageDto req, long seq, Long roomId, Long senderId) {
        MessageType mt = (req.type() != null) ? req.type() : MessageType.TEXT;

        // 검증
        switch (mt) {
            case TEXT -> {
                if (req.content() == null || req.content().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE);
                }
            }
            case IMAGE, VIDEO, FILE -> {
                if (req.fileUrl() == null || req.fileUrl().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE);
                }
            }
            case SYSTEM -> {
                if (req.content() == null || req.content().isBlank()) {
                    throw new ChatException(ChatErrorType.INVALID_MESSAGE);
                }
            }
        }

        return ChatMessage.builder()
                .roomId(roomId)
                .senderId(senderId)
                .type(mt)
                .content(req.content())
                .fileUrl(req.fileUrl())
                .fileName(req.fileName())
                .fileSize(req.fileSize())
                .seq(seq)
                .createdAt(Instant.now())
                .build();
    }
}