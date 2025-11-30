package com.example.munglogbackend.application.volunteer_application.dto;

import com.example.munglogbackend.domain.member.Member;
import io.swagger.v3.oas.annotations.media.Schema;

public record ApplicantInfo(
        @Schema(description = "신청자 ID", example = "1")
        Long memberId,

        @Schema(description = "신청자 이름", example = "홍길동")
        String name,

        @Schema(description = "신청자 이메일", example = "hong@example.com")
        String email
) {
    public static ApplicantInfo from(Member member) {
        return new ApplicantInfo(
                member.getId(),
                member.getName(),
                member.getEmail().toString()
        );
    }
}