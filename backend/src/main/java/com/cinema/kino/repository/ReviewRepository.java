package com.cinema.kino.repository;

import com.cinema.kino.entity.Review;
import com.cinema.kino.dto.MainPageResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 평점 높은 순으로 영화 제목, 평균 평점, 그리고 대표 리뷰 하나를 가져옵니다.
    // LIMIT 4 처리를 위해 Pageable을 쓸 수도 있지만, 여기서는 간단히 전체 중 상위 4개를 가져오는 쿼리로 작성했습니다.
    @Query("SELECT new com.cinema.kino.dto.MainPageResponseDTO$ReviewSummary(m.title, AVG(r.rating), MAX(r.content)) " +
            "FROM Review r " +
            "JOIN Movie m ON r.movie.id = m.id " +
            "GROUP BY m.id, m.title " +
            "ORDER BY AVG(r.rating) DESC")
    List<MainPageResponseDTO.ReviewSummary> findTopReviewsSummary();
}