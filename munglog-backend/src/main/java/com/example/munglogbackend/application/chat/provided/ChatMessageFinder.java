package com.example.munglogbackend.application.chat.provided;

import com.example.munglogbackend.application.chat.dto.ChatMessageDto;
import org.springframework.data.domain.Slice;

public interface ChatMessageFinder {
    // 특정 seq 이전 N건 조회하기
    Slice<ChatMessageDto> fetchMessagesBeforeSeq(Long roomId, Long beforeSeq, int size, Long memberId);

    // 특정 채팅방의 최신 메시지 seq 조회
    long findLatestMessageSeq(Long roomId);
}
