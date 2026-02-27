package com.cinema.kino.repository;

import com.cinema.kino.entity.MemberCoupon;
import com.cinema.kino.entity.Reservation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 회원 쿠폰(MemberCoupon) 엔티티 데이터 접근 Repository
 *
 * 핵심 목적:
 * - 결제 과정에서 "쿠폰 사용 가능 여부"를 안전하게 검증하고 조회합니다.
 * - 특히 동시성(중복 적용/다른 예약에 선점되는 문제) 방지를 위해
 *   '소유자 일치 + 미사용 + 선점 상태' 조건을 함께 확인합니다.
 */
@Repository
public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {

    /**
     * 결제 단계에서 "사용 가능한 쿠폰"인지 정밀 검증하여 조회합니다.
     *
     * 검증 조건:
     * 1) 쿠폰 PK(id) 일치
     * 2) 쿠폰 소유자(memberId) 일치 (타인 쿠폰 사용 방지)
     * 3) 미사용 상태(isUsed = false) (중복 사용 방지)
     * 4) 쿠폰 선점(reservation) 조건:
     *    - 아직 아무 예약에도 선점되지 않은 경우(reservation IS NULL) 또는
     *    - 현재 결제 중인 예약(reservationId)에 의해 이미 선점된 경우
     *
     * 의도:
     * - "다른 예약이 이미 선점한 쿠폰"은 조회되지 않게 해서,
     *   결제 진행 중 쿠폰이 중복 적용되는 문제를 줄입니다.
     *
     * @param id 쿠폰 PK
     * @param memberId 쿠폰 소유 회원 PK
     * @param reservationId 현재 결제 대상 예약 PK
     * @return 조건을 만족하는 쿠폰(Optional), 없으면 Optional.empty()
     */
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.id = :id " +
            "AND mc.member.id = :memberId " +
            "AND mc.isUsed = false " +
            "AND (mc.reservation IS NULL OR mc.reservation.id = :reservationId)")
    Optional<MemberCoupon> findAvailableCoupon(@Param("id") Long id,
                                               @Param("memberId") Long memberId,
                                               @Param("reservationId") Long reservationId);

    /**
     * 특정 예약에 선점/적용된 쿠폰을 조회합니다.
     *
     * 사용 시점 예:
     * - 결제 취소/실패 시 쿠폰 선점 해제
     * - 결제 완료 후 쿠폰 사용 처리(isUsed = true) 대상 조회
     *
     * @param reservation 쿠폰이 연결된 예약 엔티티
     * @return 해당 예약에 연결된 쿠폰(Optional)
     */
    Optional<MemberCoupon> findByReservation(Reservation reservation);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT mc FROM MemberCoupon mc
    WHERE mc.id = :id
      AND mc.member.id = :memberId
      AND mc.status = com.cinema.kino.entity.enums.MemberCouponStatus.AVAILABLE
      AND mc.isUsed = false
      AND mc.expiresAt > CURRENT_TIMESTAMP
""")
    Optional<MemberCoupon> findHoldableCouponForUpdate(@Param("id") Long id,
                                                       @Param("memberId") Long memberId);

    @Query("""
    SELECT mc FROM MemberCoupon mc
    JOIN FETCH mc.coupon c
    WHERE mc.member.id = :memberId
      AND mc.status = com.cinema.kino.entity.enums.MemberCouponStatus.AVAILABLE
      AND mc.isUsed = false
      AND mc.expiresAt > CURRENT_TIMESTAMP
    ORDER BY mc.expiresAt ASC
""")
    List<MemberCoupon> findAvailableCouponsByMemberId(@Param("memberId") Long memberId);

    @Query("""
    SELECT mc FROM MemberCoupon mc
    JOIN FETCH mc.coupon c
    WHERE mc.member.id = :memberId
    ORDER BY mc.issuedAt DESC, mc.id DESC
""")
    List<MemberCoupon> findAllCouponsByMemberId(@Param("memberId") Long memberId);

    Optional<MemberCoupon> findByMemberIdAndCouponId(Long memberId, Long couponId);


}
