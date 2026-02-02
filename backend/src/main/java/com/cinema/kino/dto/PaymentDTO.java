package com.cinema.kino.dto;

import com.cinema.kino.entity.enums.PriceType;
import lombok.*;
import java.util.List;

public class PaymentDTO {

    // 1. 결제 준비 요청 (프론트 -> 서버)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PrepareRequest {
        private Long reservationId;      // 기존 예매 번호
        private Long screeningId;        // 상영 스케줄 ID
        private List<TicketRequest> tickets; // 선택한 좌석 및 요금 타입 목록
        private Long memberId;           // 회원 ID
        private Long guestId;            // 비회원 ID
        private Integer totalPrice;      // 예상 총 금액
        private Long memberCouponId;     // 선택한 쿠폰 PK
        private Integer usedPoints;      // 사용 신청한 포인트
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class TicketRequest {
        private Long seatId;
        private PriceType priceType;
    }

    // 2. 결제 준비 응답 (서버 -> 프론트)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PrepareResponse {
        private Long reservationId;
        private String orderId;
        private String orderName;
        private int calculatedPrice;  // 프론트엔드/토스 결제창 호출용
        private int originalPrice;    // 할인 전 원가
        private int discountAmount;   // 쿠폰 할인액
        private int usedPoints;       // 포인트 사용액
        private int finalAmount;      // DB 저장용 최종 금액
    }

    // 3. 결제 승인 요청 (토스 인증 후 프론트 -> 서버)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConfirmRequest {
        private String paymentKey;
        private String orderId;
        private Integer amount;
    }

    // 4. 결제 승인 응답 (서버 -> 프론트) [복구 완료]
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConfirmResponse {
        private Long paymentId;       // 최종 생성된 결제 PK
    }

    // 예매 상세 정보 조회 응답
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReservationDetailResponse {
        private Long reservationId;
        private Long screeningId;
        private Long memberId;
        private Long guestId;
        private String movieTitle;
        private String posterUrl;
        private String theaterName;
        private String screenName;
        private String startTime;
        private int totalAmount;
        private String status;
        private List<SeatDetail> seats;

        @Data @AllArgsConstructor
        public static class SeatDetail {
            private Long seatId;
            private String seatName;
        }
    }
}