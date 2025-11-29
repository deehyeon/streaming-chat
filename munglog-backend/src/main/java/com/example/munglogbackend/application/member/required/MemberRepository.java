package com.example.munglogbackend.application.member.required;

import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByIdAndIsDeletedFalse(Long memberId);
    Optional<Member> findByIdAndIsDeletedTrue(Long memberId);

    Optional<Member> findByEmailAndIsDeletedFalse(Email email);
    Optional<Member> findByEmailAndIsDeletedTrue(Email email); // 필요하면

    boolean existsByEmailAndIsDeletedFalse(Email email);

    List<Member> findAllByIsDeletedFalse();
}
