package com.cinema.kino.dto;

import com.cinema.kino.entity.Coupon;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponDTO {
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
}