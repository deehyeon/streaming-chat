package com.example.munglogbackend.domain.chat.entity;

import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
        name = "chat_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"chat_room_id", "member_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatParticipant extends AbstractEntity {
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "chat_room_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "member_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;

    @Column(nullable = false)
    private Long lastReadSeq = 0L;

    @Column(nullable = true)
    private Instant lastReadAt;

    private ChatParticipant(ChatRoom chatRoom, Member member) {
        this.chatRoom = chatRoom;
        this.member = member;
    }

    public static ChatParticipant create(ChatRoom chatRoom, Member member) {
        return new ChatParticipant(chatRoom, member);
    }

    /**
     * 읽음 위치 업데이트
     * - 읽은 시각 자동 갱신
     */
    public void updateLastRead(long seq) {
        if (seq > (lastReadSeq == null ? 0 : lastReadSeq)) {
            lastReadSeq = seq;
            lastReadAt = Instant.now();
        }
    }
}
