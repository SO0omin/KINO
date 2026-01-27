package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.enums.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {
    // 1. [류진] 특정 상영 ID의 모든 좌석 상태 조회 (Fetch Join으로 성능 최적화)
    // 좌석 정보를 한 번에 가져와서 모달 프리뷰 노출 시 N+1 문제를 방지
    @Query("SELECT ss FROM ScreeningSeat ss JOIN FETCH ss.seat WHERE ss.screening.id = :screeningId ORDER BY ss.seat.seatRow, ss.seat.seatNumber")
    List<ScreeningSeat> findAllByScreeningIdWithSeat(@Param("screeningId") Long screeningId);

    // 2. [류진] 잔여 좌석 카운트 (예매 페이지 상단 노출용)
    long countByScreeningIdAndStatus(Long id, SeatStatus seatStatus);

    // 3. [수민] 상영관 기준 전체 좌석 조회
    List<ScreeningSeat> findByScreeningId(Long screeningId);

    // 4. [수민] 특정 상영 + 특정 좌석 조회
    Optional<ScreeningSeat> findByScreeningIdAndSeatId(
            Long screeningId, Long seatId
    );

    // 5. [수민] [중요] 좌석 선택 시 동시성 제어 (비관적 락)
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

    // 6. [수민] 결제 완료 후 예매 단위로 좌석 조회
    List<ScreeningSeat> findByReservationId(Long reservationId);
}
