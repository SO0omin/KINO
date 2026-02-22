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

/**
 * 상영 좌석(ScreeningSeat) 엔티티 데이터 접근 Repository
 *
 * 핵심 목적:
 * - 동일 상영 회차(screening)에서 좌석 중복 예약을 방지하기 위해
 *   비관적 락(PESSIMISTIC_WRITE)을 사용하는 조회 메서드를 제공합니다.
 *
 * 주의:
 * - 비관적 락은 반드시 트랜잭션(@Transactional) 범위 내에서 호출되어야 의미가 있습니다.
 * - 트래픽이 많을 경우 대기/지연이 발생할 수 있으므로 필요한 구간에서만 사용합니다.
 */
@Repository
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {
    // 1. [류진] 특정 상영 ID의 모든 좌석 상태 조회 (Fetch Join으로 성능 최적화)
    // 좌석 정보를 한 번에 가져와서 모달 프리뷰 노출 시 N+1 문제를 방지
    @Query("SELECT ss FROM ScreeningSeat ss JOIN FETCH ss.seat WHERE ss.screening.id = :screeningId ORDER BY ss.seat.seatRow, ss.seat.seatNumber")
    List<ScreeningSeat> findAllByScreeningIdWithSeat(@Param("screeningId") Long screeningId);

    // 2. [류진] 잔여 좌석 카운트 (예매 페이지 상단 노출용)
    long countByScreeningIdAndStatus(Long id, SeatStatus seatStatus);

    /**
     * 특정 상영(screeningId) + 특정 좌석 목록(seatIds)에 해당하는 ScreeningSeat를
     * 쓰기 락(PESSIMISTIC_WRITE)으로 조회합니다.
     *
     * 사용 시점 예:
     * - 좌석 선택/결제 준비/예약 확정 과정에서
     *   "동일 좌석을 동시에 여러 사용자가 잡는 상황"을 막기 위한 선점 처리
     *
     * 동작 개념:
     * - 조회된 row에 대해 다른 트랜잭션이 수정/락 획득을 못 하도록 막아
     *   좌석 상태 변경(예: HOLD/RESERVED 등)을 안전하게 수행할 수 있게 합니다.
     *
     * @param screeningId 상영 스케줄 ID

     * @return 락이 걸린 ScreeningSeat 목록
     */
    // 3. [수민] 상영관 기준 전체 좌석 조회
    List<ScreeningSeat> findByScreeningId(Long screeningId);

    // 4. [수민] 특정 상영 + 특정 좌석 조회
    Optional<ScreeningSeat> findByScreeningIdAndSeatId(
            Long screeningId, Long seatId
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

    /**
     * 특정 예약(reservationId)에 연결된 상영 좌석 목록을 조회합니다.
     *
     * 사용 시점 예:
     * - 결제 완료 후, 해당 예약에 묶인 좌석들의 상태를 RESERVED로 변경할 때
     * - 결제 취소/실패 시 좌석 상태를 원복할 때(프로젝트 정책에 따라)
     *
     * @param reservationId 예매(예약) ID
     * @return 예약에 연결된 ScreeningSeat 목록
     */
    // 6. [수민] 결제 완료 후 예매 단위로 좌석 조회
    List<ScreeningSeat> findByReservationId(Long reservationId);
}
