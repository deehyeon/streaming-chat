package com.example.munglogbackend.adapter.volunteer_application;

import com.example.munglogbackend.adapter.security.AuthDetails;
import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationRequestDto;
import com.example.munglogbackend.application.volunteer_application.dto.VolunteerApplicationResponseDto;
import com.example.munglogbackend.application.volunteer_application.provided.VolunteerApplicationFinder;
import com.example.munglogbackend.application.volunteer_application.provided.VolunteerApplicationSaver;
import com.example.munglogbackend.domain.global.apiPayload.response.ApiResponse;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
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
@RequestMapping("/v1/volunteer-applications")
@RequiredArgsConstructor
@Validated
@Tag(name = "VOLUNTEER_APPLICATION", description = "봉사 신청 API")
public class VolunteerApplicationController {
    private final VolunteerApplicationFinder volunteerApplicationFinder;
    private final VolunteerApplicationSaver volunteerApplicationSaver;

    // 봉사 신청하기
    @Operation(summary = "봉사 신청하기", description = """
    ## 보호소에 봉사를 신청합니다.
    - 봉사 날짜, 시작 시간, 종료 시간을 입력합니다.
    - 같은 날짜에 같은 보호소에 중복 신청은 불가능합니다.
    - 과거 날짜로는 신청할 수 없습니다.
    """)
    @PostMapping
    public ApiResponse<Long> createVolunteerApplication(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestBody @Valid VolunteerApplicationRequestDto request
    ) {
        return ApiResponse.success(
                volunteerApplicationSaver.createVolunteerApplication(authDetails.getMemberId(), request)
        );
    }

    // 내가 신청한 봉사 목록 조회
    @Operation(summary = "내가 신청한 봉사 목록 조회", description = """
    ## 내가 신청한 봉사 목록을 조회합니다.
    - 모든 상태(대기중, 승인됨, 거절됨, 취소됨)의 신청 내역을 조회합니다.
    - 최신 신청 순으로 정렬됩니다.
    """)
    @GetMapping("/me")
    public ApiResponse<Page<VolunteerApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal AuthDetails authDetails,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(
                volunteerApplicationFinder.findMyApplications(authDetails.getMemberId(), pageable)
        );
    }

    // 내가 신청한 봉사 상태별 조회
    @Operation(summary = "내가 신청한 봉사 상태별 조회", description = """
    ## 내가 신청한 봉사를 상태별로 조회합니다.
    - 상태: PENDING(대기중), APPROVED(승인됨), REJECTED(거절됨), CANCELLED(취소됨)
    - 예시: status=PENDING
    """)
    @GetMapping("/me/status")
    public ApiResponse<Page<VolunteerApplicationResponseDto>> getMyApplicationsByStatus(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestParam VolunteerApplicationStatus status,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(
                volunteerApplicationFinder.findByMemberIdAndStatus(
                        authDetails.getMemberId(),
                        status,
                        pageable
                )
        );
    }

    // 봉사 신청 상세 조회
    @Operation(summary = "봉사 신청 상세 조회", description = """
    ## 봉사 신청의 상세 정보를 조회합니다.
    - 신청자 본인이거나 보호소 소유자만 조회 가능합니다.
    - 신청자 정보, 보호소 정보, 신청 상태 등을 확인할 수 있습니다.
    """)
    @GetMapping("/{applicationId}")
    public ApiResponse<VolunteerApplicationResponseDto> getApplicationDetail(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long applicationId
    ) {
        return ApiResponse.success(
                volunteerApplicationFinder.findByMemberId(
                        authDetails.getMemberId(),
                        applicationId
                )
        );
    }

    // 봉사 신청 취소
    @Operation(summary = "봉사 신청 취소", description = """
    ## 내가 신청한 봉사를 취소합니다.
    - 신청자 본인만 취소 가능합니다.
    - 거절된 신청은 취소할 수 없습니다.
    - 이미 취소된 신청은 다시 취소할 수 없습니다.
    """)
    @DeleteMapping("/{applicationId}")
    public ApiResponse<?> cancelApplication(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long applicationId
    ) {
        volunteerApplicationSaver.cancelVolunteerApplication(
                authDetails.getMemberId(),
                applicationId
        );
        return ApiResponse.success();
    }

    // 우리 보호소에 신청받은 봉사 목록 조회
    @Operation(summary = "우리 보호소에 신청받은 봉사 목록 조회", description = """
    ## 우리 보호소에 접수된 봉사 신청 목록을 조회합니다.
    - 보호소 소유자만 조회 가능합니다.
    - 모든 상태의 신청 내역을 조회합니다.
    """)
    @GetMapping("/shelter/me")
    public ApiResponse<Page<VolunteerApplicationResponseDto>> getApplicationsToMyShelter(
            @AuthenticationPrincipal AuthDetails authDetails,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(
                volunteerApplicationFinder.findApplicationsToMyShelter(
                        authDetails.getMemberId(),
                        pageable
                )
        );
    }

    // 우리 보호소 신청 상태별 조회
    @Operation(summary = "우리 보호소 신청 상태별 조회", description = """
    ## 우리 보호소에 접수된 봉사 신청을 상태별로 조회합니다.
    - 보호소 소유자만 조회 가능합니다.
    - 상태: PENDING(대기중), APPROVED(승인됨), REJECTED(거절됨), CANCELLED(취소됨)
    - 예시: status=PENDING
    """)
    @GetMapping("/shelter/me/status")
    public ApiResponse<Page<VolunteerApplicationResponseDto>> getShelterApplicationsByStatus(
            @AuthenticationPrincipal AuthDetails authDetails,
            @RequestParam VolunteerApplicationStatus status,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(
                volunteerApplicationFinder.findByShelterIdAndStatus(
                        authDetails.getMemberId(),
                        status,
                        pageable
                )
        );
    }

    // 봉사 신청 승인
    @Operation(summary = "봉사 신청 승인", description = """
    ## 접수된 봉사 신청을 승인합니다.
    - 보호소 소유자만 승인 가능합니다.
    - 대기중(PENDING) 상태의 신청만 승인할 수 있습니다.
    """)
    @PostMapping("/{applicationId}/approve")
    public ApiResponse<?> approveApplication(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long applicationId
    ) {
        volunteerApplicationSaver.approveVolunteerApplication(
                authDetails.getMemberId(),
                applicationId
        );
        return ApiResponse.success();
    }

    // 봉사 신청 거절
    @Operation(summary = "봉사 신청 거절", description = """
    ## 접수된 봉사 신청을 거절합니다.
    - 보호소 소유자만 거절 가능합니다.
    - 대기중(PENDING) 상태의 신청만 거절할 수 있습니다.
    """)
    @PostMapping("/{applicationId}/reject")
    public ApiResponse<?> rejectApplication(
            @AuthenticationPrincipal AuthDetails authDetails,
            @PathVariable Long applicationId
    ) {
        volunteerApplicationSaver.rejectVolunteerApplication(
                authDetails.getMemberId(),
                applicationId
        );
        return ApiResponse.success();
    }
}