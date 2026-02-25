package com.cinema.kino.service;

import com.cinema.kino.dto.MovieResponseDTO;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 데이터를 읽기만 하므로 성능 최적화를 위해 readOnly = true 설정
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieLikeRepository movieLikeRepository;

    public List<MovieResponseDTO> getMoviesByType(String type, Long memberId, String keyword, String sort) {
        LocalDate today = LocalDate.now();
        List<Movie> movies;

        // 검색어가 null이면 빈 문자열로 바꿔서 전체 조회되도록 처리 (LIKE %%)
        String safeKeyword = (keyword == null) ? "" : keyword;

        if ("UPCOMING".equalsIgnoreCase(type)) {
            // 정렬 조건 분기 (가나다순 vs 개봉일순)
            if ("TITLE_ASC".equalsIgnoreCase(sort)) {
                movies = movieRepository.findUpcomingMoviesSortByTitle(today, MovieStatus.UPCOMING, safeKeyword);
            } else {
                movies = movieRepository.findUpcomingMoviesSortByDate(today, MovieStatus.UPCOMING, safeKeyword);
            }
        } else {
            // 전체 영화 탭은 기본적으로 예매율 순 정렬
            movies = movieRepository.findReleasedMovies(today, MovieStatus.SCREENING, safeKeyword);
        }

        return movies.stream()
                .map(movie -> convertToDTO(movie, memberId))
                .collect(Collectors.toList());
    }

    // 엔티티를 DTO로 변환하는 헬퍼 메서드 (코드가 깔끔해집니다)
    private MovieResponseDTO convertToDTO(Movie movie, Long memberId) {
        // 이 영화의 총 찜 개수
        long totalLikes = movieLikeRepository.countByMovieId(movie.getId());

        // 내가 찜했는지 여부 (비로그인이라 memberId가 null이면 무조건 false)
        boolean isLikedByMe = false;
        if (memberId != null) {
            isLikedByMe = movieLikeRepository.existsByMovieIdAndMemberId(movie.getId(), memberId);
        }

        return MovieResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .releaseDate(movie.getReleaseDate().toString())
                .bookingRate(movie.getBookingRate())
                .ageRating(movie.getAgeRating().getValue())
                .likeCount(totalLikes) // 💡 세팅 완료!
                .isLiked(isLikedByMe)  // 💡 세팅 완료!
                .build();
    }
}