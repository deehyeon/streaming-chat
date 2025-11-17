package com.example.munglogbackend.adapter.member;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthViewController {

    @GetMapping("/login-success")
    public String loginSuccess() {
        return "login success";
    }
}