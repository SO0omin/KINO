package com.cinema.kino.controller;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 결제 관련 API 컨트롤러입니다.
 *
 * 역할:
 * 1. 예약 정보 기반 결제 상세 조회
 * 2. 결제 사전 준비(금액/주문 정보 확정)
 * 3. 결제 승인 및 최종 확정 처리
 *
 * 비즈니스 로직은 PaymentService에 위임하고,
 * 컨트롤러는 요청/응답 매핑 역할만 담당합니다.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드(React 등)와의 CORS 문제 방지 (운영 시 제한 권장)
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 예약 ID 기반 결제 화면용 상세 정보 조회
     *
     * @param reservationId 예약 고유 ID
     * @return 결제 페이지에 필요한 예약 상세 정보
     *
     * 호출 흐름:
     * 프론트 → 예약 상세 조회 → 결제 페이지 렌더링
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<PaymentDTO.ReservationDetailResponse> getPaymentInfo(
            @PathVariable Long reservationId) {

        return ResponseEntity.ok(
                paymentService.getReservationDetail(reservationId)
        );
    }

    /**
     * 결제 사전 준비 단계
     *
     * 역할:
     * - 주문 정보/금액 검증
     * - 결제 요청에 필요한 데이터 생성
     *
     * @param request 결제 준비 요청 DTO
     * @return 결제 준비 결과 DTO
     */
    @PostMapping("/prepare")
    public ResponseEntity<PaymentDTO.PrepareResponse> preparePayment(
            @RequestBody PaymentDTO.PrepareRequest request) {

        return ResponseEntity.ok(
                paymentService.preparePayment(request)
        );
    }

    /**
     * 결제 승인 및 최종 확정 처리
     *
     * 역할:
     * - PG(결제사)에서 전달받은 승인 정보 검증
     * - 결제 성공 처리 (DB 저장, 예약 상태 변경 등)
     *
     * 주의:
     * PaymentService에서 ConfirmResponse를 반환하므로
     * 컨트롤러 반환 타입도 동일하게 맞춥니다.
     *
     * @param request 결제 승인 요청 DTO
     * @return 결제 확정 결과 DTO
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentDTO.ConfirmResponse> confirmPayment(
            @RequestBody PaymentDTO.ConfirmRequest request) {

        PaymentDTO.ConfirmResponse response =
                paymentService.confirmPayment(request);

        return ResponseEntity.ok(response);
    }
}
