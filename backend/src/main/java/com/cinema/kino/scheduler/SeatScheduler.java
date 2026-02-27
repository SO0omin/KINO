package com.cinema.kino.scheduler;

import com.cinema.kino.repository.ScreeningSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class SeatScheduler {

    private final ScreeningSeatRepository screeningSeatRepository;

    @Scheduled(fixedRate = 50000)
    @Transactional
    public void releaseExpiredSeats() {

        int updated = screeningSeatRepository
                .releaseExpiredSeats(LocalDateTime.now());

        if (updated > 0) {
            System.out.println("만료 좌석 해제: " + updated + "개");
        }
    }
}