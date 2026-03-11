package com.cinema.kino.service;

import com.cinema.kino.dto.MovieLikeItemResponseDTO;
import com.cinema.kino.dto.MovieLikeRequestDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.MovieLike;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.ReviewRepository;
import com.cinema.kino.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieLikeService {

    private final MovieLikeRepository movieLikeRepository;
    private final MovieRepository movieRepository;
    private final MemberRepository memberRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public boolean toggleLike(Long movieId, MovieLikeRequestDTO request) {
        Long memberId = getMemberIdOrThrow(request);

        if (movieLikeRepository.existsByMovieIdAndMemberId(movieId, memberId)) {
            movieLikeRepository.deleteByMovieIdAndMemberId(movieId, memberId);
            return false;
        }

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다. ID: " + movieId));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다. ID: " + memberId));

        MovieLike movieLike = MovieLike.builder()
                .movie(movie)
                .member(member)
                .build();

        movieLikeRepository.save(movieLike);
        return true;
    }

    @Transactional
    public void unlike(Long movieId, Long memberId) {
        if (memberId == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        movieLikeRepository.deleteByMovieIdAndMemberId(movieId, memberId);
    }

    @Transactional(readOnly = true)
    public boolean isLiked(Long movieId, Long memberId) {
        if (memberId == null) {
            return false;
        }
        return movieLikeRepository.existsByMovieIdAndMemberId(movieId, memberId);
    }

    @Transactional(readOnly = true)
    public List<MovieLikeItemResponseDTO> getMyLikedMovies(Long memberId) {
        if (memberId == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }

        return movieLikeRepository.findAllByMemberIdWithMovie(memberId).stream()
                .map(movieLike -> {
                    Movie movie = movieLike.getMovie();

                    // 리뷰 평점 계산
                    Object result = reviewRepository.findAllAverageScoresByMovieId(movie.getId());
                    Double totalAvg = 0.0;
                    if (result != null) {
                        Object[] scoreData = (Object[]) result;
                        Double rawAvg = (Double) scoreData[0];
                        if (rawAvg != null) {
                            totalAvg = Math.round(rawAvg * 10) / 10.0;
                        }
                    }

                    return MovieLikeItemResponseDTO.builder()
                            .movieId(movie.getId())
                            .title(movie.getTitle())
                            .posterUrl(movie.getPosterUrl())
                            .ageRating(movie.getAgeRating().name())
                            .bookingRate(movie.getBookingRate() != null ? movie.getBookingRate() : BigDecimal.ZERO)
                            .releaseDate(movie.getReleaseDate().toString())
                            .userScore(totalAvg)
                            .build();
                })
                .toList();
    }

    private Long getMemberIdOrThrow(MovieLikeRequestDTO request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        return request.getMemberId();
    }
}
