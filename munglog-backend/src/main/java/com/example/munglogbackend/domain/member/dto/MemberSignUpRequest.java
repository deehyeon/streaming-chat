package com.example.munglogbackend.domain.member.dto;

import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record MemberSignUpRequest(
        @Schema(description = "이름", example = "윤도운")
        @NotBlank(message = "이름은 필수입니다.")
        String name,

        @Schema(description = "이메일", example = "test@test.com")
        @jakarta.validation.constraints.Email(message = "올바른 이메일 형식이 아닙니다.")
        @NotBlank(message = "이메일은 필수입니다.")
        String email,

        @Schema(description = "비밀번호", example = "password123!")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+|\\-=\\[\\]{};:',.<>/?])[A-Za-z\\d!@#$%^&*()_+|\\-=\\[\\]{};:',.<>/?]{8,20}$",
                message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다."
        )
        @NotBlank(message = "비밀번호는 필수입니다.")
        String password,

        @Schema(description = "멤버 역할", example = "VOLUNTEER")
        MemberRole role,

        @Schema(description = "주소 정보")
        AddressRequest address
) {
    public MemberSignUpRequest withHashedPassword(String hashedPassword) {
        return new MemberSignUpRequest(
                this.name,
                this.email,
                hashedPassword,
                this.role,
                this.address
        );
    }
}
