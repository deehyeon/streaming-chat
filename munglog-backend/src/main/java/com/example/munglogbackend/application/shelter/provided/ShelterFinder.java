package com.example.munglogbackend.application.shelter.provided;

import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.application.shelter.dto.ShelterSummary;
import com.example.munglogbackend.domain.shelter.Shelter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ShelterFinder {
    Page<ShelterSummary> findAllShelters(Pageable pageable);
    Page<ShelterSummary> findSheltersByRegion(String region, Pageable pageable);

    ShelterResponseDto findShelterById(Long shelterId);  // 반환 타입을 DTO로 변경
    Shelter findById(Long shelterId);
    Page<ShelterResponseDto> findSheltersByName(String name, Pageable pageable);
    ShelterResponseDto findShelterByMember(Long memberId);
}