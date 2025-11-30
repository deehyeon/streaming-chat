package com.example.munglogbackend.application.volunteer_application;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.shelter.provided.ShelterFinder;
import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationRequestDto;
import com.example.munglogbackend.application.volunteer_application.provided.VolunteerApplicationFinder;
import com.example.munglogbackend.application.volunteer_application.provided.VolunteerApplicationSaver;
import com.example.munglogbackend.application.volunteer_application.required.VolunteerApplicationRepository;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationErrorType;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class VolunteerApplicationModifyService implements VolunteerApplicationSaver {
    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final VolunteerApplicationFinder volunteerApplicationFinder;
    private final MemberFinder memberFinder;
    private final ShelterFinder shelterFinder;

    @Override
    public Long createVolunteerApplication(Long memberId, VolunteerApplicationRequestDto request) {
        Member member = memberFinder.findActiveById(memberId);
        Shelter shelter = shelterFinder.findById(request.shelterId());

        // 중복 신청 확인 추가
        if (volunteerApplicationFinder.existsActiveApplication(
                memberId,
                shelter.getId(),
                request.volunteerDate())) {
            throw new VolunteerApplicationException(
                    VolunteerApplicationErrorType.DUPLICATE_APPLICATION);
        }

        VolunteerApplication va = VolunteerApplication.createApplication(member, shelter, request.volunteerDate(), request.startTime(), request.endTime(), request.description());
        VolunteerApplication saved = volunteerApplicationRepository.save(va);
        return saved.getId();
    }

    @Override
    public void cancelVolunteerApplication(Long memberId, Long volunteerApplicationId) {
        Member member = memberFinder.findActiveById(memberId);

        VolunteerApplication volunteerApplication = volunteerApplicationRepository.findWithDetailsById(volunteerApplicationId)
                        .orElseThrow(() -> new VolunteerApplicationException(VolunteerApplicationErrorType.APPLICATION_NOT_FOUND));

        if (!volunteerApplication.getMember().getId().equals(member.getId())) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.UNAUTHORIZED_APPLICATION_ACCESS);
        }

        volunteerApplication.cancel();
    }

    @Override
    public void approveVolunteerApplication(Long shelterOwnerId, Long volunteerApplicationId) {
        memberFinder.findActiveById(shelterOwnerId);
        VolunteerApplication volunteerApplication = volunteerApplicationRepository.findWithDetailsById(volunteerApplicationId)
                        .orElseThrow(() -> new VolunteerApplicationException(VolunteerApplicationErrorType.APPLICATION_NOT_FOUND));

        if (!volunteerApplication.getShelter().getMember().getId().equals(shelterOwnerId)) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.NOT_SHELTER_OWNER);
        }

        volunteerApplication.approve();
    }

    @Override
    public void rejectVolunteerApplication(Long shelterOwnerId, Long volunteerApplicationId) {
        memberFinder.findActiveById(shelterOwnerId);
        VolunteerApplication volunteerApplication = volunteerApplicationRepository.findWithDetailsById(volunteerApplicationId)
                        .orElseThrow(() -> new VolunteerApplicationException(VolunteerApplicationErrorType.APPLICATION_NOT_FOUND));

        if (!volunteerApplication.getShelter().getMember().getId().equals(shelterOwnerId)) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.NOT_SHELTER_OWNER);
        }

        volunteerApplication.reject();
    }
}
