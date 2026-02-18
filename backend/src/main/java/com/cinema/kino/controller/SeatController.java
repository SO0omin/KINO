/* ========================
좌석 상태 조회용
HTTP REST API, 단방향
======================== */
package com.cinema.kino.controller;

import com.cinema.kino.dto.SeatBookingResponseDTO;
import com.cinema.kino.dto.SeatStatusResponseDTO;
import com.cinema.kino.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/screenings")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/{screeningId}/seats")
    public ResponseEntity<SeatBookingResponseDTO> getSeats(@PathVariable Long screeningId) {

        return ResponseEntity.ok(seatService.getSeatStatus(screeningId));
    }
}