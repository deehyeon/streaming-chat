package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatParticipant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    // 기존 메서드: @EntityGraph 추가
    @EntityGraph(attributePaths = {"member", "chatRoom"})
    Optional<ChatParticipant> findByChatRoom_IdAndMember_Id(Long roomId, Long memberId);

    // roomId에 해당하는 ChatParticipant 리스트 (Member 포함)
    @EntityGraph(attributePaths = {"member"})
    List<ChatParticipant> findAllByChatRoomId(Long chatRoomId);

    // memberId에 해당하는 ChatParticipant 리스트 (ChatRoom 포함)
    @EntityGraph(attributePaths = {"chatRoom"})
    List<ChatParticipant> findAllByMember_Id(Long memberId);

    // 나를 제외한 참가자 (Member 포함)
    @EntityGraph(attributePaths = {"member"})
    @Query("""
        SELECT cp
        FROM ChatParticipant cp
        WHERE cp.chatRoom.id = :roomId
          AND cp.member.id <> :memberId
        """)
    List<ChatParticipant> findAllByChatRoom_IdAndMember_IdNot(
            @Param("roomId") Long roomId,
            @Param("memberId") Long memberId
    );
}