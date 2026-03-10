package com.cinema.kino.scheduler;

import com.cinema.kino.repository.ScreeningSeatRepository;
import com.cinema.kino.service.ReservationTimeoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationTimeoutService reservationTimeoutService;
    private final ScreeningSeatRepository screeningSeatRepository;

    // 1분(60000ms)마다 실행
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredReservations() {
        reservationTimeoutService.processUnifiedExpiredReservations();

        int updated = screeningSeatRepository
                .releaseExpiredSeatsAndClearReservation(LocalDateTime.now());

        if (updated > 0) {
            System.out.println("만료 좌석 해제: " + updated + "개");
        }
    }
}