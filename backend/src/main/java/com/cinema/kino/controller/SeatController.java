/* ========================
좌석 상태 조회용
HTTP REST API, 단방향
======================== */
package com.cinema.kino.controller;

import com.cinema.kino.dto.SeatStatusResponseDto;
import com.cinema.kino.service.SeatService;
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
    public List<SeatStatusResponseDto> seats(
            @PathVariable Long screeningId
    ) {
        return seatService.getSeatStatus(screeningId);
    }
}