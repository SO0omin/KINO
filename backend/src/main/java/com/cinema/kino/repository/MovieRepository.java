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
    List<Movie> findAllByStatusIn(List<MovieStatus> statuses);

    // 1. 전체 영화 (현재 상영작 중심):
    // 개봉일이 오늘이거나 과거이고, 상태가 'SCREENING'인 영화들을 예매율 순으로 내림차순 정렬
    @Query("SELECT m FROM Movie m WHERE m.releaseDate <= :today AND m.status = :status ORDER BY m.bookingRate DESC")
    List<Movie> findAllReleasedMoviesOrderByBookingRate(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status
    );

    // 2. 상영 예정작:
    // 개봉일이 내일 이후이거나 상태가 'UPCOMING'인 영화들을 개봉일 빠른 순(오름차순)으로 정렬
    @Query("SELECT m FROM Movie m WHERE m.status = :status OR m.releaseDate > :today ORDER BY m.releaseDate ASC")
    List<Movie> findUpcomingMoviesOrderByReleaseDate(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status
    );
}