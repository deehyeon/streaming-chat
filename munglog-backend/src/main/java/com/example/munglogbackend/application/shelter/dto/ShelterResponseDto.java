package com.example.munglogbackend.application.shelter.dto;

import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.shelter.ShelterDogsImage;
import com.example.munglogbackend.domain.shelter.ShelterImage;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record ShelterResponseDto(
        @Schema(description = "보호소 ID", example = "1")
        Long shelterId,

        @Schema(description = "보호소 이름", example = "사랑 동물 보호소")
        String name,

        @Schema(description = "보호소 전화번호", example = "02-1234-5678")
        String phone,

        @Schema(description = "보호소 이메일")
        Email email,

        @Schema(description = "보호소 관련 URL 목록", example = "[\"https://shelter.com\", \"https://instagram.com/shelter\"]")
        List<String> urls,

        @Schema(description = "보호소 상세 설명", example = "유기동물을 사랑으로 보살피는 보호소입니다.")
        String description,

        @Schema(description = "운영 시간", example = "평일 09:00-18:00, 주말 10:00-17:00")
        String openingHours,

        @Schema(description = "봉사 안내 정보", example = "봉사는 사전 예약이 필요합니다.")
        String volunteerInfo,

        @Schema(description = "보호소 주소")
        Address address,

        @Schema(description = "보호소 사진 URL 목록", example = "[\"https://image.com/shelter1.jpg\"]")
        List<String> shelterImageUrls,

        @Schema(description = "보호소 강아지 사진 URL 목록", example = "[\"https://image.com/dog1.jpg\"]")
        List<String> shelterDogsImageUrls
) {
    public static ShelterResponseDto from(Shelter shelter) {
        return new ShelterResponseDto(
                shelter.getId(),
                shelter.getName(),
                shelter.getPhone(),
                shelter.getEmail() != null ? shelter.getEmail() : null,
                shelter.getUrls(),
                shelter.getDescription(),
                shelter.getOpeningHours(),
                shelter.getVolunteerInfo(),
                shelter.getAddress(),
                shelter.getShelterImages().stream()
                        .map(ShelterImage::getImageUrl)
                        .toList(),
                shelter.getShelterDogsImages().stream()
                        .map(ShelterDogsImage::getImageUrl)
                        .toList()
        );
    }
}