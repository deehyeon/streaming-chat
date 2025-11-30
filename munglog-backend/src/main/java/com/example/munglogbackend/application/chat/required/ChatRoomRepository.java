package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.chat.enumerate.ChatRoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long>, ChatRoomRepositoryCustom {
    @Query("select c from ChatRoom c where c.chatRoomType = :type")
    List<ChatRoom> findAllByChatRoomType(@Param("type") ChatRoomType type);
}