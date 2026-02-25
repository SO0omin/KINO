package com.cinema.kino.repository;

import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // 1. 기본 상태 조회
    List<Movie> findAllByStatusIn(List<MovieStatus> statuses);

    // 2. [메인 히어로 섹션용] 최신 등록된 상영 예정작 3개
    List<Movie> findTop3ByStatusOrderByIdDesc(MovieStatus status);

    // 3. [메인 랭킹 섹션용] 실제 예매 건수 기준 상위 4개 (Native Query)
    @Query(value = "SELECT m.* FROM movies m " +
            "JOIN screenings s ON s.movie_id = m.id " +
            "JOIN reservations r ON r.screening_id = s.id " +
            "WHERE r.status = 'PAID' " +
            "GROUP BY m.id " +
            "ORDER BY COUNT(r.id) DESC LIMIT 4", nativeQuery = true)
    List<Movie> findTop4ByBookingCount();

    // 4. [목록 페이지] 전체 영화 (검색어 포함, 예매율 내림차순)
    @Query("SELECT m FROM Movie m WHERE m.releaseDate <= :today AND m.status = :status " +
            "AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.bookingRate DESC")
    List<Movie> findReleasedMovies(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );

    // 5. [목록 페이지] 상영 예정작 (검색어 포함, 개봉일 오름차순)
    @Query("SELECT m FROM Movie m WHERE (m.status = :status OR m.releaseDate > :today) " +
            "AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.releaseDate ASC")
    List<Movie> findUpcomingMoviesSortByDate(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );

    // 6. [목록 페이지] 상영 예정작 (검색어 포함, 가나다 오름차순)
    @Query("SELECT m FROM Movie m WHERE (m.status = :status OR m.releaseDate > :today) " +
            "AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.title ASC")
    List<Movie> findUpcomingMoviesSortByTitle(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );
}