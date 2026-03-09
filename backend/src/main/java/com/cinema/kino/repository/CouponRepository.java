package com.cinema.kino.repository;

import com.cinema.kino.entity.Coupon;
import com.cinema.kino.entity.enums.CouponSourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);

    @Query("""
            SELECT c
            FROM Coupon c
            WHERE c.downloadable = true
              AND c.isActive = true
              AND (:sourceType IS NULL OR c.sourceType = :sourceType)
              AND (c.downloadStartAt IS NULL OR c.downloadStartAt <= :now)
              AND (c.downloadEndAt IS NULL OR c.downloadEndAt >= :now)
            ORDER BY c.id DESC
            """)
    List<Coupon> findDownloadableCoupons(@Param("sourceType") CouponSourceType sourceType,
                                         @Param("now") LocalDateTime now);
}
