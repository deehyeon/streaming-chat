package com.example.munglogbackend.adapter.shelter;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.shelter.dto.ShelterRequestDto;
import com.example.munglogbackend.application.shelter.dto.ShelterResponseDto;
import com.example.munglogbackend.application.shelter.dto.ShelterSummary;
import com.example.munglogbackend.application.shelter.provided.ShelterFinder;
import com.example.munglogbackend.application.shelter.provided.ShelterSaver;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import com.example.munglogbackend.domain.member.dto.AddressRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/shelters")
@RequiredArgsConstructor
@Validated
@Tag(name = "SHELTER", description = "보호소 API")
public class ShelterController {
    private final ShelterSaver shelterSaver;
    private final ShelterFinder shelterFinder;

    // 보호소 목록 조회 (페이징, 지역 필터링)
    @Operation(summary = "보호소 목록 조회", description = """
    ## 보호소 목록을 조회합니다.
    - 전체 보호소 목록을 페이징하여 조회합니다.
    - region 파라미터를 통해 특정 지역의 보호소만 필터링할 수 있습니다.
    - 예시: region=서울, region=강남구, region=역삼동
    """)
    @GetMapping
    public ApiResponse<Page<ShelterSummary>> getShelters(
            @RequestParam(required = false) String region,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (region != null) {
            return ApiResponse.success(shelterFinder.findSheltersByRegion(region, pageable));
        }
        return ApiResponse.success(shelterFinder.findAllShelters(pageable));
    }

    // 보호소 상세 조회
    @Operation(summary = "보호소 상세 조회", description = """
    ## 보호소 상세 정보를 조회합니다.
    - 보호소 ID를 통해 상세 정보를 조회합니다.
    - 보호소 사진, 강아지 사진 URL 목록도 함께 조회됩니다.
    """)
    @GetMapping("/{shelterId}")
    public ApiResponse<ShelterResponseDto> getShelter(@PathVariable Long shelterId) {
        return ApiResponse.success(shelterFinder.findShelterById(shelterId));
    }

    @Operation(summary = "보호소 이름으로 목록 조회", description = """
    ## 보호소 이름으로 목록을 조회합니다.
    - 보호소 이름을 포함하는 모든 보호소를 페이징하여 조회합니다.
    - 부분 일치 검색을 지원합니다. (예: '사랑' 검색 시 '사랑동물보호소', '사랑의집' 모두 조회)
    - 보호소 사진, 강아지 사진 URL 목록도 함께 조회됩니다.
    """)
    @GetMapping("/search")
    public ApiResponse<Page<ShelterResponseDto>> getSheltersByName(
            @RequestParam String name,
            @ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ApiResponse.success(shelterFinder.findSheltersByName(name, pageable));
    }

    // 보호소 등록
    @Operation(summary = "보호소 등록", description = """
    ## 보호소를 등록합니다.
    - 사용자는 하나의 보호소만 등록할 수 있습니다.
    - 이미 보호소가 등록되어 있는 경우 에러가 발생합니다.
    """)
    @PostMapping
    public ApiResponse<Long> createShelter(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestBody @Valid ShelterRequestDto request
    ) {
        return ApiResponse.success(shelterSaver.createShelter(authDetails.getMemberId(), request));
    }

    // 보호소 정보 수정 (부분 수정)
    @Operation(summary = "보호소 정보 수정", description = """
    ## 보호소 정보를 수정합니다.
    - 보호소 소유자만 수정 가능합니다.
    - 수정하고자 하는 필드만 포함하여 요청할 수 있습니다 (PATCH).
    - 주소는 별도의 API로 수정해야 합니다.
    """)
    @PatchMapping("/{shelterId}")
    public ApiResponse<ShelterResponseDto> updateShelter(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long shelterId,
            @RequestBody ShelterRequestDto request
    ) {
        shelterSaver.updateShelter(authDetails.getMemberId(), request);
        return ApiResponse.success(shelterFinder.findShelterById(shelterId));
    }

    // 보호소 주소 등록/수정
    @Operation(summary = "보호소 주소 등록/수정", description = """
    ## 보호소 주소를 등록하거나 수정합니다.
    - 보호소 소유자만 수정 가능합니다.
    - 기존 주소를 덮어씁니다.
    """)
    @PutMapping("/{shelterId}/address")
    public ApiResponse<?> updateShelterAddress(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long shelterId,
            @RequestBody @Valid AddressRequest request
    ) {
        shelterSaver.updateShelterAddress(authDetails.getMemberId(), shelterId, request);
        return ApiResponse.success();
    }

    // 보호소 삭제
    @Operation(summary = "보호소 삭제", description = """
    ## 보호소를 삭제합니다.
    - 보호소 소유자만 삭제 가능합니다.
    - 보호소와 관련된 모든 이미지도 함께 삭제됩니다.
    """)
    @DeleteMapping("/{shelterId}")
    public ApiResponse<?> deleteShelter(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long shelterId
    ) {
        shelterSaver.deleteShelter(authDetails.getMemberId(), shelterId);
        return ApiResponse.success();
    }

    // 내 보호소 조회
    @Operation(summary = "내 보호소 조회", description = """
    ## 로그인한 사용자의 보호소를 조회합니다.
    - 사용자가 등록한 보호소 정보를 조회합니다.
    - 보호소가 없는 경우 에러가 발생합니다.
    """)
    @GetMapping("/me")
    public ApiResponse<ShelterResponseDto> getMyShelter(
            @AuthenticationPrincipal AuthDetails authDetails
    ) {
        return ApiResponse.success(shelterFinder.findShelterByMember(authDetails.getMemberId()));
    }
}