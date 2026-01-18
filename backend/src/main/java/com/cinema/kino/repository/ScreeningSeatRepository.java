package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreeningSeatRepository extends JpaRepository<ScreeningSeat, Long> {
    // 특정 상영(Screening) ID에 해당하는 모든 좌석 상태 조회 (좌석 정보와 함께 가져오기)
    @Query("SELECT ss FROM ScreeningSeat ss JOIN FETCH ss.seat WHERE ss.screening.id = :screeningId ORDER BY ss.seat.seatRow, ss.seat.seatNumber")
    List<ScreeningSeat> findAllByScreeningIdWithSeat(@Param("screeningId") Long screeningId);

    long countByScreeningIdAndStatus(Long id, SeatStatus seatStatus);
}
