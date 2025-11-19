package com.example.munglogbackend.domain.chat.dto;

import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.enumerate.MessageType;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record ChatRoomSummary(
        Long roomId,
        long unreadCount,
        String lastMessagePreview,     // 미리보기용 문자열
        LocalDateTime lastMessageAt
) {
    public static ChatRoomSummary of(ChatRoom room, long unread, String lastMessagePreview, Instant lastMessageAt) {
        return new ChatRoomSummary(
                room.getId(),
                unread,
                lastMessagePreview,
                toLocalDateTime(lastMessageAt)
        );
    }

    private static String makePreview(ChatMessageDto last) {
        if (last == null) return "";
        MessageType mt = (last.type() != null) ? last.type() : MessageType.TEXT;

        return switch (mt) {
            case TEXT  -> trim(last.content(), 30);
            case IMAGE -> "[이미지]";
            case VIDEO -> "[동영상]";
            case FILE  -> "[파일]";
            case AUDIO -> "[음성]";
            case SYSTEM -> trim(last.content(), 30);
        };
    }

    private static LocalDateTime toLocalDateTime(Instant instant) {
        return (instant == null) ? null : LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    private static String trim(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}
