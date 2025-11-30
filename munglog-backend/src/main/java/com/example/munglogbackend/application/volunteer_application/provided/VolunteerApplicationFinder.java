package com.example.munglogbackend.application.volunteer_application.provided;

import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationResponseDto;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface VolunteerApplicationFinder {
    /** 내가 신청한 봉사 목록 **/
    Page<VolunteerApplicationResponseDto> findMyApplications(Long memberId, Pageable pageable);

    /** 봉사 신청 상세 조회 **/
    VolunteerApplicationResponseDto findByMemberId(Long memberId, Long volunteerApplicationId);

    /** 같은 날짜에 같은 보호소에 중복 신청 방지 **/
    boolean existsActiveApplication(Long memberId, Long shelterId, LocalDate date);

    /** 우리 보호소에 신청받은 봉사 목록 (보호소 소유자) **/
    Page<VolunteerApplicationResponseDto> findApplicationsToMyShelter(Long shelterOwnerId, Pageable pageable);

    /** 상태별 조회 (봉사자) **/
    Page<VolunteerApplicationResponseDto> findByMemberIdAndStatus(Long memberId, VolunteerApplicationStatus status, Pageable pageable);

    /** 상태별 조회 (보호소) **/
    Page<VolunteerApplicationResponseDto> findByShelterIdAndStatus(Long shelterOwnerId, VolunteerApplicationStatus status, Pageable pageable);
}