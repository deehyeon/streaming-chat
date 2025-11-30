package com.example.munglogbackend.application.volunteer_application;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.application.shelter.provided.ShelterFinder;
import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationResponseDto;
import com.example.munglogbackend.application.volunteer_application.provided.VolunteerApplicationFinder;
import com.example.munglogbackend.application.volunteer_application.required.VolunteerApplicationRepository;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationErrorType;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class VolunteerApplicationFinderService implements VolunteerApplicationFinder {
    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final MemberFinder memberFinder;
    private final ShelterFinder shelterFinder;

    @Override
    public Page<VolunteerApplicationResponseDto> findMyApplications(Long memberId, Pageable pageable) {
        Member member = memberFinder.findActiveById(memberId);

        Page<VolunteerApplication> volunteerApplications = volunteerApplicationRepository.findByMemberId(member.getId(), pageable);
        return volunteerApplications.map(VolunteerApplicationResponseDto::from);
    }

    @Override
    public VolunteerApplicationResponseDto findByMemberId(Long memberId, Long volunteerApplicationId) {
        Member member = memberFinder.findActiveById(memberId);

        VolunteerApplication volunteerApplication = volunteerApplicationRepository.findWithDetailsById(volunteerApplicationId)
                .orElseThrow(() -> new VolunteerApplicationException(VolunteerApplicationErrorType.APPLICATION_NOT_FOUND));

        // 조건 분리로 가독성 향상
        boolean isApplicant = volunteerApplication.getMember().getId().equals(member.getId());
        boolean isShelterOwner = volunteerApplication.getShelter().getMember().getId().equals(member.getId());

        if (!isApplicant && !isShelterOwner) {
            throw new VolunteerApplicationException(
                    VolunteerApplicationErrorType.UNAUTHORIZED_APPLICATION_ACCESS);
        }

        return VolunteerApplicationResponseDto.from(volunteerApplication);
    }

    @Override
    public boolean existsActiveApplication(Long memberId, Long shelterId, LocalDate date) {
        memberFinder.findActiveById(memberId);
        shelterFinder.findShelterById(shelterId);

        return volunteerApplicationRepository.existsActiveApplication(memberId, shelterId, date);
    }

    @Override
    public Page<VolunteerApplicationResponseDto> findApplicationsToMyShelter(Long shelterOwnerId, Pageable pageable) {
        Member shelterOwner = memberFinder.findActiveById(shelterOwnerId);
        if(!shelterOwner.getRole().equals(MemberRole.SHELTER_OWNER)) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.UNAUTHORIZED_APPLICATION_ACCESS);
        }

        ShelterResponseDto shelterByMember = shelterFinder.findShelterByMember(shelterOwner.getId());

        Page<VolunteerApplication> volunteerApplications = volunteerApplicationRepository.findByShelterId(shelterByMember.shelterId(), pageable);
        return volunteerApplications.map(VolunteerApplicationResponseDto::from);
    }

    @Override
    public Page<VolunteerApplicationResponseDto> findByMemberIdAndStatus(Long memberId, VolunteerApplicationStatus status, Pageable pageable) {
        memberFinder.findActiveById(memberId);
        Page<VolunteerApplication> volunteerApplications = volunteerApplicationRepository.findByMemberIdAndStatus(memberId, status, pageable);
        return volunteerApplications.map(VolunteerApplicationResponseDto::from);
    }

    @Override
    public Page<VolunteerApplicationResponseDto> findByShelterIdAndStatus(Long shelterOwnerId, VolunteerApplicationStatus status, Pageable pageable) {
        Member member = memberFinder.findActiveById(shelterOwnerId);
        if(!member.getRole().equals(MemberRole.SHELTER_OWNER)) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.UNAUTHORIZED_APPLICATION_ACCESS);
        }
        ShelterResponseDto shelter = shelterFinder.findShelterByMember(shelterOwnerId);

        Page<VolunteerApplication> volunteerApplications = volunteerApplicationRepository.findByShelterIdAndStatus(shelter.shelterId(), status, pageable);
        return volunteerApplications.map(VolunteerApplicationResponseDto::from);
    }
}
