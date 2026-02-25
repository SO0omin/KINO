package com.cinema.kino.repository;
import com.cinema.kino.entity.MovieLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    // 특정 회원이 특정 영화에 누른 좋아요가 있는지 확인
    Optional<MovieLike> findByMemberIdAndMovieId(Long memberId, Long movieId);
}