package com.cinema.kino.service;

import com.cinema.kino.dto.MovieLikeRequestDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.MovieLike;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieLikeService {

    private final MovieLikeRepository movieLikeRepository;
    private final MovieRepository movieRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void toggleLike(Long movieId, MovieLikeRequestDTO request) {
        Long memberId = request.getMemberId();

        // 1. 이미 찜한 상태라면? -> 삭제 (언찜)
        if (movieLikeRepository.existsByMovieIdAndMemberId(movieId, memberId)) {
            movieLikeRepository.deleteByMovieIdAndMemberId(movieId, memberId);
        }
        // 2. 찜하지 않은 상태라면? -> 추가 (찜)
        else {
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다."));
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

            MovieLike movieLike = MovieLike.builder()
                    .movie(movie)
                    .member(member)
                    .build();

            movieLikeRepository.save(movieLike);
        }
    }
}