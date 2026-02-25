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
    // 1. 기존 DTO 재활용
    private List<MovieDTO> heroTrailers;    // status가 UPCOMING인 영화 3개
    private List<MovieDTO> bookingRank;     // 예매 순위 상위 4개
    private List<CouponDTO> activeCoupons;  // 발급 가능한 쿠폰 목록

    // 2. 내부에 정의하는 요약 정보
    private List<ReviewSummary> topReviews; // 평점 TOP 4
    private List<TheaterStat> regionStats;  // 지역별 극장 현황

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ReviewSummary {
        private String movieTitle;
        private Double avgRating;
        private String bestComment;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TheaterStat {
        private String regionName;
        private Long theaterCount;
    }
}