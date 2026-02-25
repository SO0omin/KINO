package com.cinema.kino.service;

import com.cinema.kino.dto.MovieResponseDTO;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.enums.MovieStatus;
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

    public List<MovieResponseDTO> getMoviesByType(String type) {
        LocalDate today = LocalDate.now();
        List<Movie> movies;

        log.info("영화 목록 조회 요청 - 타입: {}, 기준일: {}", type, today);

        if ("UPCOMING".equalsIgnoreCase(type)) {
            // 상영 예정작: 상태가 UPCOMING이거나 개봉일이 내일 이후인 영화
            movies = movieRepository.findUpcomingMoviesOrderByReleaseDate(today, MovieStatus.UPCOMING);
        } else {
            // 전체 영화 (기본값): 상태가 SCREENING이고 개봉일이 지났거나 오늘인 영화
            movies = movieRepository.findAllReleasedMoviesOrderByBookingRate(today, MovieStatus.SCREENING);
        }

        // Entity 리스트를 DTO 리스트로 변환 (Map)
        return movies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 엔티티를 DTO로 변환하는 헬퍼 메서드 (코드가 깔끔해집니다)
    private MovieResponseDTO convertToDTO(Movie movie) {
        return MovieResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .description(movie.getDescription())
                .releaseDate(movie.getReleaseDate().toString()) // LocalDate -> String
                .bookingRate(movie.getBookingRate())
                .ageRating(movie.getAgeRating().name()) // Enum의 이름("ALL", "12" 등)을 추출
                .build();
    }
}