package com.example.munglogbackend.adapter.member;

import com.example.munglogbackend.application.member.dto.MemberLoginInfo;
import com.example.munglogbackend.application.member.dto.TokenResponse;
import com.example.munglogbackend.application.member.provided.Auth;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import com.example.munglogbackend.domain.member.dto.MemberLoginRequest;
import com.example.munglogbackend.domain.member.dto.MemberSignUpRequest;
import com.example.munglogbackend.domain.member.dto.RefreshTokenRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "AUTH", description = "회원가입/로그인 로직 API")
public class AuthController {
    private final Auth auth;

    @Operation(summary = "회원가입", description = """
    ## 회원 가입을 수행합니다.
    - 이메일, 비밀번호 등의 정보를 입력하여 회원가입합니다.
    - 회원가입 완료 시 로그인도 완료됩니다.
    """)
    @PostMapping("/signup")
    public ApiResponse<MemberLoginInfo> signUp(@RequestBody @Valid MemberSignUpRequest memberSignUpRequest) {
        MemberLoginInfo loginInfo = auth.signup(memberSignUpRequest);
        return ApiResponse.success(loginInfo);
    }

    @Operation(summary = "로그인", description = """
    ## 사용자 로그인을 수행합니다.
    - 입력 파라미터 : 이메일, 비밀번호
    - 리턴값 : accessToken, refreshToken, memberId
    """)
    @PostMapping("/login")
    public ApiResponse<MemberLoginInfo> login(@RequestBody @Valid MemberLoginRequest memberLoginRequest) {
        MemberLoginInfo loginInfo = auth.login(memberLoginRequest);
        return ApiResponse.success(loginInfo);
    }

    @GetMapping("/google")
    public String googleLogin(@RequestParam("role") String role) {

        // 요청 URL 생성
        String redirectUrl = UriComponentsBuilder
                .fromPath(OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI)
                .path("/google")
                .queryParam("role", role)
                .toUriString();

        return "redirect:" + redirectUrl;
    }

    @GetMapping("/login-success")
    @ResponseBody
    public ResponseEntity<?> loginSuccess() {
        return ResponseEntity.ok("소셜 로그인 성공! 쿠키에 access_token / refresh_token 이 저장되었습니다.");
    }

    @Operation(
            summary = "토큰 갱신",
            description = """
        ## 리프레시 토큰을 사용해 새로운 Access/Refresh 토큰을 발급합니다.
        - 입력: { "refreshToken": "기존_리프레시_토큰" }
        - 반환: accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn
        """
    )
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        TokenResponse tokenResponse = auth.refresh(request.refreshToken());
        return ApiResponse.success(tokenResponse);
    }
}
