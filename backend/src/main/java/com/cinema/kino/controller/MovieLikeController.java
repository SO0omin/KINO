package com.cinema.kino.controller;

import com.cinema.kino.service.MovieLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieLikeController {
    private final MovieLikeService movieLikeService;

    @PostMapping("/{movieId}/like")
    public ResponseEntity<Boolean> toggleLike(@PathVariable Long movieId) {
        return ResponseEntity.ok(movieLikeService.toggleLike(1L, movieId)); // 1번 회원으로 가정
    }
}
