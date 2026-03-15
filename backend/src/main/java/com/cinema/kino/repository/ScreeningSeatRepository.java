package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.enums.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 상영 좌석(ScreeningSeat) 엔티티 데이터 접근 Repository
 */
@Repository
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {

    // 1. [류진] 특정 상영 ID의 모든 좌석 상태 조회 (Fetch Join으로 성능 최적화)
    @Query("SELECT ss FROM ScreeningSeat ss JOIN FETCH ss.seat WHERE ss.screening.id = :screeningId ORDER BY ss.seat.seatRow, ss.seat.seatNumber")
    List<ScreeningSeat> findAllByScreeningIdWithSeat(@Param("screeningId") Long screeningId);

    // 2. [류진] 잔여 좌석 카운트 (예매 페이지 상단 노출용)
    long countByScreeningIdAndStatus(Long id, SeatStatus seatStatus);

    // 3. [수민] 상영관 기준 전체 좌석 조회
    List<ScreeningSeat> findByScreeningId(Long screeningId);

    // 4. [수민] 특정 상영 + 특정 좌석 조회
    Optional<ScreeningSeat> findByScreeningIdAndSeatId(Long screeningId, Long seatId);

    // 💡 [추가/성능최적화] 여러 좌석을 한 번에 조회하되, Seat 정보까지 같이(Fetch Join) 가져오는 메서드
    // PaymentService 결제창 진입 시 좌석 이름(A1 등)을 찾을 때 N+1 문제를 방지합니다.
    @Query("SELECT ss FROM ScreeningSeat ss JOIN FETCH ss.seat " +
            "WHERE ss.screening.id = :screeningId AND ss.seat.id IN :seatIds")
    List<ScreeningSeat> findAllByScreeningIdAndSeatIdInWithSeat(
            @Param("screeningId") Long screeningId,
            @Param("seatIds") List<Long> seatIds
    );

    // 5. [수민] [중요] 좌석 선택 시 동시성 제어 (비관적 락)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ScreeningSeat ss " +
            "WHERE ss.screening.id = :screeningId " +
            "AND ss.seat.id IN :seatIds")
    List<ScreeningSeat> findAllByScreeningIdAndSeatIdsWithLock(
            @Param("screeningId") Long screeningId,
            @Param("seatIds") List<Long> seatIds
    );

    // 6. [수민] 결제 완료 후 예매 단위로 좌석 조회
    List<ScreeningSeat> findByReservationId(Long reservationId);

    // 7. [수민] 만료된 홀드 좌석 일괄 해제 스케줄러용
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ScreeningSeat ss 
        SET ss.status = com.cinema.kino.entity.enums.SeatStatus.AVAILABLE,
            ss.holdExpiresAt = null,
            ss.heldByMember = null,
            ss.heldByGuest = null
        WHERE ss.holdExpiresAt < :now 
          AND ss.status IN (com.cinema.kino.entity.enums.SeatStatus.HELD, com.cinema.kino.entity.enums.SeatStatus.RESERVED)
    """)
    int releaseExpiredSeatsOnly(@Param("now") LocalDateTime now);

    // 💡 추가: 만료된 좌석들에 연결된 예약 ID들만 안전하게 조회해오는 쿼리
    @Query("""
        SELECT DISTINCT ss.reservation.id 
        FROM ScreeningSeat ss 
        WHERE ss.holdExpiresAt < :now 
          AND ss.reservation IS NOT NULL
    """)
    List<Long> findReservationIdsToCancel(@Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ScreeningSeat ss 
        SET ss.status = com.cinema.kino.entity.enums.SeatStatus.AVAILABLE,
            ss.holdExpiresAt = null,
            ss.heldByMember = null,
            ss.heldByGuest = null,
            ss.reservation = null 
        WHERE ss.holdExpiresAt < :now
    """)
    int releaseExpiredSeatsAndClearReservation(@Param("now") LocalDateTime now);
}
