package com.cinema.kino.dto;

import com.cinema.kino.entity.MemberCoupon;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


public class CouponDTO {
    /**
     * 쿠폰 코드 등록 요청 DTO
     * POST /api/coupons/redeem
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class RedeemRequest {
        private String code;
        private Long memberId;
    }

    @Getter
    @Builder
    public static class RedeemResponse {
        private Long memberCouponId;
        private String couponName;
        private String discountType;
        private Integer discountValue;
        private Integer minPrice;
        private String expiresAt;
    }

    @Getter
    @Builder
    public static class MyCouponResponse {
        private Long memberCouponId;
        private String couponName;
        private String discountType;
        private Integer discountValue;
        private Integer minPrice;
        private String expiresAt;

        public static MyCouponResponse from(MemberCoupon mc) {
            return MyCouponResponse.builder()
                    .memberCouponId(mc.getId())
                    .couponName(mc.getCoupon().getName())
                    .discountType(mc.getCoupon().getDiscountType().name())
                    .discountValue(mc.getCoupon().getDiscountValue())
                    .minPrice(mc.getCoupon().getMinPrice())
                    .expiresAt(mc.getExpiresAt().toString())
                    .build();
        }
    }
}
