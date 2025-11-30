package com.example.munglogbackend.application.shelter.dto;

import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.AddressRequest;
import com.example.munglogbackend.domain.shelter.Shelter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ShelterRequestDto(
        @Schema(description = "보호소 이름", example = "사랑 동물 보호소")
        @NotBlank(message = "보호소 이름은 필수입니다.")
        @Size(max = 100, message = "보호소 이름은 100자 이하여야 합니다.")
        String name,

        @Schema(description = "보호소 전화번호", example = "02-1234-5678")
        @Pattern(regexp = "^0\\d{1,2}-\\d{3,4}-\\d{4}$", message = "올바른 전화번호 형식이 아닙니다.")
        String phone,

        @Schema(description = "보호소 이메일", example = "shelter@example.com")
        @jakarta.validation.constraints.Email
        String email,

        @Schema(description = "보호소 관련 URL 목록", example = "[\"https://shelter.com\", \"https://instagram.com/shelter\"]")
        @Size(max = 10, message = "URL은 최대 10개까지 등록 가능합니다.")
        List<@Pattern(regexp = "^https?://.*", message = "올바른 URL 형식이 아닙니다.") String> urls,

        @Schema(description = "보호소 상세 설명", example = "유기동물을 사랑으로 보살피는 보호소입니다.")
        @Size(max = 2000, message = "설명은 2000자 이하여야 합니다.")
        String description,

        @Schema(description = "운영 시간", example = "평일 09:00-18:00, 주말 10:00-17:00")
        @Size(max = 200, message = "운영 시간은 200자 이하여야 합니다.")
        String openingHours,

        @Schema(description = "봉사 안내 정보", example = "봉사는 사전 예약이 필요합니다.")
        @Size(max = 2000, message = "봉사 정보는 2000자 이하여야 합니다.")
        String volunteerInfo,

        @Schema(description = "보호소 주소")
        @NotNull(message = "주소는 필수입니다.")
        AddressRequest address,

        @Schema(description = "보호소 사진 URL 목록", example = "[\"https://image.com/shelter1.jpg\"]")
        @Size(max = 20, message = "보호소 사진은 최대 20개까지 등록 가능합니다.")
        List<@Pattern(regexp = "^https?://.*\\.(jpg|jpeg|png|gif|webp)$", message = "올바른 이미지 URL 형식이 아닙니다.") String> shelterImageUrls,

        @Schema(description = "보호소 강아지 사진 URL 목록", example = "[\"https://image.com/dog1.jpg\"]")
        @Size(max = 50, message = "보호소 강아지 사진은 최대 50개까지 등록 가능합니다.")
        List<@Pattern(regexp = "^https?://.*\\.(jpg|jpeg|png|gif|webp)$", message = "올바른 이미지 URL 형식이 아닙니다.") String> shelterDogsImageUrls
) {
    public Shelter toEntity(Member member) {
        Shelter shelter = Shelter.createShelter(
                member,
                name,
                phone,
                new Email(email),
                urls,
                description,
                openingHours,
                volunteerInfo,
                Address.create(address.postalCode(), address.streetAddress(), address.detailAddress())
        );

        // 보호소 이미지 추가
        if (shelterImageUrls != null) {
            shelterImageUrls.forEach(shelter::addShelterImage);
        }

        // 보호소 강아지 이미지 추가
        if (shelterDogsImageUrls != null) {
            shelterDogsImageUrls.forEach(shelter::addShelterDogsImage);
        }

        return shelter;
    }
}