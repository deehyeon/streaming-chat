package com.example.munglogbackend.config.init;

import com.example.munglogbackend.application.chat.required.ChatRoomRepository;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.chat.entity.ChatRoom;
import com.example.munglogbackend.domain.member.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomLoader {

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;

    /**
     * 부하 테스트용 GROUP 채팅방을 만들고
     * 멤버 10,000명을 참가자로 넣는다.
     * @return 생성된 ChatRoom ID
     */
    @Transactional
    public Long createLoadTestGroupRoom() {
        // 1. 멤버 10,000명 조회
        //  - memberId가 1~10000 순차라고 가정한 예시
        //  - 아니라면 이메일로 조회하는 방식으로 바꿔도 됨
        List<Long> ids = new ArrayList<>();
        for (long i = 1; i <= 10_000; i++) {
            ids.add(i);
        }

        List<Member> members = memberRepository.findAllById(ids);

        if (members.size() != ids.size()) {
            throw new IllegalStateException("멤버 10,000명이 모두 조회되지 않았습니다. (조회된 수=" + members.size() + ")");
        }

        // 2. GROUP 채팅방 생성 + 참가자 10,000명 추가
        ChatRoom room = ChatRoom.createGroupChatRoom(members);
        chatRoomRepository.save(room);

        return room.getId();
    }
}
