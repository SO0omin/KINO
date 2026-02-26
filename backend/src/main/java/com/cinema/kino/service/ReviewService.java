package com.cinema.kino.service;

import com.cinema.kino.dto.ReviewSaveRequestDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.Review;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieRepository;
import com.cinema.kino.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void saveReview(Long memberId, ReviewSaveRequestDTO dto) {
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Review review = Review.builder()
                .content(dto.getContent())
                .scoreDirection(dto.getScoreDirection())
                .scoreStory(dto.getScoreStory())
                .scoreVisual(dto.getScoreVisual())
                .scoreActor(dto.getScoreActor())
                .scoreOst(dto.getScoreOst())
                .movie(movie)
                .member(member)
                .build();

        reviewRepository.save(review);
    }
}