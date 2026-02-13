package com.cinema.kino.service;

import com.cinema.kino.dto.CouponDTO;
import com.cinema.kino.dto.MovieDTO;
import com.cinema.kino.dto.MainPageResponseDTO;
import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MainService {

    private final MovieRepository movieRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final RegionRepository regionRepository;

    public MainPageResponseDTO getMainPageData() {
        // 1. 히어로 섹션: 상영 예정작(UPCOMING) 최신 3개
        List<MovieDTO> heroTrailers = movieRepository.findTop3ByStatusOrderByIdDesc(MovieStatus.UPCOMING)
                .stream().map(MovieDTO::from).collect(Collectors.toList());

        // 2. 랭킹 섹션: 예매 순위 상위 4개 (Repository에 커스텀 쿼리 필요)
        List<MovieDTO> bookingRank = movieRepository.findTop4ByBookingCount()
                .stream().map(MovieDTO::from).collect(Collectors.toList());

        // 3. 혜택 섹션: 발급 가능한 쿠폰 목록
        List<CouponDTO> activeCoupons = couponRepository.findAll() // 실제론 유효기간 등 조건 추가 가능
                .stream().map(CouponDTO::from).collect(Collectors.toList());

        // 4. 평점 섹션: 평점 높은 영화 요약 (내부 클래스 활용)
        List<MainPageResponseDTO.ReviewSummary> topReviews = reviewRepository.findTopReviewsSummary();

        // 5. 극장 섹션: 지역별 극장 현황 (내부 클래스 활용)
        List<MainPageResponseDTO.TheaterStat> regionStats = regionRepository.findRegionStats();

        return MainPageResponseDTO.builder()
                .heroTrailers(heroTrailers)
                .bookingRank(bookingRank)
                .activeCoupons(activeCoupons)
                .topReviews(topReviews)
                .regionStats(regionStats)
                .build();
    }
}