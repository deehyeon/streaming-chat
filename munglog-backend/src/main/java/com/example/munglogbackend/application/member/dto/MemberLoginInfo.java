package com.example.munglogbackend.application.member.dto;

import com.example.munglogbackend.domain.member.dto.MemberInfo;
import com.example.munglogbackend.domain.member.dto.TokenInfo;

public record MemberLoginInfo(
        TokenInfo tokenInfo,

        MemberInfo memberInfo
) {
    public static MemberLoginInfo from(TokenInfo tokenInfo, MemberInfo memberInfo) {
        return new MemberLoginInfo(tokenInfo, memberInfo);
    }
}
