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

    // 1. 전체 영화 (검색어 포함, 예매율 내림차순)
    @Query("SELECT m FROM Movie m WHERE m.releaseDate <= :today AND m.status = :status AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.bookingRate DESC")
    List<Movie> findReleasedMovies(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );

    // 2. 상영 예정작 (개봉일순)
    // 💡 수정됨
    @Query("SELECT m FROM Movie m WHERE (m.status = :status OR m.releaseDate > :today) AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.releaseDate ASC")
    List<Movie> findUpcomingMoviesSortByDate(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );

    // 3. 상영 예정작 (가나다순)
    // 💡 수정됨
    @Query("SELECT m FROM Movie m WHERE (m.status = :status OR m.releaseDate > :today) AND m.title LIKE CONCAT('%', :keyword, '%') ORDER BY m.title ASC")
    List<Movie> findUpcomingMoviesSortByTitle(
            @Param("today") LocalDate today,
            @Param("status") MovieStatus status,
            @Param("keyword") String keyword
    );
}