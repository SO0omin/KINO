package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {

    // [중요] 동시성 제어를 위한 비관적 락(Pessimistic Lock)
    // "지금 내가 이 좌석 건드리는 동안 아무도 손대지 마" 라고 락을 거는 겁니다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ScreeningSeat ss WHERE ss.screening.id = :screeningId AND ss.seat.id IN :seatIds")
    List<ScreeningSeat> findAllByScreeningIdAndSeatIdsWithLock(@Param("screeningId") Long screeningId, @Param("seatIds") List<Long> seatIds);

    // 결제 완료 후, 예매 ID로 묶인 좌석들을 찾아서 상태를 RESERVED로 바꿀 때 씁니다.
    List<ScreeningSeat> findByReservationId(Long reservationId);
}