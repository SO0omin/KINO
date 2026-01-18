package com.cinema.kino.repository;

import com.cinema.kino.entity.Screening;
import com.cinema.kino.entity.enums.ScreenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    // 1. 특정 영화관 + 날짜 범위에 상영 중인 영화 ID 목록
    @Query("SELECT DISTINCT s.movie.id FROM Screening s " +
            "WHERE (:theaterIds IS NULL OR s.screen.theater.id IN :theaterIds) " +
            "AND (:specialType IS NULL OR s.screen.screenType = :specialType) " + // 스페셜관 필터
            "AND s.startTime BETWEEN :start AND :end")
    List<Long> findMovieIdsByTheaterIdsAndDate(
            @Param("theaterIds") List<Long> theaterIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("specialType") ScreenType specialType);

    // 2. 상세 시간표 조회
    @Query("SELECT s FROM Screening s " +
            "JOIN FETCH s.movie m " +
            "JOIN FETCH s.screen sc " +
            "JOIN FETCH sc.theater t " +
            "WHERE s.screen.theater.id IN :theaterIds " +
            "AND (:movieIds IS NULL OR s.movie.id IN :movieIds) " +
            "AND s.startTime BETWEEN :start AND :end " +
            "ORDER BY s.startTime ASC")
    List<Screening> findScreeningsMultiDetail(
            @Param("theaterIds") List<Long> theaterIds,
            @Param("movieIds") List<Long> movieIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 3. 특정 영화들 + 날짜 범위에 상영 중인 상영관 ID 목록 조회
    @Query("SELECT DISTINCT s.screen.theater.id FROM Screening s " +
            "WHERE s.movie.id IN :movieIds " +
            "AND s.startTime BETWEEN :start AND :end")
    List<Long> findTheaterIdsByMovieIdsAndDate(
            @Param("movieIds") List<Long> movieIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT DISTINCT s.movie.id FROM Screening s " +
            "WHERE (:theaterIds IS NULL OR s.screen.theater.id IN :theaterIds) " +
            "AND s.startTime BETWEEN :start AND :end " +
            "AND s.screen.screenType != com.cinema.kino.entity.enums.ScreenType._2D") // 2D 제외 조건
    List<Long> findAllMovieIdsBySpecialTab(
            @Param("theaterIds") List<Long> theaterIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}