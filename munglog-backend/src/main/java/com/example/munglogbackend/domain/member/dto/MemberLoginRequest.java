package com.example.munglogbackend.domain.member.dto;

public record MemberLoginRequest(
        String email,
        String password
) {
    public static MemberLoginRequest of(MemberSignUpRequest request) {
        return new MemberLoginRequest(request.email(), request.password());
    }
}
