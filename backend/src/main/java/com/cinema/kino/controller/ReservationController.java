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
    private final com.cinema.kino.repository.ReservationRepository reservationRepository;

    @GetMapping("/verify/{reservationNumber}")
    public ResponseEntity<?> verifyReservation(@PathVariable String reservationNumber) {
        // 1. 먼저 Optional로 예매 정보를 가져옵니다.
        java.util.Optional<com.cinema.kino.entity.Reservation> reservationOpt =
                reservationRepository.findByReservationNumber(reservationNumber);

        // 2. 데이터가 존재할 때 (성공)
        if (reservationOpt.isPresent()) {
            com.cinema.kino.entity.Reservation res = reservationOpt.get();

            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("movieId", res.getScreening().getMovie().getId());
            data.put("movieTitle", res.getScreening().getMovie().getTitle());

            return ResponseEntity.ok(data); // Map을 담아서 보냄
        }

        // 3. 데이터가 없을 때 (실패)
        // body에 String을 담아도 ResponseEntity<?> 덕분에 에러 없이 잘 나갑니다.
        return ResponseEntity.status(404).body("유효하지 않은 예매 번호입니다.");
    }

    // 💡 프론트가 POST 요청으로 찌를 엔드포인트: /api/reservations/hold
    @PostMapping("/hold")
    public ResponseEntity<ReservationResponseDTO> holdSeats(@RequestBody SeatSelectRequestDTO request) {

        // 1. 서비스에게 일 시키기 (좌석 찜 + 예약 껍데기 생성)
        ReservationResponseDTO response = reservationCommandService.createPendingReservation(request);

        // 2. 생성된 예약번호(reservationId)를 프론트엔드에게 JSON으로 던져주기!
        return ResponseEntity.ok(response);
    }
}