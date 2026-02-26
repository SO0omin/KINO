package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieLikeItemResponseDTO;
import com.cinema.kino.dto.MovieLikeRequestDTO;
import com.cinema.kino.service.MovieLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieLikeController {

    private final MovieLikeService movieLikeService;

    @PostMapping("/{movieId}/likes")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long movieId,
            @RequestBody MovieLikeRequestDTO request
    ) {
        return ResponseEntity.ok(movieLikeService.toggleLike(movieId, request));
    }

    @DeleteMapping("/{movieId}/likes")
    public ResponseEntity<Void> unlike(
            @PathVariable Long movieId,
            @RequestParam Long memberId
    ) {
        movieLikeService.unlike(movieId, memberId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{movieId}/likes/me")
    public ResponseEntity<Boolean> isLiked(
            @PathVariable Long movieId,
            @RequestParam Long memberId
    ) {
        return ResponseEntity.ok(movieLikeService.isLiked(movieId, memberId));
    }

    @GetMapping("/likes")
    public ResponseEntity<List<MovieLikeItemResponseDTO>> getMyLikedMovies(
            @RequestParam Long memberId
    ) {
        return ResponseEntity.ok(movieLikeService.getMyLikedMovies(memberId));
    }
}

