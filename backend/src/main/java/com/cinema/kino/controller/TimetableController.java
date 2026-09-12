package com.cinema.kino.controller;

import com.cinema.kino.dto.TimetableResponseDTO;
import com.cinema.kino.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    /**
     * 1. [극장별 탭] 상영시간표 조회
     * 요청 예시: GET /api/timetable/theater?theaterId=1&date=2026-02-27
     */
    @GetMapping("/theater")
    public ResponseEntity<List<TimetableResponseDTO.ResponseByTheater>> getTimetableByTheater(
            @RequestParam Long theaterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(timetableService.getTimetableByTheater(theaterId, date));
    }

    /**
     * 2. [영화별 탭] 상영시간표 조회
     * 요청 예시: GET /api/timetable/movie?movieId=1&date=2026-02-27
     */
    @GetMapping("/movie")
    public ResponseEntity<List<TimetableResponseDTO.ResponseByMovie>> getTimetableByMovie(
            @RequestParam Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(timetableService.getTimetableByMovie(movieId, date));
    }
}