package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScreeningSeatRepository
        extends JpaRepository<ScreeningSeat, Long> {

    // 상영관 기준 전체 좌석 조회
    List<ScreeningSeat> findByScreeningId(Long screeningId);

    // 특정 상영 + 특정 좌석 조회
    Optional<ScreeningSeat> findByScreeningIdAndSeatId(
            Long screeningId, Long seatId
    );

    // [중요] 좌석 선택 시 동시성 제어 (비관적 락)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT ss
        FROM ScreeningSeat ss
        WHERE ss.screening.id = :screeningId
          AND ss.seat.id IN :seatIds
    """)
    List<ScreeningSeat> findAllByScreeningIdAndSeatIdsWithLock(
            @Param("screeningId") Long screeningId,
            @Param("seatIds") List<Long> seatIds
    );

    // 결제 완료 후 예매 단위로 좌석 조회
    List<ScreeningSeat> findByReservationId(Long reservationId);
}