package com.example.munglogbackend.domain.chat.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMessage;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ChatErrorType implements ErrorType {
    INVALID_MESSAGE(HttpStatus.BAD_REQUEST, "유효하지 않은 메시지입니다."),
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 채팅방입니다."),
    MEMBER_NOT_IN_CHAT_ROOM(HttpStatus.FORBIDDEN, "채팅방에 속하지 않은 사용자입니다."),
    ALREADY_IN_CHAT_ROOM(HttpStatus.CONFLICT, "이미 채팅방에 속한 사용자입니다."),
    NOT_INCLUDED_IN_CHAT_ROOM(HttpStatus.BAD_REQUEST, "채팅방에 포함되지 않은 사용자입니다."),
    SELF_CHAT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "자기 자신과는 채팅방을 만들 수 없습니다."),
    PRIVATE_CHAT_ROOM_ALREADY_EXISTS(HttpStatus.CONFLICT, "1:1 채팅방이 이미 존재합니다."),
    INVALID_GROUP_SIZE(HttpStatus.BAD_REQUEST, "그룹 채팅방에 너무 많은 사람을 초대하려고 합니다."),

    NOT_GROUP_CHAT(HttpStatus.BAD_REQUEST, "그룹 채팅방이 아닙니다.");

    private final HttpStatus status;
    private final String message;
}
