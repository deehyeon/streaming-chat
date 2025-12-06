package com.example.munglogbackend.application.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatSeqGenerator {
    private final StringRedisTemplate stringRedisTemplate;

    private String key(Long roomId) {
        return "chat:room:" + roomId + ":seq";
    }

    public long nextSeq(Long roomId) {
        Long value = stringRedisTemplate
                .opsForValue()
                .increment(key(roomId));
        if (value == null) {
            throw new IllegalStateException("Redis INCR 실패 (roomId=" + roomId + ")");
        }
        return value;
    }
}