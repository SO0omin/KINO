package com.cinema.kino.controller;

import com.cinema.kino.dto.ReviewSaveRequestDTO;
import com.cinema.kino.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> saveReview(@RequestBody ReviewSaveRequestDTO requestDTO) {
        try {
            reviewService.saveReview(requestDTO.getMemberId(), requestDTO);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check-availability/{reservationNumber}")
    public ResponseEntity<?> checkReviewAvailability(@PathVariable String reservationNumber) {
        try {
            // 서비스에서 번호 검증 + 중복 체크를 한 번에 수행
            reviewService.validateReservationForReview(reservationNumber);
            return ResponseEntity.ok().body(Map.of("available", true));
        } catch (IllegalArgumentException e) {
            // 이미 썼거나, 없는 번호면 에러 메시지 반환
            return ResponseEntity.badRequest().body(Map.of("available", false, "error", e.getMessage()));
        }
    }
}