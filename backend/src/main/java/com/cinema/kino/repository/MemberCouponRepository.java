package com.cinema.kino.repository;

import com.cinema.kino.entity.MemberCoupon;
import com.cinema.kino.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {

    /**
     * [에러 1 관련 인터페이스] 사용 가능 여부 정밀 검증
     * 1. 쿠폰 소유자(memberId) 일치 여부
     * 2. 미사용(isUsed = false) 상태
     * 3. 아직 선점되지 않았거나(NULL), 현재 이 예약(reservationId)에 의해 선점된 경우
     */
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.id = :id " +
            "AND mc.member.id = :memberId " +
            "AND mc.isUsed = false " +
            "AND (mc.reservation IS NULL OR mc.reservation.id = :reservationId)")
    Optional<MemberCoupon> findAvailableCoupon(@Param("id") Long id,
                                               @Param("memberId") Long memberId,
                                               @Param("reservationId") Long reservationId);

    Optional<MemberCoupon> findByReservation(Reservation reservation);
}