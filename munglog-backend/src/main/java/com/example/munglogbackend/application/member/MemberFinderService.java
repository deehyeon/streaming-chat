package com.example.munglogbackend.application.member;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.exception.MemberErrorType;
import com.example.munglogbackend.domain.member.exception.MemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberFinderService implements MemberFinder {
    private final MemberRepository memberRepository;

    @Override
    public Member findActiveById(Long memberId) {
        return memberRepository.findByIdAndIsDeletedFalse(memberId).orElseThrow(() -> new MemberException(MemberErrorType.MEMBER_NOT_FOUND));
    }

    @Override
    public Member findActiveByEmail(String email) {
        return memberRepository.findByEmailAndIsDeletedFalse(new Email(email)).orElseThrow(() -> new MemberException(MemberErrorType.MEMBER_NOT_FOUND));
    }

    @Override
    public List<Member> findAllActive() {
        return memberRepository.findAllByIsDeletedFalse();
    }

    @Override
    public Member findDeletedById(Long memberId) {
        return memberRepository.findByIdAndIsDeletedTrue(memberId).orElseThrow(() -> new MemberException(MemberErrorType.MEMBER_NOT_FOUND));
    }

    @Override
    public Member findAnyById(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(() -> new MemberException(MemberErrorType.MEMBER_NOT_FOUND));
    }
}