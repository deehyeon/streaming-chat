package com.example.munglogbackend.application.member.provided;

import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.MemberRequest;

public interface Auth {
    Member signup(MemberRequest request);
    Member login(String email, String password);
    void checkDuplicateEmail(Email email);
}
