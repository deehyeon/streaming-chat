package com.example.munglogbackend.application.member;

import com.example.munglogbackend.application.member.dto.MemberLoginInfo;
import com.example.munglogbackend.application.member.dto.TokenResponse;
import com.example.munglogbackend.application.member.provided.Auth;
import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.member.provided.MemberSaver;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.application.security.MemoryMap;
import com.example.munglogbackend.application.security.TokenProvider;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.*;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import com.example.munglogbackend.domain.member.exception.AuthErrorType;
import com.example.munglogbackend.domain.member.exception.AuthException;
import com.example.munglogbackend.domain.member.exception.MemberErrorType;
import com.example.munglogbackend.domain.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService implements Auth {
    private final MemberFinder memberFinder;
    private final MemberSaver memberSaver;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final MemoryMap memoryMap;

    @Override
    public MemberLoginInfo signup(MemberSignUpRequest request) {
        checkDuplicateEmail(request.email());

        Member member = Member.create(getHashedRequest(request));
        memberSaver.save(member);

        return login(MemberLoginRequest.of(request));
    }

    @Override
    public MemberLoginInfo login(MemberLoginRequest request) {
        Member member = memberFinder.findActiveByEmail(request.email());
        verifyPassword(request.password(), member.getHashedPassword());

        TokenInfo tokenInfo = getTokenInfo(member);
        MemberInfo memberInfo = MemberInfo.from(member);

        return MemberLoginInfo.from(tokenInfo, memberInfo);
    }

    @Override
    public void checkDuplicateEmail(String email) {
        boolean exists = memberRepository.existsByEmailAndIsDeletedFalse(new Email(email));
        if (exists) {
            throw new MemberException(MemberErrorType.EMAIL_DUPLICATE);
        }
    }

    @Override
    public TokenResponse refresh(String refreshToken) {
        Long memberId = tokenProvider.parseRefreshToken(refreshToken);

        String key = "auth:refresh:" + memberId;
        String savedToken = memoryMap.getValue(key);
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new AuthException(AuthErrorType.INVALID_REFRESH_TOKEN);
        }

        String newAccess  = tokenProvider.createAccessToken(memberId);
        String newRefresh = tokenProvider.createRefreshToken(memberId);

        long refreshTtl = tokenProvider.getRefreshTokenExpiration();
        memoryMap.setValue(key, newRefresh, refreshTtl);

        long accessTtl  = tokenProvider.getAccessTokenExpiration();

        return new TokenResponse(newAccess, newRefresh, accessTtl, refreshTtl);
    }

    @Override
    public void createMemberByGoogle(GoogleUserInfoDto googleUserInfoDto, MemberRole memberRole) {
        checkDuplicateEmail(googleUserInfoDto.email());

        // 소셜 로그인 유저라 비밀번호는 랜덤값으로 생성
        String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());

        Member member = Member.createSocialMember(
                googleUserInfoDto.name(),
                new Email(googleUserInfoDto.email()),
                randomPassword,
                memberRole
        );

        memberSaver.save(member);
    }

    private void verifyPassword(String password, String hashedPassword) {
        if (!passwordEncoder.matches(password, hashedPassword)) {
            throw new MemberException(MemberErrorType.INVALID_PASSWORD);
        }
    }

    private  TokenInfo getTokenInfo(Member member) {
        String accessToken  = tokenProvider.createAccessToken(member.getId());
        String refreshToken = tokenProvider.createRefreshToken(member.getId());
        String redisKey     = "auth:refresh:" + member.getId();
        memoryMap.setValue(redisKey, refreshToken, tokenProvider.getRefreshTokenExpiration());

        return TokenInfo.of(accessToken, refreshToken);
    }

    private MemberSignUpRequest getHashedRequest(MemberSignUpRequest request) {
        String hashedPassword = passwordEncoder.encode(request.password());

        return request.withHashedPassword(hashedPassword);
    }
}
