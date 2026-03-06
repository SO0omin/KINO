package com.cinema.kino.scheduler;

import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.repository.MovieRepository;
import com.cinema.kino.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MovieStatScheduler {

    private final MovieRepository movieRepository;
    private final ReservationRepository reservationRepository;

    // 테스트를 위해 1분마다 실행 (실제 운영 시에는 "0 0 * * * *" 매시 정각으로)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateMovieStatistics() {
        System.out.println("====== 스케줄러 정상 작동 중! ======");
        log.info("KINO 예매율 및 관객수 업데이트 배치 시작");

        // 1. 시스템 전체 유효 관객수 (PAID 상태인 인원 합계)
        Long totalAudience = reservationRepository.sumAllTotalNum(ReservationStatus.PAID);

        if (totalAudience == null || totalAudience == 0) {
            log.info("유효한 예매 내역이 없어 통계를 업데이트하지 않습니다.");
            return;
        }

        // 2. 모든 영화 리스트 조회
        List<Movie> movies = movieRepository.findAll();

        for (Movie movie : movies) {
            // 3. 해당 영화의 누적 관객수 계산 (total_num 합계)
            Long movieAudience = reservationRepository.sumTotalNumByMovieId(movie.getId(), ReservationStatus.PAID);
            long audienceCount = (movieAudience != null) ? movieAudience : 0L;

            movie.setCumulativeAudience(audienceCount);

            // 4. 예매율 계산: (해당 영화 관객 수 / 전체 관객 수) * 100
            double rate = ((double) audienceCount / totalAudience) * 100;

            // 소수점 첫째 자리까지 반올림
            BigDecimal roundedRate = new BigDecimal(rate).setScale(1, RoundingMode.HALF_UP);
            movie.setBookingRate(roundedRate);
        }

        log.info("KINO 통계 업데이트 완료! (전체 관객수: {}, 대상 영화: {}편)", totalAudience, movies.size());
    }
}