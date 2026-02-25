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

    /**
     * 영화 찜하기 토글 로직
     * @param movieId 영화 PK
     * @param request 회원 정보가 담긴 DTO
     * @return boolean (true: 찜 등록됨, false: 찜 해제됨)
     */
    @Transactional
    public boolean toggleLike(Long movieId, MovieLikeRequestDTO request) {
        Long memberId = request.getMemberId();

        // 1. 이미 찜한 상태인지 확인
        if (movieLikeRepository.existsByMovieIdAndMemberId(movieId, memberId)) {
            // 2. 이미 있다면 삭제 (찜 취소)
            movieLikeRepository.deleteByMovieIdAndMemberId(movieId, memberId);
            return false; // 취소되었으므로 false 반환
        } else {
            // 3. 없다면 데이터 조회 후 새로 생성 (찜 등록)
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다. ID: " + movieId));
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다. ID: " + memberId));

            MovieLike movieLike = MovieLike.builder()
                    .movie(movie)
                    .member(member)
                    .build();

            movieLikeRepository.save(movieLike);
            return true; // 등록되었으므로 true 반환
        }
    }
}