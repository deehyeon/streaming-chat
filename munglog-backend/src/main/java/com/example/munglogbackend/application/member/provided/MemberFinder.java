package com.example.munglogbackend.application.member.provided;

import com.example.munglogbackend.domain.member.Member;

/**
 * 회원을 조회한다.
 */
public interface MemberFinder {
    Member findById(Long memberId);
    Member findByEmail(String email);
}
