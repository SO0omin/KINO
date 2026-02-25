package com.cinema.kino.repository;

import com.cinema.kino.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    long countByMemberId(Long memberId);
}
