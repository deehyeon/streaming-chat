package com.example.munglogbackend.domain.shelter.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import com.example.munglogbackend.domain.global.apiPayload.exception.GlobalException;

public class ShelterException extends GlobalException {
    public ShelterException(ErrorType errorType) {
        super(errorType);
    }
}