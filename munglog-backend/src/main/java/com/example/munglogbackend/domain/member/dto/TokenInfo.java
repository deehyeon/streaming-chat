package com.example.munglogbackend.domain.member.dto;

public record TokenInfo(
        String accessToken,

        String refreshToken
) {
    public static TokenInfo of(String accessToken, String refreshToken) {
        return new TokenInfo(accessToken, refreshToken);
    }
}