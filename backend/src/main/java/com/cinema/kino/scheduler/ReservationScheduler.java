package com.cinema.kino.scheduler;

import com.cinema.kino.dto.SeatStatusMessage;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.repository.ScreeningSeatRepository;
import com.cinema.kino.service.ReservationTimeoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationTimeoutService reservationTimeoutService;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 1분(60000ms)마다 실행
    // 트랜잭션은 ReservationTimeoutService가 직접 관리합니다.
    // 여기서 @Transactional을 걸면 방송이 커밋 전에 나가기 때문에 일부러 열지 않습니다.
    @Scheduled(fixedRate = 60000)
    public void cancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();

        // 1. 해제되기 전에 "어떤 상영관의 어떤 좌석"이 풀릴지 먼저 확보
        Map<Long, List<SeatStatusMessage>> releasedByScreening = screeningSeatRepository.findExpiredSeatKeys(now)
                .stream()
                .collect(Collectors.groupingBy(
                        row -> (Long) row[0],
                        Collectors.mapping(
                                row -> SeatStatusMessage.of((Long) row[1], SeatStatus.AVAILABLE),
                                Collectors.toList()
                        )
                ));

        if (releasedByScreening.isEmpty()) {
            return;
        }

        // 2. 예약/결제/티켓/좌석 일괄 정리 (좌석 해제까지 이 안에서 끝납니다)
        reservationTimeoutService.processUnifiedExpiredReservations();

        // 3. 정리가 끝난 뒤, 풀린 좌석을 보고 있는 사용자들에게 방송
        releasedByScreening.forEach((screeningId, seats) ->
                messagingTemplate.convertAndSend("/topic/seats/" + screeningId, seats));

        log.info("만료 좌석 해제 및 방송 완료: 상영 {}건, 좌석 {}개",
                releasedByScreening.size(),
                releasedByScreening.values().stream().mapToInt(List::size).sum());
    }
}
