package com.example.munglogbackend.application.member.provided;

import com.example.munglogbackend.application.member.dto.MemberLoginInfo;
import com.example.munglogbackend.application.member.dto.TokenResponse;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.dto.GoogleUserInfoDto;
import com.example.munglogbackend.domain.member.dto.MemberLoginRequest;
import com.example.munglogbackend.domain.member.dto.MemberSignUpRequest;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;

public interface Auth {
    MemberLoginInfo signup(MemberSignUpRequest request);
    MemberLoginInfo login(MemberLoginRequest request);
    void checkDuplicateEmail(Email email);
    TokenResponse refresh(String refreshToken);
    void createMemberByGoogle(GoogleUserInfoDto googleUserInfoDto, MemberRole memberRole);
}
