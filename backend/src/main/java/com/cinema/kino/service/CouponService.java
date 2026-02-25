package com.cinema.kino.service;

import com.cinema.kino.dto.CouponDTO;
import com.cinema.kino.entity.Coupon;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.MemberCoupon;
import com.cinema.kino.entity.enums.MemberCouponStatus;
import com.cinema.kino.repository.CouponRepository;
import com.cinema.kino.repository.MemberCouponRepository;
import com.cinema.kino.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public CouponDTO.RedeemResponse redeem(String rawCode, Long memberId) {

        String code = normalize(rawCode);

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰 코드입니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        // 중복 등록 방지(UK(member_id, coupon_id)와 동일 목적)
        memberCouponRepository.findByMemberIdAndCouponId(memberId, coupon.getId())
                .ifPresent(mc -> { throw new IllegalArgumentException("이미 등록된 쿠폰입니다."); });

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(coupon.getValidDays());

        MemberCoupon mc = MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .issuedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .isUsed(false)
                .status(MemberCouponStatus.AVAILABLE)
                .build();

        memberCouponRepository.save(mc);

        return CouponDTO.RedeemResponse.builder()
                .memberCouponId(mc.getId())
                .couponName(coupon.getName())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minPrice(coupon.getMinPrice())
                .expiresAt(expiresAt.toString())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CouponDTO.MyCouponResponse> getMyAvailableCoupons(Long memberId) {
        return memberCouponRepository.findAvailableCouponsByMemberId(memberId)
                .stream()
                .map(CouponDTO.MyCouponResponse::from)
                .toList();
    }

    private String normalize(String code) {
        if (code == null) return "";
        return code.trim().toUpperCase().replaceAll("\\s+", "");
    }
}
