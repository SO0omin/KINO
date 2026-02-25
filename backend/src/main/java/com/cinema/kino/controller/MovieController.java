package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieResponseDTO;
import com.cinema.kino.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    /**
     * 영화 목록 조회 API (전체 영화 / 상영 예정작)
     * 프론트엔드 호출 예시: GET /api/movies?type=ALL 또는 GET /api/movies?type=UPCOMING
     * * @param type 탭 종류 (ALL, UPCOMING)
     * @return 영화 목록 DTO 리스트
     */
    @GetMapping
    public ResponseEntity<List<MovieResponseDTO>> getMovieList(
            @RequestParam(value = "type", defaultValue = "ALL") String type) {

        List<MovieResponseDTO> movies = movieService.getMoviesByType(type);

        return ResponseEntity.ok(movies);
    }
}
