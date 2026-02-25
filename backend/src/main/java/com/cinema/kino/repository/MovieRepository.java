package com.cinema.kino.repository;

import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findAllByStatusIn(List<MovieStatus> statuses);

    // 히어로 섹션용: 최신 등록된 상영 예정작 3개
    List<Movie> findTop3ByStatusOrderByIdDesc(MovieStatus status);

    // 랭킹 섹션용: 실제 예매 건수 기준 상위 4개 (JPQL)
    // 영화(m) -> 상영일정(s) -> 예약(r)을 엮어서 예약이 많은 순으로 정렬합니다.
    @Query(value = "SELECT m.* FROM movies m " +
            "JOIN screenings s ON s.movie_id = m.id " +
            "JOIN reservations r ON r.screening_id = s.id " +
            "WHERE r.status = 'PAID' " +
            "GROUP BY m.id " +
            "ORDER BY COUNT(r.id) DESC LIMIT 4", nativeQuery = true)
    List<Movie> findTop4ByBookingCount();
}