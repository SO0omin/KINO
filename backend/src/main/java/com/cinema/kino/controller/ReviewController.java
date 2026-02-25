package com.cinema.kino.controller;

import com.cinema.kino.dto.ReviewSaveRequestDTO;
import com.cinema.kino.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Void> saveReview(@RequestBody ReviewSaveRequestDTO requestDTO) {
        // 로그인 연동 전이므로 임시로 1번 멤버가 작성한 것으로 처리합니다.
        Long tempMemberId = 1L;
        reviewService.saveReview(tempMemberId, requestDTO);
        return ResponseEntity.ok().build();
    }
}