package com.example.munglogbackend.domain.member.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MemberErrorType implements ErrorType {
    INVALID_AUTHORIZATION_CODE(HttpStatus.UNAUTHORIZED, "유효하지 않은 인증 코드입니다."),
    EXPIRED_VERIFICATION_CODE(HttpStatus.UNAUTHORIZED,   "인증 코드가 만료되었습니다."),

    TERMS_NOT_AGREED(HttpStatus.BAD_REQUEST, "약관동의를 해야 가입이 가능합니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    INVALID_EMAIL(HttpStatus.BAD_REQUEST, "유효하지 않은 이메일입니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "올바르지 않은 입력값입니다."),
    EMAIL_DUPLICATE(HttpStatus.CONFLICT, "이미 사용중인 이메일입니다."),
    ADDRESS_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 주소입니다."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND,     "존재하지 않는 사용자입니다."),
    INVALID_PHONE_NUMBER(HttpStatus.BAD_REQUEST, "유효하지 않은 전화번호입니다."),
    INVALID_NAME(HttpStatus.BAD_REQUEST, "유효하지 않은 이름입니다."),
    INVALID_PASSWORD_UPDATE_REQUEST(HttpStatus.BAD_REQUEST, "올바르지 않은 비밀번호 수정 요청입니다."),
    INVALID_MEMBER_ROLE(HttpStatus.BAD_REQUEST, "보호소 회원만 보호소를 생성할 수 있습니다."),

    MEMBER_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "이미 삭제된 회원입니다."),
    MEMBER_NOT_DELETED(HttpStatus.BAD_REQUEST, "삭제되지 않은 회원입니다."),
    MEMBER_DELETED(HttpStatus.BAD_REQUEST, "삭제된 회원입니다.");

    private final HttpStatus status;

    private final String message;
}
