package com.example.munglogbackend.application.chat.required;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepositoryImpl implements ChatMessageRepositoryCustom {

    private final StringRedisTemplate stringRedisTemplate;

    private String key(Long roomId) {
        return "chat:room:" + roomId + ":seq";
    }

    @Override
    public Map<Long, Long> findMaxSeqForRoomIds(Collection<Long> roomIds) {
        Map<Long, Long> result = new LinkedHashMap<>();

        if (roomIds == null || roomIds.isEmpty()) {
            return result;
        }

        // 입력 순서를 유지하면서 기본값 0L 세팅
        roomIds.forEach(id -> result.put(id, 0L));

        // Redis multiGet 사용 (한 번에 조회)
        List<String> keys = roomIds.stream()
                .map(this::key)
                .toList();

        List<String> values = stringRedisTemplate.opsForValue().multiGet(keys);

        if (values == null) {
            return result;
        }

        int idx = 0;
        for (Long roomId : roomIds) {
            if (idx >= values.size()) break;

            String value = values.get(idx++);
            if (value != null) {
                try {
                    long seq = Long.parseLong(value);
                    result.put(roomId, seq);
                } catch (NumberFormatException e) {
                    // 잘못된 값이면 그냥 0 유지
                }
            }
        }

        return result;
    }
    @Override
    public long findLatestMessageSeq(Long roomId) {
        String value = stringRedisTemplate.opsForValue().get(key(roomId));

        if (value == null) {
            return 0L; // 메시지 없는 방 → seq=0
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L; // 잘못 저장된 값이 있다면 기본값 반환
        }
    }
}
