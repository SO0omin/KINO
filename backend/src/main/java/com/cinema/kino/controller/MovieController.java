package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieDetailResponseDTO;
import com.cinema.kino.dto.MovieResponseDTO;
import com.cinema.kino.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    /**
     * 영화 목록 조회 (전체/상영예정작 + 검색 + 정렬)
     */
    @GetMapping
    public ResponseEntity<List<MovieResponseDTO>> getMovieList(
            @RequestParam(value = "type", defaultValue = "ALL") String type,
            @RequestParam(value = "memberId", required = false) Long memberId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sort", required = false) String sort
    ) {
        List<MovieResponseDTO> movies = movieService.getMoviesByType(type, memberId, keyword, sort);
        return ResponseEntity.ok(movies);
    }

    /**
     * 영화 상세 정보 조회 (리뷰 페이징 포함)
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<MovieDetailResponseDTO> getMovieDetail(
            @PathVariable Long id,
            @RequestParam(value = "memberId", required = false) Long memberId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(movieService.getMovieDetail(id, memberId, pageable));
    }
}