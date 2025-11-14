package com.example.munglogbackend.domain.member.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import com.example.munglogbackend.domain.global.apiPayload.exception.GlobalException;

public class MemberException extends GlobalException {

    public MemberException(ErrorType errorType) {
        super(errorType);
    }
}
