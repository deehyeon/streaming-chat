package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    // roomId, memberId로 찾기
    Optional<ChatParticipant> findByChatRoom_IdAndMember_Id(Long roomId, Long memberId);

    // roomId에 해당하는 ChatParticipant 리스트 구하기
    List<ChatParticipant> findAllByChatRoomId(Long roomId);

    // memberId에 해당하는 ChatParticipant 리스트 구하기
    List<ChatParticipant> findAllByMember_Id(Long memberId);
}
