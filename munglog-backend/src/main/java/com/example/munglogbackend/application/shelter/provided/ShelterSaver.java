package com.example.munglogbackend.application.shelter.provided;

import com.example.munglogbackend.application.shelter.dto.ShelterRequestDto;
import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.domain.member.dto.AddressRequest;

public interface ShelterSaver {
    Long createShelter(Long memberId, ShelterRequestDto request);
    ShelterResponseDto updateShelter(Long memberId, ShelterRequestDto request);
    void deleteShelter(Long memberId, Long shelterId);

    void updateShelterAddress(Long memberId, Long shelterId, AddressRequest request);
}