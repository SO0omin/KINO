package com.cinema.kino.scheduler;

import com.cinema.kino.service.ReservationTimeoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationTimeoutService reservationTimeoutService;

    // 1분(60000ms)마다 실행
    @Scheduled(fixedRate = 60000)
    public void cancelExpiredReservations() {
        reservationTimeoutService.processUnifiedExpiredReservations();
    }
}