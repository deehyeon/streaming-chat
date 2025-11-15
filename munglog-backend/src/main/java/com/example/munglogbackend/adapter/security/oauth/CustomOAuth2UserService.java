package com.example.munglogbackend.adapter.security.oauth;

import com.example.munglogbackend.application.member.provided.Auth;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.dto.GoogleUserInfoDto;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final Auth auth;
    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        String roleParam = userRequest.getAdditionalParameters().get("role").toString();
        MemberRole role = MemberRole.valueOf(roleParam);

        if (memberRepository.findByEmail(new Email(email)).isEmpty()) {
            auth.createMemberByGoogle(new GoogleUserInfoDto(name, email), role);
        }

        return oAuth2User;
    }
}