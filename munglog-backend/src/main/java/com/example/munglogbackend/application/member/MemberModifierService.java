package com.example.munglogbackend.application.member;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.member.provided.MemberSaver;
import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.member.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberModifierService implements MemberSaver {
    private final MemberRepository memberRepository;
    private final MemberFinder memberFinder;

    @Override
    public Long softDelete(Long memberId) {
        Member m = memberFinder.findActiveById(memberId);
        m.softDelete();
        return m.getId();
    }

    @Override
    public Long restore(Long memberId) {
        Member m = memberFinder.findDeletedById(memberId);
        m.restore();
        return m.getId();
    }

    @Override
    public Long save(Member member) {
        Member savedMember = memberRepository.save(member);
        return savedMember.getId();
    }

    @Override
    public void changePassword(Long memberId, String newHashedPassword) {
        Member m = memberFinder.findActiveById(memberId);
        m.changePassword(newHashedPassword);
    }

    @Override
    public void hardDelete(Long memberId) {
        Member m = memberFinder.findActiveById(memberId);
        memberRepository.delete(m);
    }
}