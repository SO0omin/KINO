package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class PaymentDTO {

    // 1. 결제 준비 요청 (프론트 -> 서버)
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor // 테스트나 빌더 패턴 사용 시 필요
    @Builder
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
    @AllArgsConstructor
    @Builder
    public static class ConfirmRequest {
        private String paymentKey;      // 토스 결제 키
        private String orderId;         // 주문번호 (UUID 포함된 문자열)
        private Integer amount;         // 결제 금액
    }

    // 3. 결제 준비 응답 (서버 -> 프론트)
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor // [수정] 모든 필드를 포함한 생성자 생성 (Service의 new 호출 지원)
    @Builder
    public static class PrepareResponse {
        private Long reservationId;     // DB 예매 ID (예: 15)
        private String orderId;         // Toss용 주문번호 (예: 15-a1b2c3d4)
        private String orderName;       // 주문명 (예: 범죄도시4 외 1건)
    }
}