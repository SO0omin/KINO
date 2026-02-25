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
}
