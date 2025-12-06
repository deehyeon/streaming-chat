package com.example.munglogbackend.config.init;

import com.example.munglogbackend.application.chat.required.ChatRoomRepository;
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
     * 부하 테스트용 GROUP 채팅방 100개를 만들고
     * 각 방에 멤버 100명씩 참가자로 넣는다.
     * 총 10,000명 = 100개 방 × 100명
     *
     * @return 생성된 ChatRoom ID 리스트
     */
    @Transactional
    public List<Long> createLoadTestGroupRooms() {
        // 1. 멤버 10,000명 조회
        List<Long> allMemberIds = new ArrayList<>();
        for (long i = 1; i <= 10_000; i++) {
            allMemberIds.add(i);
        }

        List<Member> allMembers = memberRepository.findAllById(allMemberIds);

        if (allMembers.size() != allMemberIds.size()) {
            throw new IllegalStateException(
                    "멤버 10,000명이 모두 조회되지 않았습니다. (조회된 수=" + allMembers.size() + ")"
            );
        }

        // 2. 100개 방 생성 (각 방에 100명씩)
        List<Long> createdRoomIds = new ArrayList<>();

        for (int roomIndex = 0; roomIndex < 100; roomIndex++) {
            // 각 방의 시작/끝 인덱스 계산
            int startIdx = roomIndex * 100;
            int endIdx = startIdx + 100;

            // 해당 방에 들어갈 100명 추출
            List<Member> roomMembers = allMembers.subList(startIdx, endIdx);

            // GROUP 채팅방 생성
            ChatRoom room = ChatRoom.createGroupChatRoom(roomMembers);
            chatRoomRepository.save(room);

            createdRoomIds.add(room.getId());

            // 로그 (선택사항)
            if ((roomIndex + 1) % 10 == 0) {
                System.out.println("📊 진행: " + (roomIndex + 1) + "/100 방 생성 완료");
            }
        }

        System.out.println("✅ 총 " + createdRoomIds.size() + "개 채팅방 생성 완료 (총 참가자: 10,000명)");

        return createdRoomIds;
    }
}