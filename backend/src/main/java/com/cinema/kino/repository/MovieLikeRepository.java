package com.cinema.kino.repository;

import com.cinema.kino.entity.MovieLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    long countByMemberId(Long memberId);

    // 1. 특정 회원이 특정 영화에 누른 좋아요가 있는지 확인 (엔티티 객체가 필요할 때)
    Optional<MovieLike> findByMemberIdAndMovieId(Long memberId, Long movieId);

    // 2. 이미 찜했는지 여부 확인 (단순 T/F 체크로 로직 처리할 때 - 매우 빠름)
    boolean existsByMovieIdAndMemberId(Long movieId, Long memberId);

    // 3. 찜 취소 (언찜 - 데이터 삭제)
    void deleteByMovieIdAndMemberId(Long movieId, Long memberId);

    // 4. 영화별 총 찜 개수 (영화 목록에서 '하트 숫자' 보여줄 때 사용)
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
