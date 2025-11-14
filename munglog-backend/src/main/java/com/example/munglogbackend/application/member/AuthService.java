package com.example.munglogbackend.application.member;

import com.example.munglogbackend.application.member.dto.MemberLoginInfo;
import com.example.munglogbackend.application.member.dto.TokenResponse;
import com.example.munglogbackend.application.member.provided.Auth;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.application.security.MemoryMap;
import com.example.munglogbackend.application.security.TokenProvider;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.MemberInfo;
import com.example.munglogbackend.domain.member.dto.MemberLoginRequest;
import com.example.munglogbackend.domain.member.dto.MemberSignUpRequest;
import com.example.munglogbackend.domain.member.dto.TokenInfo;
import com.example.munglogbackend.domain.member.exception.AuthErrorType;
import com.example.munglogbackend.domain.member.exception.AuthException;
import com.example.munglogbackend.domain.member.exception.MemberErrorType;
import com.example.munglogbackend.domain.member.exception.MemberException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService implements Auth {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final MemoryMap memoryMap;

    @Override
    public MemberLoginInfo signup(MemberSignUpRequest request) {
        checkDuplicateEmail(new Email(request.email()));

        Member member = Member.create(getHashedRequest(request));
        memberRepository.save(member);

        return login(MemberLoginRequest.of(request));
    }

    @Override
    public MemberLoginInfo login(MemberLoginRequest request) {
        Member member = memberRepository.findByEmail(new Email(request.email())).orElseThrow(() -> new MemberException(MemberErrorType.INVALID_EMAIL));

        verifyPassword(request.password(), member.getHashedPassword());

        TokenInfo tokenInfo = getTokenInfo(member);
        MemberInfo memberInfo = MemberInfo.from(member);

        return MemberLoginInfo.from(tokenInfo, memberInfo);
    }

    @Override
    public void checkDuplicateEmail(Email email) {
        memberRepository.findByEmail(email).ifPresent(member -> {
            throw new MemberException(MemberErrorType.EMAIL_DUPLICATE);
        });
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
