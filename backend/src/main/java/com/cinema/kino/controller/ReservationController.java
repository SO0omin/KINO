package com.cinema.kino.controller;

import com.cinema.kino.dto.ReservationResponseDTO;
import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.entity.Reservation;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.service.ReservationCommandService;
import com.cinema.kino.util.AuthenticatedActor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationCommandService reservationCommandService;
    private final ReservationRepository reservationRepository;

    //예약번호 확인
    @GetMapping("/verify/{reservationNumber}")
    public ResponseEntity<?> verifyReservation(@PathVariable String reservationNumber) {

        Optional<Reservation> reservationOpt = reservationRepository.findByReservationNumber(reservationNumber);

        if (reservationOpt.isPresent()) {
            Reservation res = reservationOpt.get();

            Map<String, Object> data = new HashMap<>();
            data.put("movieId", res.getScreening().getMovie().getId());
            data.put("movieTitle", res.getScreening().getMovie().getTitle());

            return ResponseEntity.ok(data);
        }

        return ResponseEntity.status(404).body("유효하지 않은 예매 번호입니다.");
    }

    //예약생성
    @PostMapping("/hold")
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @AuthenticationPrincipal Object principal,
            @RequestBody SeatSelectRequestDTO request) {

        // 1. 예약 주체는 요청 본문이 아니라 토큰에서 얻습니다.
        AuthenticatedActor actor = AuthenticatedActor.from(principal);

        // 2. 서비스에게 일 시키기 (이 안에서 DB 락 + 예약 생성 + 웹소켓 방송이 한 방에 일어납니다!)
        ReservationResponseDTO response = reservationCommandService.createPendingReservation(request, actor);

        // 3. 생성된 예약번호(reservationId)를 프론트엔드(결제 페이지)로 던져주기
        return ResponseEntity.ok(response);
    }
}
