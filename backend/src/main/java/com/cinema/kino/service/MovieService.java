package com.cinema.kino.service;

import com.cinema.kino.dto.MovieDetailResponseDTO;
import com.cinema.kino.dto.MovieResponseDTO;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.Review;
import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.MovieRepository;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final MovieLikeRepository movieLikeRepository;

    /**
     * [목록] 영화 목록 조회 (전체/상영예정작 + 검색 + 정렬)
     */
    public List<MovieResponseDTO> getMoviesByType(String type, Long memberId, String keyword, String sort) {
        LocalDate today = LocalDate.now();
        List<Movie> movies;
        String safeKeyword = (keyword == null) ? "" : keyword;

        if ("UPCOMING".equalsIgnoreCase(type)) {
            movies = "TITLE_ASC".equalsIgnoreCase(sort)
                    ? movieRepository.findUpcomingMoviesSortByTitle(today, MovieStatus.UPCOMING, safeKeyword)
                    : movieRepository.findUpcomingMoviesSortByDate(today, MovieStatus.UPCOMING, safeKeyword);
        } else {
            movies = movieRepository.findReleasedMovies(today, MovieStatus.SCREENING, safeKeyword);
        }

        return movies.stream()
                .map(movie -> convertToDTO(movie, memberId))
                .collect(Collectors.toList());
    }

    /**
     * [상세] 영화 상세 정보 조회 (최적화 버전)
     */
    public MovieDetailResponseDTO getMovieDetail(Long movieId, Long memberId, Pageable pageable) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다. ID: " + movieId));

        // 1. 페이징된 리뷰 조회
        boolean isSortByRating = pageable.getSort().stream()
                .anyMatch(order -> order.getProperty().equals("averageScore"));

        Page<Review> reviewPage = isSortByRating
                ? reviewRepository.findByMovieIdOrderByAverageScore(movieId, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()))
                : reviewRepository.findByMovieId(movieId, pageable);

        // 2. 관객수 추이 데이터
        List<Map<String, Object>> trendData = reservationRepository.findAudienceTrend(movieId);

        // 3. DB에서 단 한 번의 쿼리로 모든 평균값 가져오기
        Object result = reviewRepository.findAllAverageScoresByMovieId(movieId);
        Object[] scoreData;

        if (result instanceof Object[]) {
            scoreData = (Object[]) result;
        } else if (result != null) {
            // 결과가 1줄인 경우 배열의 배열로 올 때가 있어서 방어 로직 추가
            scoreData = (Object[]) result;
        } else {
            scoreData = new Object[]{0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
        }

        double totalAvg = scoreData[0] != null ? ((Number) scoreData[0]).doubleValue() : 0.0;
        double avgDir   = scoreData[1] != null ? ((Number) scoreData[1]).doubleValue() : 0.0;
        double avgStory = scoreData[2] != null ? ((Number) scoreData[2]).doubleValue() : 0.0;
        double avgVisual= scoreData[3] != null ? ((Number) scoreData[3]).doubleValue() : 0.0;
        double avgActor = scoreData[4] != null ? ((Number) scoreData[4]).doubleValue() : 0.0;
        double avgOst   = scoreData[5] != null ? ((Number) scoreData[5]).doubleValue() : 0.0;

        // 4. 좋아요 여부 확인
        boolean isLiked = (memberId != null) && movieLikeRepository.existsByMovieIdAndMemberId(movieId, memberId);

        return MovieDetailResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .director(movie.getDirector())
                .actor(movie.getActor())
                .description(movie.getDescription())
                .releaseDate(movie.getReleaseDate().toString())
                .ageRating(movie.getAgeRating().getValue())
                .durationMin(movie.getDurationMin())
                .dDay(calculateDDay(movie.getReleaseDate()))
                .bookingRate(movie.getBookingRate() != null ? movie.getBookingRate().doubleValue() : 0.0)
                .cumulativeAudience(movie.getCumulativeAudience() != null ? movie.getCumulativeAudience() : 0)
                .topPoints(calculateTopPoints(avgDir, avgStory, avgVisual, avgActor, avgOst)) // 위에서 구한 값 재사용
                .avgDirection(round(avgDir))
                .avgStory(round(avgStory))
                .avgVisual(round(avgVisual))
                .avgActor(round(avgActor))
                .avgOst(round(avgOst))
                .totalAvgRating(round(totalAvg))
                .stillCutUrls(movie.getStills().stream().map(s -> s.getImageUrl().trim()).collect(Collectors.toList()))
                .trailerUrl(movie.getTrailerUrl())
                .isLiked(isLiked)
                .totalReviewCount(reviewPage.getTotalElements())
                .reviews(reviewPage.getContent().stream().map(this::convertToReviewDTO).collect(Collectors.toList()))
                .audienceTrend(trendData.stream().map(m -> MovieDetailResponseDTO.TrendDTO.builder()
                        .date((String) m.get("date")).count(((Number) m.get("count")).longValue()).build()).collect(Collectors.toList()))
                .build();
    }

    // --- Private Helper Methods ---

    private MovieResponseDTO convertToDTO(Movie movie, Long memberId) {
        long totalLikes = movieLikeRepository.countByMovieId(movie.getId());
        boolean isLikedByMe = (memberId != null) && movieLikeRepository.existsByMovieIdAndMemberId(movie.getId(), memberId);

        Double avgRating = getAverageRating(movie.getId());

        return MovieResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .description(movie.getDescription())
                .releaseDate(movie.getReleaseDate().toString())
                .bookingRate(movie.getBookingRate())
                .ageRating(movie.getAgeRating().getValue())
                .likeCount(totalLikes)
                .isLiked(isLikedByMe)
                .avgRating(avgRating)
                .build();
    }

    // 공용 평점 계산기 (최적화 버전)
    private Double getAverageRating(Long movieId) {
        Object result = reviewRepository.findAllAverageScoresByMovieId(movieId);
        if (result == null) return 0.0;

        Object[] scoreData = (Object[]) result;
        Double totalAvg = (Double) scoreData[0];
        return round(totalAvg != null ? totalAvg : 0.0);
    }

    private MovieDetailResponseDTO.ReviewDTO convertToReviewDTO(Review r) {
        String raw = r.getMember().getUsername();
        String masked = raw.length() > 4 ? raw.substring(0, 2) + "**" + raw.substring(raw.length() - 4) : raw.substring(0, 1) + "**";
        double reviewAvg = (r.getScoreDirection() + r.getScoreStory() + r.getScoreVisual() + r.getScoreActor() + r.getScoreOst()) / 5.0;

        // 가장 높은 점수 항목 찾기
        Map<String, Integer> scoreMap = new LinkedHashMap<>();
        scoreMap.put("연출", r.getScoreDirection()); scoreMap.put("스토리", r.getScoreStory());
        scoreMap.put("영상미", r.getScoreVisual()); scoreMap.put("배우", r.getScoreActor());
        scoreMap.put("OST", r.getScoreOst());

        int maxVal = Collections.max(scoreMap.values());
        String topKwd = scoreMap.entrySet().stream()
                .filter(entry -> entry.getValue() == maxVal)
                .map(Map.Entry::getKey).collect(Collectors.joining("·"));

        return MovieDetailResponseDTO.ReviewDTO.builder()
                .id(r.getId()).maskedUsername(masked).profileImage(r.getMember().getProfileImage())
                .content(r.getContent()).averageScore(round(reviewAvg)).topKeywords(topKwd)
                .createdAt(r.getCreatedAt().toLocalDate().toString()).build();
    }

    private String calculateTopPoints(double d, double s, double v, double a, double o) {
        Map<String, Double> p = new HashMap<>();
        p.put("연출", d); p.put("스토리", s); p.put("영상미", v); p.put("배우", a); p.put("OST", o);
        return p.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(2).map(Map.Entry::getKey).collect(Collectors.joining("·"));
    }

    private double round(double value) { return Math.round(value * 10) / 10.0; }

    private String calculateDDay(LocalDate releaseDate) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), releaseDate);
        return days > 0 ? "D-" + days : (days == 0 ? "D-Day" : "상영 중");
    }
}