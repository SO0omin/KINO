package com.cinema.kino.repository;

import com.cinema.kino.entity.VoucherCode;
import com.cinema.kino.entity.enums.VoucherStatus;
import com.cinema.kino.entity.enums.VoucherType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VoucherCodeRepository extends JpaRepository<VoucherCode, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT v
            FROM VoucherCode v
            WHERE v.code = :code
              AND v.voucherType = :voucherType
            """)
    Optional<VoucherCode> findByCodeAndTypeForUpdate(@Param("code") String code,
                                                     @Param("voucherType") VoucherType voucherType);

    @Query("""
            SELECT v
            FROM VoucherCode v
            WHERE v.member.id = :memberId
              AND v.voucherType = :voucherType
            ORDER BY v.registeredAt DESC, v.id DESC
            """)
    List<VoucherCode> findByMemberAndType(@Param("memberId") Long memberId,
                                          @Param("voucherType") VoucherType voucherType);

    @Query("""
            SELECT v
            FROM VoucherCode v
            WHERE v.member.id = :memberId
              AND v.voucherType = :voucherType
              AND v.status = :status
            ORDER BY v.registeredAt DESC, v.id DESC
            """)
    List<VoucherCode> findByMemberAndTypeAndStatus(@Param("memberId") Long memberId,
                                                   @Param("voucherType") VoucherType voucherType,
                                                   @Param("status") VoucherStatus status);
}
