package com.example.munglogbackend.application.shelter;

import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.application.shelter.dto.ShelterSummary;
import com.example.munglogbackend.application.shelter.provided.ShelterFinder;
import com.example.munglogbackend.application.shelter.required.ShelterRepository;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.shelter.exception.ShelterErrorType;
import com.example.munglogbackend.domain.shelter.exception.ShelterException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ShelterFinderService implements ShelterFinder {
    private final ShelterRepository shelterRepository;

    @Override
    public Page<ShelterSummary> findAllShelters(Pageable pageable) {
        Page<Shelter> shelters = shelterRepository.findAll(pageable);
        return shelters.map(ShelterSummary::from);
    }

    @Override
    public Page<ShelterSummary> findSheltersByRegion(String region, Pageable pageable) {
        Page<Shelter> shelters = shelterRepository.findSheltersByAddressContaining(region, pageable);
        return shelters.map(ShelterSummary::from);
    }

    @Override
    public Shelter findShelterById(Long shelterId) {
        return shelterRepository.findByIdWithImages(shelterId)
                .orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_NOT_FOUND));
    }

    @Override
    public Page<ShelterResponseDto> findSheltersByName(String name, Pageable pageable) {
        Page<Shelter> shelters = shelterRepository.findByNameContaining(name, pageable);
        return shelters.map(ShelterResponseDto::from);
    }

    @Override
    public ShelterResponseDto findShelterByMember(Long memberId) {
        Shelter shelter = shelterRepository.findByMemberIdWithImages(memberId)
                .orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_NOT_FOUND));
        return ShelterResponseDto.from(shelter);
    }
}