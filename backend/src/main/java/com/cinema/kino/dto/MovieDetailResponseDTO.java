package com.cinema.kino.dto;

import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter @Builder @AllArgsConstructor
@NoArgsConstructor // JSON 파싱을 위해 추가
public class MovieDetailResponseDTO {
    private Long id;
    private String title;
    private String posterUrl;
    private String director;
    private String actor;
    private String description;
    private String releaseDate;
    private String ageRating;
    private int durationMin;
    private String dDay;
    @JsonProperty("isLiked")
    private boolean isLiked;

    // 통계 및 이미지용 데이터
    private Double bookingRate;
    private Long cumulativeAudience;
    private String topPoints;
    private Double avgDirection;
    private Double avgStory;
    private Double avgVisual;
    private Double avgActor;
    private Double avgOst;
    private Double totalAvgRating;

    private List<String> stillCutUrls;
    private String trailerUrl;
    private List<ReviewDTO> reviews;

    private List<TrendDTO> audienceTrend;

    private long totalReviewCount;
    @Getter @Builder @AllArgsConstructor
    @NoArgsConstructor
    public static class ReviewDTO {
        private Long id;
        private String maskedUsername;
        private String profileImage;
        private String content;
        private Double averageScore;
        private String topKeywords;
        private String createdAt;
        private int scoreDirection;
        private int scoreStory;
        private int scoreVisual;
        private int scoreActor;
        private int scoreOst;

    }

    @Getter @Builder @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendDTO {
        private String date;
        private Long count;
    }
}