package com.example.munglogbackend.application.volunteer_application.required;

import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface VolunteerApplicationRepository extends JpaRepository<VolunteerApplication, Long> {
    // 회원이 신청한 봉사 목록 (페이징)
    @EntityGraph(attributePaths = {"member", "shelter"})
    Page<VolunteerApplication> findByMemberId(Long memberId, Pageable pageable);

    // 보호소가 받은 신청 목록 (페이징)
    @EntityGraph(attributePaths = {"member", "shelter"})
    Page<VolunteerApplication> findByShelterId(Long shelterId, Pageable pageable);

    // 특정 신청 조회 (member, shelter 함께 로딩)
    @EntityGraph(attributePaths = {"member", "shelter"})
    Optional<VolunteerApplication> findWithDetailsById(Long id);

    // 회원 + 보호소 + 날짜로 중복 신청 확인
    @Query("SELECT COUNT(va) > 0 FROM VolunteerApplication va " +
            "WHERE va.member.id = :memberId " +
            "AND va.shelter.id = :shelterId " +
            "AND va.volunteerDate = :date " +
            "AND va.status != 'CANCELLED' " +
            "AND va.status != 'REJECTED'")
    boolean existsActiveApplication(
            @Param("memberId") Long memberId,
            @Param("shelterId") Long shelterId,
            @Param("date") LocalDate date
    );

    // 상태별 조회 (보호소)
    @EntityGraph(attributePaths = {"member", "shelter"})
    Page<VolunteerApplication> findByShelterIdAndStatus(
            Long shelterId,
            VolunteerApplicationStatus status,
            Pageable pageable
    );

    // 상태별 조회 (회원)
    @EntityGraph(attributePaths = {"member", "shelter"})
    Page<VolunteerApplication> findByMemberIdAndStatus(
            Long memberId,
            VolunteerApplicationStatus status,
            Pageable pageable
    );
}
