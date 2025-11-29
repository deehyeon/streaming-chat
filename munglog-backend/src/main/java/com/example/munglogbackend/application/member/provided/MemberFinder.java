package com.example.munglogbackend.application.member.provided;

import com.example.munglogbackend.domain.member.Member;

import java.util.List;

/**
 * 회원을 조회한다.
 */
public interface MemberFinder {
    // 기본적으로 '서비스에서 쓰는 활성 회원'만 조회
    Member findActiveById(Long memberId);
    Member findActiveByEmail(String email);
    List<Member> findAllActive();

    // 삭제된 회원만 조회 (복구, 감사 로그, 관리자 페이지 등)
    Member findDeletedById(Long memberId);

    // 삭제 여부 상관없이 무조건 찾는 메서드
    Member findAnyById(Long memberId);
}
