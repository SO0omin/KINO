package com.cinema.kino.controller;


import com.cinema.kino.dto.ReservationResponseDTO;
import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.service.ReservationCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations") // 💡 기본 주소 세팅
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationCommandService reservationCommandService;

    // 💡 프론트가 POST 요청으로 찌를 엔드포인트: /api/reservations/hold
    @PostMapping("/hold")
    public ResponseEntity<ReservationResponseDTO> holdSeats(@RequestBody SeatSelectRequestDTO request) {

        // 1. 서비스에게 일 시키기 (좌석 찜 + 예약 껍데기 생성)
        ReservationResponseDTO response = reservationCommandService.createPendingReservation(request);

        // 2. 생성된 예약번호(reservationId)를 프론트엔드에게 JSON으로 던져주기!
        return ResponseEntity.ok(response);
    }
}