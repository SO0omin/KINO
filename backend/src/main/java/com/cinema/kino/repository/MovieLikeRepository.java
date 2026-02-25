package com.cinema.kino.repository;

import com.cinema.kino.entity.MovieLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {

    // 이미 찜했는지 확인
    boolean existsByMovieIdAndMemberId(Long movieId, Long memberId);

    // 찜 취소 (언찜)
    void deleteByMovieIdAndMemberId(Long movieId, Long memberId);

    // 영화별 총 찜 개수
    long countByMovieId(Long movieId);
}