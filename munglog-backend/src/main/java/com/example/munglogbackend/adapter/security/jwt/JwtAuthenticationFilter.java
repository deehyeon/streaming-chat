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

    // JWT 검증을 제외할 경로
    private static final List<String> EXCLUDE_URLS = Arrays.asList(
            // Swagger UI
            "/swagger-ui.html",
            "/swagger-ui/",
            // OpenAPI JSON
            "/v1/api-docs",
            "/v1/api-docs/",
            "/v1/api-docs/swagger-config",
            // Health check endpoint
            "/actuator/health/readiness",
            "/actuator/health/liveness",
            "/oauth2/",
            "/login/oauth2/code/",
            "/login-success"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return EXCLUDE_URLS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest,
                                    HttpServletResponse httpServletResponse,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(httpServletRequest);

        try {
            if (token != null) {
                Authentication auth = tokenProvider.getAuthentication(token);
                log.info("auth name={}, authorities={}", auth.getName(), auth.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.info("Authentication set in SecurityContext.");
            }
        } catch (ExpiredJwtException e) {throw new AuthException(AuthErrorType.TOKEN_EXPIRED);
        } catch (UnsupportedJwtException | MalformedJwtException e) {throw new AuthException(AuthErrorType.INVALID_FORMAT_TOKEN);
        } catch (Exception e) {throw new AuthException(AuthErrorType.SERVER_ERROR);}

        filterChain.doFilter(httpServletRequest, httpServletResponse);
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
