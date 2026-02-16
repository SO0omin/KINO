package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {

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
     * @param seatIds 좌석 ID 목록
     * @return 락이 걸린 ScreeningSeat 목록
     */
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
    List<ScreeningSeat> findByReservationId(Long reservationId);
}
