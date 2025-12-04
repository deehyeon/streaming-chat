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

    // member, shelter, shelter.member 모두 로딩
    @EntityGraph(attributePaths = {"member", "shelter", "shelter.member"})
    Page<VolunteerApplication> findByMemberId(Long memberId, Pageable pageable);

    @EntityGraph(attributePaths = {"member", "shelter", "shelter.member"})
    Page<VolunteerApplication> findByShelterId(Long shelterId, Pageable pageable);

    @EntityGraph(attributePaths = {"member", "shelter", "shelter.member"})
    Optional<VolunteerApplication> findWithDetailsById(Long id);

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

    @EntityGraph(attributePaths = {"member", "shelter", "shelter.member"})
    Page<VolunteerApplication> findByShelterIdAndStatus(
            Long shelterId,
            VolunteerApplicationStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"member", "shelter", "shelter.member"})
    Page<VolunteerApplication> findByMemberIdAndStatus(
            Long memberId,
            VolunteerApplicationStatus status,
            Pageable pageable
    );

    /**
     * 상태별 봉사 신청 수 조회
     */
    long countByStatus(VolunteerApplicationStatus status);
}
