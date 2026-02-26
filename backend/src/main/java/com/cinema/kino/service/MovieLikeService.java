package com.cinema.kino.service;

import com.cinema.kino.dto.MovieLikeItemResponseDTO;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieLikeService {

    private final MovieLikeRepository movieLikeRepository;
    private final MovieRepository movieRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public boolean toggleLike(Long movieId, MovieLikeRequestDTO request) {
        Long memberId = requireMemberId(request != null ? request.getMemberId() : null);

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
        Long safeMemberId = requireMemberId(memberId);
        if (!movieLikeRepository.existsByMovieIdAndMemberId(movieId, safeMemberId)) {
            throw new IllegalArgumentException("찜한 이력이 없습니다.");
        }
        movieLikeRepository.deleteByMovieIdAndMemberId(movieId, safeMemberId);
    }

    @Transactional(readOnly = true)
    public boolean isLiked(Long movieId, Long memberId) {
        Long safeMemberId = requireMemberId(memberId);
        return movieLikeRepository.existsByMovieIdAndMemberId(movieId, safeMemberId);
    }

    @Transactional(readOnly = true)
    public List<MovieLikeItemResponseDTO> getMyLikedMovies(Long memberId) {
        Long safeMemberId = requireMemberId(memberId);
        return movieLikeRepository.findAllByMemberIdWithMovie(safeMemberId).stream()
                .map(like -> MovieLikeItemResponseDTO.builder()
                        .movieId(like.getMovie().getId())
                        .title(like.getMovie().getTitle())
                        .posterUrl(like.getMovie().getPosterUrl())
                        .build())
                .toList();
    }

    private Long requireMemberId(Long memberId) {
        if (memberId == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        return memberId;
    }
}

