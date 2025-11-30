package com.example.munglogbackend.domain.chat.entity;

import com.example.munglogbackend.domain.chat.enumerate.ChatRoomType;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends AbstractEntity {
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatParticipant> members = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ChatRoomType chatRoomType;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "last_message_preview")
    private String lastMessagePreview;

    private static ChatRoom create() {
        ChatRoom room = new ChatRoom();
        room.lastMessageAt = Instant.now();
        room.lastMessagePreview = null;
        return room;
    }

    public static ChatRoom createPrivateChatRoom(Member memberA, Member memberB) {
        ChatRoom room = create();
        room.chatRoomType = ChatRoomType.PRIVATE;
        room.addMember(memberA);
        room.addMember(memberB);
        return room;
    }

    public static ChatRoom createGroupChatRoom(List<Member> members) {
        ChatRoom room = create();
        room.chatRoomType = ChatRoomType.GROUP;
        members.forEach(room::addMember);
        return room;
    }
    public void updateLastMessage(Instant lastMessageAt, String lastMessagePreview) {
        this.lastMessageAt = lastMessageAt;
        this.lastMessagePreview = lastMessagePreview;
    }

    public void addMember(Member member) {
        boolean exists = members.stream()
                .anyMatch(m -> m.getMember().getId().equals(member.getId()));
        if (exists) throw new ChatException(ChatErrorType.ALREADY_IN_CHAT_ROOM);

        members.add(ChatParticipant.create(this, member));
    }

    public void removeMember(Long memberId) {
        ChatParticipant participant = members.stream()
                .filter(m -> m.getMember().getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ChatException(ChatErrorType.NOT_INCLUDED_IN_CHAT_ROOM));
        members.remove(participant);
    }
}
