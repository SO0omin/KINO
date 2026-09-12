package com.cinema.kino.dto;

import com.cinema.kino.entity.Movie;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MovieDTO {
    private Long id;
    private String title;
    private String ageRating;
    private Integer durationMin;
    private String posterUrl;
    private String trailerUrl;
    private String status;
    private Double avgRating;
    private List<String> latestReviews;

    // 1: Movie만 받을 때 (Hero 섹션 등)
    public static MovieDTO from(Movie movie) {
        return from(movie, 0.0, List.of());
    }

    // 2: Movie와 평점만 받을 때
    public static MovieDTO from(Movie movie, Double avgRating) {
        return from(movie, avgRating, List.of());
    }

    // 3: Movie, 평점, 최신 리뷰까지 모두 받을 때 (랭킹 섹션용)
    public static MovieDTO from(Movie movie, Double avgRating, List<String> latestReviews) {
        return MovieDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .ageRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : "ALL")
                .durationMin(movie.getDurationMin())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .status(movie.getStatus() != null ? movie.getStatus().name() : "UPCOMING")
                .avgRating(avgRating != null ? Math.round(avgRating * 10) / 10.0 : 0.0)
                .latestReviews(latestReviews)
                .build();
    }
}