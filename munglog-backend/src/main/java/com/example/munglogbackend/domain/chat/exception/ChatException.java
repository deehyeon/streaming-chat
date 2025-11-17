package com.example.munglogbackend.domain.chat.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import com.example.munglogbackend.domain.global.apiPayload.exception.GlobalException;

public class ChatException extends GlobalException {
    public ChatException(ErrorType errorType) {
        super(errorType);
    }
}