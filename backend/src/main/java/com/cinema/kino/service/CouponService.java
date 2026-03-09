package com.cinema.kino.service;

import com.cinema.kino.dto.CouponDTO;
import com.cinema.kino.entity.Coupon;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.MemberCoupon;
import com.cinema.kino.entity.MemberPoint;
import com.cinema.kino.entity.enums.CouponSourceType;
import com.cinema.kino.entity.enums.MemberCouponStatus;
import com.cinema.kino.entity.enums.PointType;
import com.cinema.kino.repository.CouponRepository;
import com.cinema.kino.repository.MemberCouponRepository;
import com.cinema.kino.repository.MemberPointRepository;
import com.cinema.kino.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;
    private final MemberPointRepository memberPointRepository;

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

        LocalDateTime now = LocalDateTime.now();
        String couponKind = coupon.getCouponKind() != null ? coupon.getCouponKind().trim() : "";
        boolean isPointCoupon = "포인트".equals(couponKind);

        MemberCoupon mc = MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .isUsed(isPointCoupon)
                .usedAt(isPointCoupon ? now : null)
                .status(isPointCoupon ? MemberCouponStatus.USED : MemberCouponStatus.AVAILABLE)
                .build();

        memberCouponRepository.save(mc);

        if (isPointCoupon) {
            int pointAmount = Math.max(0, coupon.getDiscountValue());
            if (pointAmount > 0) {
                memberPointRepository.save(MemberPoint.builder()
                        .member(member)
                        .point(pointAmount)
                        .pointType(PointType.EARN)
                        .createdAt(now)
                        .build());
            }
        }

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
                .map(this::normalizeCouponStatus)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CouponDTO.MyCouponResponse> getMyCoupons(Long memberId) {
        return memberCouponRepository.findAllCouponsByMemberId(memberId)
                .stream()
                .map(CouponDTO.MyCouponResponse::from)
                .map(this::normalizeCouponStatus)
                .toList();
    }

    @Transactional
    public CouponDTO.DownloadAllResponse downloadAll(Long memberId, String rawSourceType) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        CouponSourceType sourceType = parseSourceType(rawSourceType);
        List<Coupon> templates = couponRepository.findDownloadableCoupons(sourceType, LocalDateTime.now());

        if (templates.isEmpty()) {
            return CouponDTO.DownloadAllResponse.builder()
                    .downloadedCount(0)
                    .skippedCount(0)
                    .totalRequestedCount(0)
                    .pointAppliedCount(0)
                    .build();
        }

        int skipped = 0;
        int pointAppliedCount = 0;
        List<MemberCoupon> created = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Coupon coupon : templates) {
            if (memberCouponRepository.findByMemberIdAndCouponId(memberId, coupon.getId()).isPresent()) {
                skipped++;
                continue;
            }

            if (isPointCoupon(coupon)) {
                created.add(createIssuedCoupon(member, coupon, now, true));
                int pointAmount = Math.max(0, coupon.getDiscountValue());
                if (pointAmount > 0) {
                    memberPointRepository.save(MemberPoint.builder()
                            .member(member)
                            .point(pointAmount)
                            .pointType(PointType.EARN)
                            .createdAt(now)
                            .build());
                }
                pointAppliedCount++;
                continue;
            }

            created.add(createIssuedCoupon(member, coupon, now, false));
        }

        if (!created.isEmpty()) {
            memberCouponRepository.saveAll(created);
        }

        return CouponDTO.DownloadAllResponse.builder()
                .downloadedCount(created.size())
                .skippedCount(skipped)
                .totalRequestedCount(templates.size())
                .pointAppliedCount(pointAppliedCount)
                .build();
    }

    @Transactional(readOnly = true)
    public CouponDTO.DownloadableCouponsResponse getDownloadables(Long memberId, String rawSourceType) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        CouponSourceType sourceType = parseSourceType(rawSourceType);
        LocalDateTime now = LocalDateTime.now();
        List<Coupon> templates = couponRepository.findDownloadableCoupons(sourceType, now);

        List<CouponDTO.DownloadableCouponItem> rows = templates.stream()
                .map(coupon -> {
                    boolean alreadyOwned = memberCouponRepository.findByMemberIdAndCouponId(member.getId(), coupon.getId()).isPresent();
                    return CouponDTO.DownloadableCouponItem.builder()
                            .couponId(coupon.getId())
                            .couponCode(coupon.getCode())
                            .couponName(coupon.getName())
                            .discountType(coupon.getDiscountType().name())
                            .discountValue(coupon.getDiscountValue())
                            .minPrice(coupon.getMinPrice())
                            .couponKind(coupon.getCouponKind())
                            .sourceType(coupon.getSourceType() != null ? coupon.getSourceType().name() : "KINO")
                            .validDays(coupon.getValidDays())
                            .alreadyOwned(alreadyOwned)
                            .build();
                })
                .toList();

        return CouponDTO.DownloadableCouponsResponse.builder()
                .totalCount(rows.size())
                .coupons(rows)
                .build();
    }

    @Transactional
    public CouponDTO.DownloadSelectedResponse downloadSelected(Long memberId, String rawSourceType, List<Long> couponIds) {
        if (couponIds == null || couponIds.isEmpty()) {
            throw new IllegalArgumentException("다운로드할 쿠폰을 선택해 주세요.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        CouponSourceType sourceType = parseSourceType(rawSourceType);
        LocalDateTime now = LocalDateTime.now();
        List<Coupon> templates = couponRepository.findDownloadableCoupons(sourceType, now);
        java.util.Map<Long, Coupon> templateMap = templates.stream()
                .collect(java.util.stream.Collectors.toMap(Coupon::getId, c -> c));

        int skipped = 0;
        int pointAppliedCount = 0;
        List<MemberCoupon> created = new ArrayList<>();

        for (Long couponId : couponIds) {
            Coupon coupon = templateMap.get(couponId);
            if (coupon == null) {
                skipped++;
                continue;
            }
            if (memberCouponRepository.findByMemberIdAndCouponId(memberId, couponId).isPresent()) {
                skipped++;
                continue;
            }

            if (isPointCoupon(coupon)) {
                created.add(createIssuedCoupon(member, coupon, now, true));
                int pointAmount = Math.max(0, coupon.getDiscountValue());
                if (pointAmount > 0) {
                    memberPointRepository.save(MemberPoint.builder()
                            .member(member)
                            .point(pointAmount)
                            .pointType(PointType.EARN)
                            .createdAt(now)
                            .build());
                }
                pointAppliedCount++;
                continue;
            }

            created.add(createIssuedCoupon(member, coupon, now, false));
        }

        if (!created.isEmpty()) {
            memberCouponRepository.saveAll(created);
        }

        return CouponDTO.DownloadSelectedResponse.builder()
                .downloadedCount(created.size())
                .skippedCount(skipped)
                .totalRequestedCount(couponIds.size())
                .pointAppliedCount(pointAppliedCount)
                .build();
    }

    private String normalize(String code) {
        if (code == null) return "";
        return code.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private CouponSourceType parseSourceType(String raw) {
        if (raw == null || raw.isBlank() || "ALL".equalsIgnoreCase(raw)) {
            return null;
        }
        try {
            return CouponSourceType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("sourceType은 KINO, PARTNER, ALL만 가능합니다.");
        }
    }

    private boolean isPointCoupon(Coupon coupon) {
        String kind = coupon.getCouponKind() != null ? coupon.getCouponKind().trim() : "";
        return "포인트".equals(kind);
    }

    private MemberCoupon createIssuedCoupon(Member member, Coupon coupon, LocalDateTime now, boolean usedNow) {
        return MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .issuedAt(now)
                .expiresAt(now.plusDays(coupon.getValidDays()))
                .isUsed(usedNow)
                .usedAt(usedNow ? now : null)
                .status(usedNow ? MemberCouponStatus.USED : MemberCouponStatus.AVAILABLE)
                .build();
    }

    private CouponDTO.MyCouponResponse normalizeCouponStatus(CouponDTO.MyCouponResponse src) {
        String normalizedStatus = src.getStatus();
        if (src.getExpiresAt() != null) {
            LocalDateTime expiresAt = LocalDateTime.parse(src.getExpiresAt());
            if (expiresAt.isBefore(LocalDateTime.now()) && !"USED".equals(normalizedStatus)) {
                normalizedStatus = "EXPIRED";
            }
        }

        return CouponDTO.MyCouponResponse.builder()
                .memberCouponId(src.getMemberCouponId())
                .couponCode(src.getCouponCode())
                .couponName(src.getCouponName())
                .discountType(src.getDiscountType())
                .discountValue(src.getDiscountValue())
                .minPrice(src.getMinPrice())
                .expiresAt(src.getExpiresAt())
                .issuedAt(src.getIssuedAt())
                .status(normalizedStatus)
                .couponKind(src.getCouponKind())
                .sourceType(src.getSourceType())
                .downloadable(src.getDownloadable())
                .build();
    }
}
