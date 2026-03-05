package com.cinema.kino.dto;

import com.cinema.kino.dto.MovieDTO;
import com.cinema.kino.dto.CouponDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class MainPageResponseDTO {
    private List<MovieDTO> heroTrailers;
    private List<MovieDTO> bookingRank;
    private List<CouponDTO> activeCoupons;

    private List<ReviewSummary> topReviews;
    // 분리한 외부 DTO 사용
    private List<TheaterStatDTO> regionStats;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ReviewSummary {
        private String movieTitle;
        private Double avgRating;
        private String bestComment;
    }
}