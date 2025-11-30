package com.example.munglogbackend.application.volunteer_application.dto;

import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record VolunteerApplicationResponseDto(
        @Schema(description = "봉사 신청 ID", example = "1")
        Long applicationId,

        @Schema(description = "신청자 정보")
        ApplicantInfo applicant,

        @Schema(description = "보호소 정보")
        ShelterInfo shelter,

        @Schema(description = "봉사 신청 상태", example = "PENDING")
        VolunteerApplicationStatus status,

        @Schema(description = "봉사 날짜", example = "2025-12-25")
        LocalDate applicationDate,

        @Schema(description = "봉사 시작 시간", example = "09:00:00")
        LocalTime startTime,

        @Schema(description = "봉사 종료 시간", example = "17:00:00")
        LocalTime endTime,

        @Schema(description = "신청 메시지")
        String description,

        @Schema(description = "신청 생성일시")
        LocalDateTime createdAt,

        @Schema(description = "신청 수정일시")
        LocalDateTime modifiedAt
) {
    public static VolunteerApplicationResponseDto from(VolunteerApplication application) {
        return new VolunteerApplicationResponseDto(
                application.getId(),
                ApplicantInfo.from(application.getMember()),
                ShelterInfo.from(application.getShelter()),
                application.getStatus(),
                application.getVolunteerDate(),
                application.getStartTime(),
                application.getEndTime(),
                application.getDescription(),
                application.getCreatedAt(),
                application.getModifiedAt()
        );
    }
}
