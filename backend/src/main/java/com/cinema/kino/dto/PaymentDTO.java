package com.cinema.kino.dto;

import com.cinema.kino.entity.enums.PriceType;
import lombok.*;
import java.util.List;

/**
 * 결제 관련 API에서 사용하는 요청/응답 DTO 모음 클래스
 *
 * 결제 흐름:
 * 1) PrepareRequest  → 결제 준비
 * 2) PrepareResponse → 프론트 결제창 호출
 * 3) ConfirmRequest  → 결제 승인 요청
 * 4) ConfirmResponse → 결제 최종 확정 결과
 *
 * DTO는 계층 간 데이터 전달 목적이며,
 * 비즈니스 로직은 포함하지 않습니다.
 */
public class PaymentDTO {

    /**
     * 1. 결제 준비 요청 (프론트 → 서버)
     *
     * 역할:
     * - 좌석/요금/쿠폰/포인트 정보를 서버에 전달
     * - 서버는 금액을 다시 계산하여 검증해야 함
     *
     * 주의:
     * totalPrice는 프론트 계산값이므로
     * 반드시 서버에서 재계산 후 검증해야 함 (신뢰 금지)
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PrepareRequest {

        private Long reservationId;      // 기존 예매 번호
        private Long screeningId;        // 상영 스케줄 ID
        private List<TicketRequest> tickets; // 선택한 좌석 및 요금 타입 목록

        private Long memberId;           // 회원 ID (회원 결제 시)
        private Long guestId;            // 비회원 ID (비회원 결제 시)

        private Integer totalPrice;      // 프론트 계산 예상 금액 (검증 필요)

        private Long memberCouponId;     // 적용할 쿠폰 PK
        private Integer usedPoints;      // 사용 신청한 포인트
    }

    /**
     * 좌석 + 요금 타입 정보 전달용 DTO
     *
     * priceType은 일반/청소년/경로 등 구분에 사용됨.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class TicketRequest {
        private Long seatId;
        private PriceType priceType;
    }

    /**
     * 2. 결제 준비 응답 (서버 → 프론트)
     *
     * 역할:
     * - 서버에서 최종 계산된 금액 반환
     * - PG(토스) 결제창 호출에 필요한 정보 포함
     *
     * calculatedPrice: PG 요청용 금액
     * finalAmount: DB 저장용 금액 (실제 결제 확정 금액)
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PrepareResponse {

        private Long reservationId;
        private String orderId;          // PG 결제 요청용 주문번호
        private String orderName;        // 결제창 표시용 주문명

        private int calculatedPrice;     // 프론트/PG 전달용 금액
        private int originalPrice;       // 할인 전 총 금액
        private int discountAmount;      // 쿠폰 할인 금액
        private int usedPoints;          // 실제 차감된 포인트
        private int finalAmount;         // 최종 결제 금액 (DB 저장 기준)
    }

    /**
     * 3. 결제 승인 요청 (토스 인증 완료 후 프론트 → 서버)
     *
     * 역할:
     * - PG에서 전달받은 결제 승인 정보 서버 전달
     * - 서버는 orderId, amount 검증 후 결제 확정 처리
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConfirmRequest {

        private String paymentKey;   // PG에서 발급한 결제 고유 키
        private String orderId;      // 결제 준비 단계에서 생성된 주문번호
        private Integer amount;      // 실제 결제 승인 금액 (검증 필요)
    }

    /**
     * 4. 결제 승인 응답 (서버 → 프론트)
     *
     * 결제 성공 시 생성된 Payment 엔티티 PK 반환
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConfirmResponse {

        private Long paymentId;      // 최종 생성된 결제 PK
    }

    /**
     * 예매 상세 정보 조회 응답 DTO
     *
     * 결제 페이지 진입 시 필요한 정보 제공:
     * - 영화/극장/상영관 정보
     * - 선택 좌석 정보
     * - 현재 예약 상태
     */
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
        private int totalAmount;     // 현재 예약 기준 총 금액
        private String status;       // 예약 상태 (예: READY, PAID 등)

        private List<SeatDetail> seats;

        /**
         * 선택 좌석 상세 정보
         */
        @Data
        @AllArgsConstructor
        public static class SeatDetail {
            private Long seatId;
            private String seatName;
            private PriceType priceType;
        }
    }
}
