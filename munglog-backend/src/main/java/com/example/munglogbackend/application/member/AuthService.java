package com.example.munglogbackend.application.member;

import com.example.munglogbackend.application.member.provided.Auth;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.MemberRequest;
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

    @Override
    public Member signup(MemberRequest request) {
        checkDuplicateEmail(request.email());

        Member member = Member.create(hashPassword(request));
        return memberRepository.save(member);
    }

    @Override
    public Member login(String email, String password) {
        return null;
    }

    @Override
    public void checkDuplicateEmail(Email email) {

    }

    private MemberRequest hashPassword(MemberRequest request) {
        String hashedPassword = passwordEncoder.encode(request.password());
        return MemberRequest.of(request.name(), request.email(), hashedPassword, request.role(), request.address());
    }
}
