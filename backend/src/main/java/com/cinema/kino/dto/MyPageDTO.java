package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalDate;
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
    public static class MemberProfileResponse {
        private Long memberId;
        private String username;
        private String name;
        private String tel;
        private String email;
        private LocalDate birthDate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberProfileUpdateRequest {
        private Long memberId;
        private String name;
        private String tel;
        private String email;
        private LocalDate birthDate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberPasswordUpdateRequest {
        private Long memberId;
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
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

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherRegisterRequest {
        private Long memberId;
        private String voucherType; // MOVIE | STORE
        private String code;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherRegisterResponse {
        private Long voucherId;
        private String voucherType;
        private String status;
        private String code;
        private String name;
        private LocalDateTime registeredAt;
        private String message;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherItem {
        private Long voucherId;
        private String voucherType;
        private String status;
        private String code;
        private String name;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
        private LocalDateTime registeredAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembershipCardItem {
        private Long cardId;
        private String channelName;
        private String cardNumber;
        private String cardName;
        private String issuerName;
        private LocalDate issuedDate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterMembershipCardRequest {
        private Long memberId;
        private String cardNumber;
        private String cvc;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterMembershipCardResponse {
        private Long cardId;
        private String cardNumber;
        private String cardName;
        private String issuerName;
        private LocalDate issuedDate;
        private String message;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointHistoryItem {
        private Long pointId;
        private LocalDateTime createdAt;
        private String typeLabel;
        private String content;
        private String branchName;
        private Integer point;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointPasswordSmsSendRequest {
        private Long memberId;
        private String phoneNumber;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointPasswordSmsVerifyRequest {
        private Long memberId;
        private String phoneNumber;
        private String authCode;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointPasswordUpdateRequest {
        private Long memberId;
        private String verificationToken;
        private String newPassword;
        private String confirmPassword;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointPasswordSmsVerifyResponse {
        private String verificationToken;
        private String message;
    }
}
