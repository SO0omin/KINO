package com.cinema.kino.controller;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // JSON이나 문자열을 바로 응답할 때 사용합니다.
public class MainController {

    @GetMapping("/") // 사용자가 접속하는 주소 (http://localhost:8080/)
    public String mainPage() {
        return "Welcome to KINO! RDS 연결에 성공한 것을 축하드립니다! 🎉";
    }
}