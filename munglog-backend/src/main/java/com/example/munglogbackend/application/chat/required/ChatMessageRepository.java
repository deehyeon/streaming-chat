package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>, ChatMessageRepositoryCustom {
    // 최근 메시지 N건: roomId 일치, seq DESC, limit(pageable)
    List<ChatMessage> findByRoomIdOrderBySeqDesc(Long roomId, Pageable pageable);

    // 최신 1건 조회
    Optional<ChatMessage> findTopByRoomIdOrderByCreatedAtDesc(Long roomId);

    // 특정 seq 이전 N건 조회
    List<ChatMessage> findByRoomIdAndSeqLessThanOrderBySeqDesc(Long roomId, Long beforeSeq, Pageable pageable);
}