package com.example.munglogbackend.domain.shelter.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ShelterErrorType implements ErrorType {
    SHELTER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 보호소입니다."),
    SHELTER_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 보호소가 등록되어 있습니다."),
    UNAUTHORIZED_SHELTER_ACCESS(HttpStatus.FORBIDDEN, "보호소에 접근할 권한이 없습니다."),
    SHELTER_NOT_ENROLLED(HttpStatus.NOT_FOUND, "현재 등록한 보호소가 없습니다."),

    INVALID_SHELTER_NAME(HttpStatus.BAD_REQUEST, "유효하지 않은 보호소 이름입니다."),
    INVALID_PHONE_NUMBER(HttpStatus.BAD_REQUEST, "유효하지 않은 전화번호 형식입니다."),
    INVALID_EMAIL(HttpStatus.BAD_REQUEST, "유효하지 않은 이메일 형식입니다."),
    INVALID_URL(HttpStatus.BAD_REQUEST, "유효하지 않은 URL 형식입니다."),
    INVALID_IMAGE_URL(HttpStatus.BAD_REQUEST, "유효하지 않은 이미지 URL 형식입니다."),
    INVALID_ADDRESS(HttpStatus.BAD_REQUEST, "유효하지 않은 주소입니다."),
    SHELTER_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "보호소 이미지를 찾을 수 없습니다."),
    SHELTER_DOGS_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "보호소 강아지 이미지를 찾을 수 없습니다."),
    MEMBER_NOT_SHELTER_OWNER(HttpStatus.FORBIDDEN, "보호소 소유자가 아닙니다."),
    SHELTER_DELETION_NOT_ALLOWED(HttpStatus.FORBIDDEN, "보호소를 삭제할 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}