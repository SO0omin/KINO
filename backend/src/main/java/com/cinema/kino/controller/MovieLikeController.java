package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieLikeRequestDTO;
import com.cinema.kino.service.MovieLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieLikeController {

    private final MovieLikeService movieLikeService;

    // POST /api/movies/{movieId}/likes
    @PostMapping("/{movieId}/likes")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long movieId,
            @RequestBody MovieLikeRequestDTO request) {

        movieLikeService.toggleLike(movieId, request);
        return ResponseEntity.ok().build();
    }
}