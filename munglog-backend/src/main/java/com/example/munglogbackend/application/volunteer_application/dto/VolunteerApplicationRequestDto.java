package com.example.munglogbackend.application.volunteer_application.dto;

import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record VolunteerApplicationRequestDto(
        @Schema(description = "보호소 ID", example = "1")
        @NotNull(message = "보호소 ID는 필수입니다.")
        Long shelterId,

        @Schema(description = "봉사 신청 날짜", example = "2025-12-25")
        @NotNull(message = "봉사 날짜는 필수입니다.")
        @FutureOrPresent(message = "봉사 날짜는 오늘 이후여야 합니다.")
        LocalDate volunteerDate,

        @Schema(description = "봉사 시작 시간", example = "09:00:00")
        @NotNull(message = "시작 시간은 필수입니다.")
        LocalTime startTime,

        @Schema(description = "봉사 종료 시간", example = "17:00:00")
        @NotNull(message = "종료 시간은 필수입니다.")
        LocalTime endTime,

        @Schema(description = "신청 메시지 (선택)", example = "반려동물을 사랑하는 마음으로 봉사하고 싶습니다.")
        @Size(max = 500, message = "신청 메시지는 500자 이하여야 합니다.")
        String description
) {
    public VolunteerApplication toEntity(Member member, Shelter shelter) {
        return VolunteerApplication.createApplication(
                member,
                shelter,
                volunteerDate,
                startTime,
                endTime,
                description
        );
    }
}