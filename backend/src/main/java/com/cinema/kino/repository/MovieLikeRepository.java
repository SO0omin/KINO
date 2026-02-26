package com.cinema.kino.repository;

import com.cinema.kino.entity.MovieLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    long countByMemberId(Long memberId);

    Optional<MovieLike> findByMemberIdAndMovieId(Long memberId, Long movieId);

    boolean existsByMovieIdAndMemberId(Long movieId, Long memberId);

    void deleteByMovieIdAndMemberId(Long movieId, Long memberId);

    long countByMovieId(Long movieId);

    @Query("""
            SELECT ml
            FROM MovieLike ml
            JOIN FETCH ml.movie m
            WHERE ml.member.id = :memberId
            ORDER BY ml.id DESC
            """)
    List<MovieLike> findAllByMemberIdWithMovie(@Param("memberId") Long memberId);
}
