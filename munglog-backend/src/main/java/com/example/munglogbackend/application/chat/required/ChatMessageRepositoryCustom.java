package com.example.munglogbackend.application.chat.required;

import java.util.Collection;
import java.util.Map;

public interface ChatMessageRepositoryCustom {
    Map<Long, Long> findMaxSeqForRoomIds(Collection<Long> roomIds);
    long findLatestMessageSeq(Long roomId);
}