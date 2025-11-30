package com.example.munglogbackend.domain.volunteer_application.exception;

import com.example.munglogbackend.domain.global.apiPayload.exception.ErrorType;
import com.example.munglogbackend.domain.global.apiPayload.exception.GlobalException;

public class VolunteerApplicationException extends GlobalException {
    public VolunteerApplicationException(ErrorType errorType) {
        super(errorType);
    }
}
