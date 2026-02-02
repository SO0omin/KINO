package com.cinema.kino.controller;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{reservationId}")
    public ResponseEntity<PaymentDTO.ReservationDetailResponse> getPaymentInfo(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getReservationDetail(reservationId));
    }

    @PostMapping("/prepare")
    public ResponseEntity<PaymentDTO.PrepareResponse> preparePayment(@RequestBody PaymentDTO.PrepareRequest request) {
        return ResponseEntity.ok(paymentService.preparePayment(request));
    }

    /**
     * [수정] 서비스가 ConfirmResponse 객체를 반환하므로 타입을 일치시킵니다.
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentDTO.ConfirmResponse> confirmPayment(@RequestBody PaymentDTO.ConfirmRequest request) {
        PaymentDTO.ConfirmResponse response = paymentService.confirmPayment(request);
        return ResponseEntity.ok(response);
    }
}