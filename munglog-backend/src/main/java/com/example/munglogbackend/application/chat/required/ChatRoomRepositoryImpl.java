package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.entity.QChatParticipant;
import com.example.munglogbackend.domain.chat.entity.QChatRoom;
import com.example.munglogbackend.domain.chat.exception.ChatErrorType;
import com.example.munglogbackend.domain.chat.exception.ChatException;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Objects;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ChatRoomRepositoryImpl implements ChatRoomRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<ChatRoom> findByMembers(Long memberAId, Long memberBId) {
        if (Objects.equals(memberAId, memberBId)) {
            throw new ChatException(ChatErrorType.SELF_CHAT_NOT_ALLOWED);
        }

        QChatRoom cr = QChatRoom.chatRoom;
        QChatParticipant p = QChatParticipant.chatParticipant;

        // 방 전체 인원이 2명인지 확인하는 서브쿼리
        BooleanExpression totalParticipantCount = JPAExpressions
                .select(p.count())
                .from(p)
                .where(p.chatRoom.eq(cr))
                .eq(2L);

        // memberA가 이 방에 존재하는지
        BooleanExpression hasMemberA = JPAExpressions
                .selectOne()
                .from(p)
                .where(
                        p.chatRoom.eq(cr)
                                .and(p.member.id.eq(memberAId))
                )
                .exists();

        // memberB가 이 방에 존재하는지
        BooleanExpression hasMemberB = JPAExpressions
                .selectOne()
                .from(p)
                .where(
                        p.chatRoom.eq(cr)
                                .and(p.member.id.eq(memberBId))
                )
                .exists();

        ChatRoom room = queryFactory
                .select(cr)
                .from(cr)
                .where(
                        totalParticipantCount,
                        hasMemberA,
                        hasMemberB
                )
                .fetchOne();

        return Optional.ofNullable(room);
    }
}
