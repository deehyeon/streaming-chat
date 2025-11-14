package com.example.munglogbackend.domain.member.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import com.example.munglogbackend.domain.global.apiPayload.exception.GlobalException;

public class AuthException extends GlobalException {
    public AuthException(ErrorType errorType) {
        super(errorType);
    }
}
