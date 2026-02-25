package com.cinema.kino.repository;

import com.cinema.kino.entity.MovieLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    long countByMemberId(Long memberId);
}
