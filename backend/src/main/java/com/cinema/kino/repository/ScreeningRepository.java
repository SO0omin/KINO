package com.cinema.kino.repository;

import com.cinema.kino.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    // 1. 특정 영화관 + 날짜 범위에 상영 중인 영화 ID 목록 (3개 인자)
    @Query("SELECT DISTINCT s.movie.id FROM Screening s " +
            "WHERE s.screen.theater.id = :theaterId " +
            "AND s.startTime BETWEEN :start AND :end")
    List<Long> findMovieIdsByTheaterAndDate(
            @Param("theaterId") Long theaterId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 2. 상세 시간표 조회 (4개 인자)
    @Query("SELECT s FROM Screening s " +
            "WHERE s.screen.theater.id = :theaterId " +
            "AND s.movie.id = :movieId " +
            "AND s.startTime BETWEEN :start AND :end " +
            "ORDER BY s.startTime ASC")
    List<Screening> findScreeningsDetail(
            @Param("theaterId") Long theaterId,
            @Param("movieId") Long movieId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}