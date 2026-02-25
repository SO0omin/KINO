package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class MyPageDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private Long memberId;
        private String memberName;
        private Integer availablePoints;
        private Integer availableCouponCount;
        private Integer paidReservationCount;
        private Integer reviewCount;
        private Integer likedMovieCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationItem {
        private Long reservationId;
        private String movieTitle;
        private String posterUrl;
        private String theaterName;
        private String screenName;
        private LocalDateTime startTime;
        private Integer finalAmount;
        private String reservationStatus;
        private String paymentStatus;
        private List<String> seatNames;
        private boolean cancellable;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelRequest {
        private String reason;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelResponse {
        private Long reservationId;
        private String reservationStatus;
        private String paymentStatus;
        private LocalDateTime cancelledAt;
    }
}
