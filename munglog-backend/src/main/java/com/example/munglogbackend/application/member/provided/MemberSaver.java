package com.example.munglogbackend.application.member.provided;

import com.example.munglogbackend.domain.member.Member;

/**
 * 회원 정보를 수정한다.
 * **/
public interface MemberSaver {
    Long softDelete(Long memberId);
    Long restore(Long memberId);
    Long save(Member member); // 회원가입은 그대로 Member
    void changePassword(Long memberId, String newHashedPassword);
    void hardDelete(Long memberId);
}