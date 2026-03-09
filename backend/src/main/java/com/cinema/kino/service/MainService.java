package com.cinema.kino.service;

import com.cinema.kino.dto.CouponDTO;
import com.cinema.kino.dto.MovieDTO;
import com.cinema.kino.dto.MainPageResponseDTO;
import com.cinema.kino.dto.TheaterStatDTO;
import com.cinema.kino.entity.Coupon;
import com.cinema.kino.entity.Review;
import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
        List<MovieDTO> bookingRank = movieRepository.findTop4ByBookingCount().stream()
                .map(movie -> {
                    // 평점 계산
                    List<Review> reviews = reviewRepository.findByMovieId(movie.getId());
                    double avg = reviews.stream()
                            .mapToDouble(r -> (r.getScoreDirection() + r.getScoreStory() + r.getScoreVisual() + r.getScoreActor() + r.getScoreOst()) / 5.0)
                            .average().orElse(0.0);

                    // ✨ 해당 영화의 최신 리뷰 3개 추출 (작성일 기준)
                    List<String> latest3 = reviews.stream()
                            .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                            .limit(3)
                            .map(Review::getContent)
                            .collect(Collectors.toList());

                    return MovieDTO.from(movie, avg, latest3);
                })
                .collect(Collectors.toList());

        // 3. 혜택 섹션: 실제 사용에 가까운 구성 (매표2 + 매점1 + 포인트1)
        List<Coupon> downloadableCoupons = couponRepository.findDownloadableCoupons(null, LocalDateTime.now());
        List<CouponDTO> activeCoupons = selectMainCoupons(downloadableCoupons).stream()
                .map(CouponDTO::from)
                .collect(Collectors.toList());

        // 4. 평점 섹션: 평점 높은 영화 요약 (내부 클래스 활용)
        List<MainPageResponseDTO.ReviewSummary> topReviews = reviewRepository.findTopReviewsSummary();

        // 5. 극장 섹션: 지역별 극장 현황 (내부 클래스 활용)
        List<TheaterStatDTO> regionStats = regionRepository.findRegionStats();

        return MainPageResponseDTO.builder()
                .heroTrailers(heroTrailers)
                .bookingRank(bookingRank)
                .activeCoupons(activeCoupons)
                .topReviews(topReviews)
                .regionStats(regionStats)
                .build();
    }

    private List<Coupon> selectMainCoupons(List<Coupon> source) {
        if (source == null || source.isEmpty()) {
            return List.of();
        }

        List<Coupon> ticketsPool = source.stream()
                .filter(this::isTicketCoupon)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(ticketsPool);
        List<Coupon> tickets = ticketsPool.stream()
                .limit(2)
                .collect(Collectors.toCollection(ArrayList::new));

        List<Coupon> storesPool = source.stream()
                .filter(this::isStoreCoupon)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(storesPool);
        List<Coupon> stores = storesPool.stream()
                .limit(1)
                .collect(Collectors.toCollection(ArrayList::new));

        List<Coupon> pointsPool = source.stream()
                .filter(this::isPointCoupon)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(pointsPool);
        List<Coupon> points = pointsPool.stream()
                .limit(1)
                .collect(Collectors.toCollection(ArrayList::new));

        List<Coupon> selected = new ArrayList<>();
        selected.addAll(tickets);
        selected.addAll(stores);
        selected.addAll(points);

        if (selected.size() < 4) {
            List<Long> selectedIds = selected.stream().map(Coupon::getId).toList();
            List<Coupon> remain = source.stream()
                    .filter(c -> !selectedIds.contains(c.getId()))
                    .collect(Collectors.toCollection(ArrayList::new));
            Collections.shuffle(remain);
            remain.stream()
                    .limit(4L - selected.size())
                    .forEach(selected::add);
        }

        Collections.shuffle(selected);
        return selected;
    }

    private boolean isTicketCoupon(Coupon coupon) {
        return "매표".equals(normalizedKind(coupon));
    }

    private boolean isStoreCoupon(Coupon coupon) {
        return "매점".equals(normalizedKind(coupon));
    }

    private boolean isPointCoupon(Coupon coupon) {
        return "포인트".equals(normalizedKind(coupon));
    }

    private String normalizedKind(Coupon coupon) {
        if (coupon == null || coupon.getCouponKind() == null) return "";
        return coupon.getCouponKind().trim();
    }

}
