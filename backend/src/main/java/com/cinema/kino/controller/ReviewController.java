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
        reviewService.saveReview(requestDTO.getMemberId(), requestDTO);
        return ResponseEntity.ok().build();
    }
}