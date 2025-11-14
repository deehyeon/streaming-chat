package com.example.munglogbackend.domain.global.vo;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * 주소 값 객체
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Address {
    @Column(nullable = false)
    private String postalCode;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String detail;

    private Address(String postalCode, String street, String detail) {
        this.postalCode = postalCode;
        this.street = street;
        this.detail = detail;
    }

    public static Address create(String postalCode, String street, String detail) {
        return new Address(postalCode, street, detail);
    }

    public void update(String postalCode, String street, String detail) {
        this.postalCode = postalCode;
        this.street = street;
        this.detail = detail;
    }
}
