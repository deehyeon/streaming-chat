package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatMessage;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String>, ChatMessageRepositoryCustom {
    // 최근 메시지 N건: roomId 일치, seq DESC, limit(pageable)
    List<ChatMessage> findByRoomIdOrderBySeqDesc(Long roomId, Pageable pageable);

    // 특정 seq 이전 N건 조회
    List<ChatMessage> findByRoomIdAndSeqLessThanOrderBySeqDesc(Long roomId, Long beforeSeq, Pageable pageable);
}