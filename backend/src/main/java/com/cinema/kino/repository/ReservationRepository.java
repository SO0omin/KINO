package com.cinema.kino.repository;

import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 1. 특정 영화의 누적 관객수 (total_num 합산)
    // Reservation -> Screening -> Movie 경로를 조인
    @Query("SELECT SUM(r.totalNum) FROM Reservation r " +
            "WHERE r.screening.movie.id = :movieId " +
            "AND r.status = :status")
    Long sumTotalNumByMovieId(@Param("movieId") Long movieId, @Param("status") ReservationStatus status);

    // 2. 전체 영화의 총 관객수 (예매율 계산을 위한 분모)
    @Query("SELECT SUM(r.totalNum) FROM Reservation r " +
            "WHERE r.status = :status")
    Long sumAllTotalNum(@Param("status") ReservationStatus status);

    // 3. 날짜별 관객수 추이를 가져오는 쿼리 (최근 7일)
    @Query(value = "SELECT DATE_FORMAT(r.created_at, '%m.%d') as date, SUM(r.total_num) as count " +
            "FROM reservations r " +
            "JOIN screenings s ON r.screening_id = s.id " +
            "WHERE s.movie_id = :movieId AND r.status = 'PAID' " +
            "GROUP BY date " +
            "ORDER BY date ASC LIMIT 7", nativeQuery = true)
    List<Map<String, Object>> findAudienceTrend(@Param("movieId") Long movieId);
}
