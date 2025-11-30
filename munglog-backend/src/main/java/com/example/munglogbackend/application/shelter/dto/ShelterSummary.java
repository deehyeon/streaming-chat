package com.example.munglogbackend.application.shelter.dto;

import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.shelter.Shelter;
import io.swagger.v3.oas.annotations.media.Schema;

public record ShelterSummary(
        @Schema(description = "보호소 ID", example = "1")
        Long shelterId,

        @Schema(description = "보호소 이름", example = "사랑 동물 보호소")
        String name,

        @Schema(description = "보호소 주소")
        Address address,

        @Schema(description = "운영 시간", example = "평일 09:00-18:00, 주말 10:00-17:00")
        String openingHours,

        @Schema(description = "봉사 안내 정보", example = "봉사는 사전 예약이 필요합니다.")
        String volunteerInfo
) {
    public static ShelterSummary from(Shelter shelter) {
        return new ShelterSummary(
                shelter.getId(),
                shelter.getName(),
                shelter.getAddress(),
                shelter.getOpeningHours(),
                shelter.getVolunteerInfo()
        );
    }
}