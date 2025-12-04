package com.example.munglogbackend.adapter.member;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.member.provided.MemberSaver;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import com.example.munglogbackend.domain.member.Member;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/members")
@RequiredArgsConstructor
@Validated
@Tag(name = "MEMBER", description = "회원 관련 API")
public class MemberController {
    private final MemberSaver memberSaver;
    private final MemberFinder memberFinder;

    @Operation(
            summary = "내 정보 조회",
            description = """
        ## 로그인한 사용자의 회원 정보를 조회합니다.
        - Access Token 기반 인증 필요
        - 자신의 회원 정보(이메일, 이름, 가입일 등)를 확인할 수 있습니다.
    """
    )
    @GetMapping("/me")
    public ApiResponse<Member> getMyInfo(@AuthenticationPrincipal AuthDetails authDetails) {
        Member member = memberFinder.findActiveById(authDetails.getMemberId());
        return ApiResponse.success(member);
    }

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