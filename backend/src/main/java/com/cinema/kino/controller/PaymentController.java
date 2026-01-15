package com.cinema.kino.controller;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // React 개발 서버(localhost:3000 등)에서 접근 허용
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * [단계 1] 결제 준비 API
     * 기능: 좌석을 선점(HELD)하고, 예매 데이터(PENDING)를 미리 생성합니다.
     * URL: POST /api/payments/prepare
     */
    @PostMapping("/prepare")
    public ResponseEntity<PaymentDTO.PrepareResponse> preparePayment(@RequestBody PaymentDTO.PrepareRequest request) {
        PaymentDTO.PrepareResponse response = paymentService.preparePayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * [단계 2] 결제 승인 API
     * 기능: 토스페이먼츠 인증이 완료되면 호출됩니다. 검증 후 최종 승인(PAID) 처리합니다.
     * URL: POST /api/payments/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<Long> confirmPayment(@RequestBody PaymentDTO.ConfirmRequest request) {
        Long paymentId = paymentService.confirmPayment(request);
        return ResponseEntity.ok(paymentId);
    }
}