package com.example.munglogbackend.domain.member.dto;

import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;

public record MemberRequest(
        String name,
        Email email,
        String password,
        MemberRole role,
        Address address
) {
    public static MemberRequest of(
            String name,
            Email email,
            String password,
            MemberRole role,
            Address address
    ) {
        return new MemberRequest(name, email, password, role, address);
    }
    public static Member toEntity(MemberRequest request) {
        return Member.create(request);
    }
}
