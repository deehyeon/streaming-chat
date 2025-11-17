package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("""
        SELECT cr
        FROM ChatRoom cr
        JOIN cr.members p
        WHERE p.member.id IN (:memberAId, :memberBId)
        GROUP BY cr.id
        HAVING COUNT(p.id) = 2
    """)
    Optional<ChatRoom> findByMembers(Long memberAId, Long memberBId);
}