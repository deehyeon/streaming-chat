package com.example.munglogbackend.adapter.security.oauth;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.security.TokenProvider;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final MemberFinder memberFinder;
    private final TokenProvider tokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalStateException("Email not found in OAuth2 user attributes");
        }

        Member member = memberFinder.findActiveByEmail(email);

        String accessToken  = tokenProvider.createAccessToken(member.getId());
        String refreshToken = tokenProvider.createRefreshToken(member.getId());

        Cookie accessCookie = getAccessCookie(accessToken);
        Cookie refreshCookie = getRefreshCookie(refreshToken);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        getRedirectStrategy().sendRedirect(request, response, "/login-success");
    }

    private Cookie getRefreshCookie(String refreshToken) {
        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setAttribute("SameSite", "Lax");
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(Math.toIntExact(tokenProvider.getRefreshTokenExpiration()));
        return refreshCookie;
    }

    private Cookie getAccessCookie(String accessToken) {
        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setAttribute("SameSite", "Lax");
        accessCookie.setPath("/");
        accessCookie.setMaxAge(Math.toIntExact(tokenProvider.getAccessTokenExpiration()));
        return accessCookie;
    }
}