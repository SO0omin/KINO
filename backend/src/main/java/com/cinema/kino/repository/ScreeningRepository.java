package com.cinema.kino.repository;

import com.cinema.kino.dto.TimetableRawDTO;
import com.cinema.kino.dto.TimetableResponseDTO;
import com.cinema.kino.entity.Screening;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.ScreenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    // 1. 특정 영화관 + 날짜 범위에 상영 중인 영화 ID 목록 (영화 필터용)
    @Query("SELECT DISTINCT s.movie.id FROM Screening s " +
            "WHERE (:theaterIds IS NULL OR s.screen.theater.id IN :theaterIds) " +
            "AND (:specialType IS NULL OR s.screen.screenType = :specialType) " +
            "AND s.startTime BETWEEN :start AND :end")
    List<Long> findMovieIdsByTheaterIdsAndDate(
            @Param("theaterIds") List<Long> theaterIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("specialType") ScreenType specialType);

    // 2. 상세 시간표 조회 (최종 스케줄 목록용)
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

    // 3. 특정 영화들 + 날짜 범위에 상영 중인 상영관 ID 목록 조회 (역필터용)
    @Query("SELECT DISTINCT s.screen.theater.id FROM Screening s " +
            "WHERE s.movie.id IN :movieIds " +
            "AND s.startTime BETWEEN :start AND :end")
    List<Long> findTheaterIdsByMovieIdsAndDate(
            @Param("movieIds") List<Long> movieIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 4. 스페셜 탭 전용 영화 목록 조회
    @Query("SELECT DISTINCT s.movie.id FROM Screening s " +
            "WHERE (:theaterIds IS NULL OR s.screen.theater.id IN :theaterIds) " +
            "AND s.startTime BETWEEN :start AND :end " +
            "AND s.screen.screenType != com.cinema.kino.entity.enums.ScreenType._2D")
    List<Long> findAllMovieIdsBySpecialTab(
            @Param("theaterIds") List<Long> theaterIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // 5. 특정 극장, 특정 날짜의 상영 일정을 조회 (영화와 상영관 정보 함께 페치)
    @Query("SELECT new com.cinema.kino.dto.TimetableRawDTO(" +
            "t.id, t.name, m.id, m.title, CAST(m.ageRating AS string), m.durationMin, " +
            "s.id, sc.name, sc.screenType, sc.totalSeats, s.startTime, s.endTime, " +
            "COALESCE(SUM(r.totalNum), 0L)) " +
            "FROM Screening s " +
            "JOIN s.movie m " +
            "JOIN s.screen sc " +
            "JOIN sc.theater t " +
            "LEFT JOIN Reservation r ON r.screening = s AND r.status = :validStatus " +
            "WHERE t.id = :theaterId " +
            "AND s.startTime >= :startOfDay AND s.startTime < :endOfDay " +
            "GROUP BY s.id, t.id, m.id, sc.id " +
            "ORDER BY m.id, s.startTime ASC")
    List<TimetableRawDTO> findByTheater(
            @Param("theaterId") Long theaterId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("validStatus") ReservationStatus validStatus
    );

    // ✨ CAST 구문 뒤에 쉼표(,) 추가!
    @Query("SELECT new com.cinema.kino.dto.TimetableRawDTO(" +
            "t.id, t.name, m.id, m.title, CAST(m.ageRating AS string), m.durationMin, " +
            "s.id, sc.name, sc.screenType, sc.totalSeats, s.startTime, s.endTime, " +
            "COALESCE(SUM(r.totalNum), 0L)) " +
            "FROM Screening s " +
            "JOIN s.movie m " +
            "JOIN s.screen sc " +
            "JOIN sc.theater t " +
            "LEFT JOIN Reservation r ON r.screening = s AND r.status = :validStatus " +
            "WHERE m.id = :movieId " +
            "AND s.startTime >= :startOfDay AND s.startTime < :endOfDay " +
            "GROUP BY s.id, t.id, m.id, sc.id " +
            "ORDER BY t.id, s.startTime ASC")
    List<TimetableRawDTO> findByMovie(
            @Param("movieId") Long movieId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("validStatus") ReservationStatus validStatus
    );
}