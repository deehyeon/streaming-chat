package com.example.munglogbackend.adapter.member;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.member.provided.MemberSaver;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/members")
@RequiredArgsConstructor
@Validated
@Tag(name = "MEMBER", description = "회원 관련 API")
public class MemberController {
    private final MemberSaver memberSaver;

    @Operation(
            summary = "회원 탈퇴(소프트 삭제)",
            description = """
        ## 회원 소프트 삭제 API
        - 경로 파라미터로 전달된 `memberId`에 해당하는 회원을 논리 삭제합니다.
        """
    )
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{memberId}")
    public ApiResponse<?> softDelete(@PathVariable Long memberId) {
        memberSaver.softDelete(memberId);
        return ApiResponse.success();
    }

    @Operation(
            summary = "회원 탈퇴(Soft Delete)",
            description = """
        ## 로그인한 사용자가 자신의 계정을 탈퇴합니다.
        - 탈퇴 방식: Soft Delete (isDeleted = true)
        - Access Token 기반 인증 필요
        - 탈퇴 후 재로그인 불가
        - 데이터는 물리적으로 삭제되지 않습니다.
    """
    )
    @DeleteMapping("/me")
    public ApiResponse<?> withdraw(@AuthenticationPrincipal AuthDetails authDetails) {
        memberSaver.softDelete(authDetails.getMemberId());
        return ApiResponse.success();
    }
}