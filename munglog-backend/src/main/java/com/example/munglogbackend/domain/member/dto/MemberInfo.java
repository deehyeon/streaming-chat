package com.example.munglogbackend.domain.member.dto;

import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;

public record MemberInfo(
        Long memberId,

        String memberName,

        MemberRole memberRole
) {
    public static MemberInfo from(Member member) {
        return new MemberInfo(
                member.getId(),
                member.getName(),
                member.getRole()
        );
    }
}