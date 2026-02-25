package com.cinema.kino.dto;

import com.cinema.kino.entity.Coupon;
import com.cinema.kino.entity.MemberCoupon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {

    // 💡 [복구됨] MainService에서 사용하는 기본 쿠폰 정보 (feat/main-page)
    private Long id;
    private String name;
    private String discountType;
    private Integer discountValue;
    private Integer minPrice;

    public static CouponDTO from(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minPrice(coupon.getMinPrice())
                .build();
    }

    // --------------------------------------------------------
    // 👇 아래는 기존에 우리가 합쳤던 내부 클래스들 (dev 브랜치 로직)
    // --------------------------------------------------------

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