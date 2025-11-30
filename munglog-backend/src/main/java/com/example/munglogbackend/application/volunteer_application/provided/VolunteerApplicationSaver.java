package com.example.munglogbackend.application.volunteer_application.provided;

import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationRequestDto;

public interface VolunteerApplicationSaver {
    /** 봉사 신청하기 **/
    Long createVolunteerApplication(Long memberId, VolunteerApplicationRequestDto request);

    /** 봉사 신청 취소하기 **/
    void cancelVolunteerApplication(Long memberId, Long volunteerApplicationId);

    /** 봉사 승인하기 (보호소 소유자) **/
    void approveVolunteerApplication(Long shelterOwnerId, Long volunteerApplicationId);

    /** 봉사 거절하기 (보호소 소유자) **/
    void rejectVolunteerApplication(Long shelterOwnerId, Long volunteerApplicationId);
}
