package com.cinema.kino.controller;

import com.cinema.kino.dto.MyPageDTO;
import com.cinema.kino.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "*")
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/summary")
    public ResponseEntity<MyPageDTO.SummaryResponse> getSummary(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getSummary(memberId));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<MyPageDTO.ReservationItem>> getReservations(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getReservations(memberId));
    }

    @PostMapping("/reservations/{reservationId}/cancel")
    public ResponseEntity<MyPageDTO.CancelResponse> cancelReservation(
            @RequestParam Long memberId,
            @PathVariable Long reservationId,
            @RequestBody(required = false) MyPageDTO.CancelRequest request
    ) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(myPageService.cancelReservation(memberId, reservationId, reason));
    }
}
