package com.example.munglogbackend.application.shelter;

import com.example.munglogbackend.application.member.provided.MemberFinder;
import com.example.munglogbackend.application.shelter.dto.ShelterRequestDto;
import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.application.shelter.provided.ShelterFinder;
import com.example.munglogbackend.application.shelter.provided.ShelterSaver;
import com.example.munglogbackend.application.shelter.required.ShelterRepository;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.AddressRequest;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import com.example.munglogbackend.domain.member.exception.MemberErrorType;
import com.example.munglogbackend.domain.member.exception.MemberException;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.shelter.exception.ShelterErrorType;
import com.example.munglogbackend.domain.shelter.exception.ShelterException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ShelterModifyService implements ShelterSaver {
    private final MemberFinder memberFinder;
    private final ShelterRepository shelterRepository;
    private final ShelterFinder shelterFinder;

    @Override
    public Long createShelter(Long memberId, ShelterRequestDto request) {
        Member member = memberFinder.findActiveById(memberId);
        if(!member.getRole().equals(MemberRole.SHELTER_OWNER)) {
            throw new MemberException(MemberErrorType.INVALID_MEMBER_ROLE);
        }

        Shelter shelter = Shelter.createShelter(
                member,
                request.name(),
                request.phone(),
                new Email(request.email()),
                request.urls(),
                request.description(),
                request.openingHours(),
                request.volunteerInfo(),
                Address.create(request.address().postalCode(), request.address().streetAddress(), request.address().detailAddress()));

        Shelter savedShelter = shelterRepository.save(shelter);
        return savedShelter.getId();
    }

    @Override
    public ShelterResponseDto updateShelter(Long memberId, ShelterRequestDto request) {
        Member member = memberFinder.findActiveById(memberId);
        Shelter shelter = shelterRepository.findByMember_Id(memberId).orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_NOT_ENROLLED));

        if(!Objects.equals(shelter.getMember().getId(), member.getId())) {
            throw new ShelterException(ShelterErrorType.UNAUTHORIZED_SHELTER_ACCESS);
        }

        // null이 아닌 값만 업데이트
        if (request.name() != null || request.phone() != null || request.email() != null) {
            shelter.updateBasicInfo(
                    request.name() != null ? request.name() : shelter.getName(),
                    request.phone() != null ? request.phone() : shelter.getPhone(),
                    request.email() != null ? new Email(request.email()) : shelter.getEmail()
            );
        }

        if (request.urls() != null) {
            shelter.updateUrls(request.urls());
        }

        if (request.description() != null) {
            shelter.updateDescription(request.description());
        }

        if (request.openingHours() != null) {
            shelter.updateOpeningHours(request.openingHours());
        }

        if (request.volunteerInfo() != null) {
            shelter.updateVolunteerInfo(request.volunteerInfo());
        }

        // 이미지 URL 업데이트 (있을 경우)
        if (request.shelterImageUrls() != null) {
            // 기존 이미지 모두 제거 후 새로 추가
            shelter.getShelterImages().clear();
            request.shelterImageUrls().forEach(shelter::addShelterImage);
        }

        if (request.shelterDogsImageUrls() != null) {
            shelter.getShelterDogsImages().clear();
            request.shelterDogsImageUrls().forEach(shelter::addShelterDogsImage);
        }

        return ShelterResponseDto.from(shelter);
    }

    @Override
    public void deleteShelter(Long memberId, Long shelterId) {
        Member member = memberFinder.findActiveById(memberId);
        Shelter shelter = shelterRepository.findById(shelterId).orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_NOT_FOUND));
        if(!Objects.equals(shelter.getMember().getId(), member.getId())) {
            throw new ShelterException(ShelterErrorType.UNAUTHORIZED_SHELTER_ACCESS);
        }

        shelterRepository.delete(shelter);
    }

    @Override
    public void updateShelterAddress(Long memberId, Long shelterId, AddressRequest request) {
        Member member = memberFinder.findActiveById(memberId);
        Shelter shelter = shelterRepository.findById(shelterId).orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_NOT_FOUND));

        if(!Objects.equals(shelter.getMember().getId(), member.getId())) {
            throw new ShelterException(ShelterErrorType.UNAUTHORIZED_SHELTER_ACCESS);
        }

        Address address = Address.create(
                request.postalCode(),
                request.streetAddress(),
                request.detailAddress()
        );
        shelter.updateAddress(address);
    }
}