package com.cinema.kino.controller;

import com.cinema.kino.dto.MovieDTO;
import com.cinema.kino.dto.RegionDTO;
import com.cinema.kino.dto.ScreeningDTO;
import com.cinema.kino.dto.TheaterDTO;
import com.cinema.kino.service.TicketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ticketing")
@RequiredArgsConstructor
public class TicketingController {

    private final TicketingService ticketingService;

    @GetMapping("/regions")
    public ResponseEntity<List<RegionDTO>> getRegions() {
        return ResponseEntity.ok(ticketingService.getAllRegions());
    }

    @GetMapping("/theaters")
    public ResponseEntity<List<TheaterDTO>> getTheaters(@RequestParam(name = "regionId") Long regionId) {
        return ResponseEntity.ok(ticketingService.getTheatersByRegion(regionId));
    }

    @GetMapping("/movies")
    public ResponseEntity<List<MovieDTO>> getMovies() {
        return ResponseEntity.ok(ticketingService.getAllMovies());
    }

    // 4. 특정 날짜/영화관에서 상영 중인 영화 ID 목록 조회
    @GetMapping("/available-movies")
    public ResponseEntity<List<Long>> getAvailableMovies(
            @RequestParam(name = "theaterId") Long theaterId,
            @RequestParam(name = "date") String dateStr) {

        LocalDate date = LocalDate.parse(dateStr);
        // screeningService -> ticketingService로 변경!
        return ResponseEntity.ok(ticketingService.getAvailableMovieIds(theaterId, date));
    }

    // 5. 최종 선택된 조건에 맞는 상세 상영 시간표 조회
    @GetMapping("/screenings")
    public ResponseEntity<List<ScreeningDTO>> getScreenings(
            @RequestParam(name = "theaterId") Long theaterId,
            @RequestParam(name = "movieId") Long movieId,
            @RequestParam(name = "date") String dateStr) {

        LocalDate date = LocalDate.parse(dateStr);
        // screeningService -> ticketingService로 변경!
        return ResponseEntity.ok(ticketingService.getScreeningDetails(theaterId, movieId, date));
    }
}