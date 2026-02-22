package com.cinema.kino.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. 비즈니스 로직 에러 (예: 이미 선택된 좌석, 금액 불일치 등)
    // 500 대신 400(Bad Request)을 보내고, 에러 메시지를 JSON으로 감싸서 줍니다.
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "BUSINESS_ERROR", "message", e.getMessage()));
    }

    // 2. 잘못된 요청 데이터 (예: 없는 좌석 ID 등)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "INVALID_INPUT", "message", e.getMessage()));
    }
}