package com.example.munglogbackend.domain.global.vo;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주소 값 객체
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Address {
    @Column(nullable = true)
    private String postalCode;

    @Column(nullable = true)
    private String street;

    @Column(nullable = true)
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
