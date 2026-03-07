package com.cinema.kino.repository;

import com.cinema.kino.entity.Review;
import com.cinema.kino.dto.MainPageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMemberId(Long memberId);
    long countByMemberId(Long memberId);

    // 1. 메인 페이지용: 5개 항목 평균으로 상위 리뷰 가져오기
    @Query("SELECT new com.cinema.kino.dto.MainPageResponseDTO$ReviewSummary(" +
            "m.title, " +
            "AVG((r.scoreDirection + r.scoreStory + r.scoreVisual + r.scoreActor + r.scoreOst) / 5.0), " +
            "MAX(r.content)) " +
            "FROM Review r " +
            "JOIN Movie m ON r.movie.id = m.id " +
            "GROUP BY m.id, m.title " +
            "ORDER BY AVG((r.scoreDirection + r.scoreStory + r.scoreVisual + r.scoreActor + r.scoreOst) / 5.0) DESC")
    List<MainPageResponseDTO.ReviewSummary> findTopReviewsSummary();

    // 2. 특정 영화의 모든 리뷰 (기존 유지)
    List<Review> findByMovieId(Long movieId);

    // 3. ✨ 상세 페이지용: 한 번에 모든 평균값 가져오기 (반환 타입을 Object로 설정)
    @Query("SELECT " +
            "AVG((r.scoreDirection + r.scoreStory + r.scoreVisual + r.scoreActor + r.scoreOst) / 5.0), " +
            "AVG(r.scoreDirection), AVG(r.scoreStory), AVG(r.scoreVisual), AVG(r.scoreActor), AVG(r.scoreOst) " +
            "FROM Review r WHERE r.movie.id = :movieId")
    Object findAllAverageScoresByMovieId(@Param("movieId") Long movieId);

    // 4. ✨ 상세 페이지용: 평점순 정렬 페이징
    @Query("SELECT r FROM Review r WHERE r.movie.id = :movieId " +
            "ORDER BY (r.scoreDirection + r.scoreStory + r.scoreVisual + r.scoreActor + r.scoreOst) DESC, r.id DESC")
    Page<Review> findByMovieIdOrderByAverageScore(@Param("movieId") Long movieId, Pageable pageable);

    // 5. 기본 페이징
    Page<Review> findByMovieId(Long movieId, Pageable pageable);

}
