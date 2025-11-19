package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.QChatMessage;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepositoryImpl implements ChatMessageRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    @Override
    public Map<Long, Long> findMaxSeqForRoomIds(Collection<Long> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) {
            return Map.of();
        }

        QChatMessage chatMessage = QChatMessage.chatMessage;

        // roomId 별 max(seq) 조회
        List<Tuple> results = queryFactory
                .select(
                        chatMessage.room.id,
                        chatMessage.seq.max()
                )
                .from(chatMessage)
                .where(chatMessage.room.id.in(roomIds))
                .groupBy(chatMessage.room.id)
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .fetch();

        // 기본값 0으로 채워두고 결과 덮어쓰기
        Map<Long, Long> map = new LinkedHashMap<>();
        for (Long id : roomIds) {
            map.put(id, 0L);
        }

        for (Tuple tuple : results) {
            Long roomId = tuple.get(chatMessage.room.id);
            Long maxSeq = tuple.get(chatMessage.seq.max());

            if (roomId != null && maxSeq != null) {
                map.put(roomId, maxSeq);
            }
        }

        return map;
    }
}