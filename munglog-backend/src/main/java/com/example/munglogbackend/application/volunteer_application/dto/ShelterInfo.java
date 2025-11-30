package com.example.munglogbackend.application.volunteer_application.dto;

import com.example.munglogbackend.domain.shelter.Shelter;
import io.swagger.v3.oas.annotations.media.Schema;

public record ShelterInfo(
        @Schema(description = "보호소 ID", example = "1")
        Long shelterId,

        @Schema(description = "보호소 이름", example = "사랑 동물 보호소")
        String name,

        @Schema(description = "보호소 전화번호", example = "02-1234-5678")
        String phone
) {
    public static ShelterInfo from(Shelter shelter) {
        return new ShelterInfo(
                shelter.getId(),
                shelter.getName(),
                shelter.getPhone()
        );
    }
}