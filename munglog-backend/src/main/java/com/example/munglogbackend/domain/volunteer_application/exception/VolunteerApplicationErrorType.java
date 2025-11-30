package com.example.munglogbackend.domain.volunteer_application.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum VolunteerApplicationErrorType implements ErrorType {
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 봉사 신청입니다."),
    UNAUTHORIZED_APPLICATION_ACCESS(HttpStatus.FORBIDDEN, "봉사 신청에 접근할 권한이 없습니다."),
    SHELTER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 보호소입니다."),
    INVALID_APPLICATION_DATE(HttpStatus.BAD_REQUEST, "과거 날짜로는 봉사 신청을 할 수 없습니다."),
    INVALID_TIME_RANGE(HttpStatus.BAD_REQUEST, "종료 시간은 시작 시간보다 늦어야 합니다."),
    INVALID_STATUS_TRANSITION(HttpStatus.BAD_REQUEST, "대기중 상태의 신청만 승인/거절할 수 있습니다."),
    CANNOT_CANCEL_REJECTED(HttpStatus.BAD_REQUEST, "거절된 신청은 취소할 수 없습니다."),
    ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "이미 취소된 신청입니다."),
    CANNOT_UPDATE_NON_PENDING(HttpStatus.BAD_REQUEST, "대기중 상태의 신청만 수정할 수 있습니다."),
    DUPLICATE_APPLICATION(HttpStatus.CONFLICT, "해당 날짜 및 시간에 이미 신청한 봉사가 있습니다."),
    NOT_SHELTER_OWNER(HttpStatus.FORBIDDEN, "보호소 소유자만 신청을 승인/거절할 수 있습니다.");

    private final HttpStatus status;
    private final String message;
}