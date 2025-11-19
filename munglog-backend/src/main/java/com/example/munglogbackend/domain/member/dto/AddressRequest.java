package com.example.munglogbackend.domain.member.dto;

import com.example.munglogbackend.domain.global.vo.Address;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        @Schema(description = "우편번호", example = "12345")
        String postalCode,

        @Schema(description = "도로명 주소", example = "경기도 수원시 행복구 행복동")
        String streetAddress,

        @Schema(description = "상세 주소", example = "행복호")
        String detailAddress
) {
    public static Address toEntity(AddressRequest request) {
        return Address.create(
                request.postalCode(),
                request.streetAddress(),
                request.detailAddress()
        );
    }
}
