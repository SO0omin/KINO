package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieDetailResponseDTO;
import com.cinema.kino.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/{id}/detail")
    public ResponseEntity<MovieDetailResponseDTO> getMovieDetail(
            @PathVariable Long id,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(movieService.getMovieDetail(id, pageable));
    }
}