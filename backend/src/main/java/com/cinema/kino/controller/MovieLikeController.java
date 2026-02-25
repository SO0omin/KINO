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

    /**
     * 영화 찜하기 토글 (찜하기 / 취소)
     * POST /api/movies/{movieId}/likes
     * @return Boolean - 최종적으로 찜 상태인지(true) 아닌지(false) 반환
     */
    @PostMapping("/{movieId}/likes")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long movieId,
            @RequestBody MovieLikeRequestDTO request) {

        // 프론트에서 넘겨준 memberId를 서비스에 전달합니다.
        // 서비스에서 찜 등록이면 true, 해제면 false를 반환하도록 설계하는 것이 좋습니다.
        boolean isLiked = movieLikeService.toggleLike(movieId, request);

        return ResponseEntity.ok(isLiked);
    }
}