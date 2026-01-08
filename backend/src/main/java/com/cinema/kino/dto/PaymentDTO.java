package com.cinema.kino.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

public class PaymentDTO {

    // 1. 결제 준비 요청 (프론트 -> 서버)
    @Getter
    @NoArgsConstructor
    public static class PrepareRequest {
        private Long screeningId;       // 상영 스케줄 ID
        private List<Long> seatIds;     // 선택한 좌석 ID 목록
        private Long memberId;          // 회원 ID (없으면 null)
        private Long guestId;           // 비회원 ID (없으면 null)
        private Integer totalPrice;     // 총 결제 예정 금액
    }

    // 2. 결제 승인 요청 (토스 인증 후 프론트 -> 서버)
    @Getter
    @NoArgsConstructor
    public static class ConfirmRequest {
        private String paymentKey;      // 토스 결제 키
        private String orderId;         // 주문번호 (여기서는 Reservation ID로 사용)
        private Integer amount;         // 결제 금액
    }

    // 3. 결제 준비 응답 (서버 -> 프론트)
    @Getter
    public static class PrepareResponse {
        private Long reservationId;     // 생성된 예매 ID (이걸 토스 orderId로 씀)
        private String orderName;       // 주문명 (예: '범죄도시4 외 1건')

        public PrepareResponse(Long reservationId, String orderName) {
            this.reservationId = reservationId;
            this.orderName = orderName;
        }
    }
}