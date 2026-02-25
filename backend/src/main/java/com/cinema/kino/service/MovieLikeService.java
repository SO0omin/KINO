package com.cinema.kino.service;

import com.cinema.kino.entity.MovieLike;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.MovieRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MovieLikeService {
    private final MovieLikeRepository movieLikeRepository;
    private final MemberRepository memberRepository;
    private final MovieRepository movieRepository;

    @Transactional
    public boolean toggleLike(Long memberId, Long movieId) {
        return movieLikeRepository.findByMemberIdAndMovieId(memberId, movieId)
                .map(like -> {
                    movieLikeRepository.delete(like); // 이미 있으면 삭제 (좋아요 취소)
                    return false;
                })
                .orElseGet(() -> {
                    var member = memberRepository.findById(memberId).orElseThrow();
                    var movie = movieRepository.findById(movieId).orElseThrow();
                    movieLikeRepository.save(MovieLike.builder().member(member).movie(movie).build());
                    return true; // 없으면 생성 (좋아요 성공)
                });
    }
}