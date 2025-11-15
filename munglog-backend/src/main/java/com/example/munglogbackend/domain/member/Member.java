package com.example.munglogbackend.domain.member;

import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.dto.MemberSignUpRequest;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import com.example.munglogbackend.domain.member.persistence.EmailAttributeConverter;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NaturalId;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Member extends AbstractEntity {
    @Column(nullable = false, length = 30)
    private String name;

    @NaturalId
    @Convert(converter = EmailAttributeConverter.class)
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private Email email;

    @Column(name = "password", nullable = false)
    private String hashedPassword;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MemberRole role;

    @Embedded
    private Address address;

    private Member(String name, Email email, String hashedPassword, MemberRole role, Address address) {
        this.name = name;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.role = role;
        this.address = address;
    }

    public static Member create(MemberSignUpRequest memberSignUpRequest) {
        return new Member(
                memberSignUpRequest.name(),
                Email.from(memberSignUpRequest.email()),
                memberSignUpRequest.password(),
                memberSignUpRequest.role(),
                Address.create(
                        memberSignUpRequest.address().postalCode(),
                        memberSignUpRequest.address().streetAddress(),
                        memberSignUpRequest.address().detailAddress()
                )
        );
    }

    public static Member createSocialMember(String name, Email email, String password, MemberRole role) {
        return new Member(
                name,
                email,
                password,
                role,
                null
        );
    }
}