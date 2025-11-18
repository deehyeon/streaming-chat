package com.example.munglogbackend.application.chat.required;

import com.example.munglogbackend.domain.chat.entity.ChatRoom;

import java.util.Optional;

public interface ChatRoomRepositoryCustom {
    Optional<ChatRoom> findByMembers(Long memberAId, Long memberBId);
}