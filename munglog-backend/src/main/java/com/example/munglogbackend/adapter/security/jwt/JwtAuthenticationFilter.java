package com.example.munglogbackend.adapter.security.jwt;

import com.example.munglogbackend.application.security.TokenProvider;
import com.example.munglogbackend.domain.member.exception.AuthErrorType;
import com.example.munglogbackend.domain.member.exception.AuthException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenProvider tokenProvider;

    private static final List<String> EXCLUDE_URLS = Arrays.asList(
            // Swagger UI
            "/swagger-ui.html",
            "/swagger-ui/",
            "/swagger-ui/index.html",

            // OpenAPI JSON (springdoc v3)
            "/v3/api-docs",
            "/v3/api-docs/",
            "/v3/api-docs/swagger-config",

            // Health check
            "/actuator/health/readiness",
            "/actuator/health/liveness",

            // OAuth2
            "/oauth2/",
            "/login/oauth2/code/",
            "/login-success",

            // SignUp, Login
            "/v1/auth/signup",
            "/v1/auth/login",

            // STOMP
            "/connect",
            "/connect/",
            "/ws-stomp/",
            "/ws-stomp"
    );


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return EXCLUDE_URLS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        try {
            // 1. 토큰이 없으면 그냥 다음 필터로 넘김 (비로그인 요청)
            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. 토큰이 있으면 인증 객체 생성
            Authentication auth = tokenProvider.getAuthentication(token);
            log.info("auth name={}, authorities={}", auth.getName(), auth.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.info("Authentication set in SecurityContext.");

        } catch (ExpiredJwtException e) {
            // 만료된 토큰 → 401로 보낼 수 있도록 전용 에러 타입 사용
            log.warn("Expired JWT token", e);
            throw new AuthException(AuthErrorType.TOKEN_EXPIRED);

        } catch (UnsupportedJwtException | MalformedJwtException e) {
            // 형식이 잘못된 토큰
            log.warn("Invalid JWT format", e);
            throw new AuthException(AuthErrorType.INVALID_FORMAT_TOKEN);

        } catch (Exception e) {
            // 여기서 "서버 에러입니다"를 던져서 500 만드는 게 문제였음
            log.error("Unexpected JWT error", e);
            // 보통은 이것도 "유효하지 않은 토큰" 계열로 처리하는 게 맞음
            throw new AuthException(AuthErrorType.INVALID_FORMAT_TOKEN);
            // 정말 서버 장애(예: Redis 터짐 등)를 따로 구분하고 싶다면 ErrorType을 더 쪼개는 게 좋고요.
        }

        filterChain.doFilter(request, response);
    }


    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.info("BearerToken: {}", bearerToken);

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
