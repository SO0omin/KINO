package com.cinema.kino.service;

import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.repository.PaymentRepository;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.repository.ReservationTicketRepository;
import com.cinema.kino.repository.ScreeningSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.cinema.kino.entity.enums.PaymentStatus.FAILED;
import static com.cinema.kino.entity.enums.PaymentStatus.READY;
import static com.cinema.kino.entity.enums.ReservationStatus.CANCELED;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationTimeoutService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ReservationTicketRepository reservationTicketRepository;

    @Transactional
    public void processUnifiedExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();

        // 1. 단일 타이머 기준: holdExpiresAt 시간이 지난 모든 좌석 조회 (결제 완료 안 된 녀석들)
        List<Long> reservationIds = screeningSeatRepository.findReservationIdsToCancel(now);

        if (!reservationIds.isEmpty()) {
            // 2. 예약/결제/티켓 일괄 정리
            for (Long resId : reservationIds) {
                reservationRepository.findById(resId).ifPresent(res -> {
                    res.setStatus(CANCELED);

                    paymentRepository.findByReservationId(resId).ifPresent(p -> {
                        if (READY.equals(p.getPaymentStatus())) {
                            p.setPaymentStatus(FAILED);
                            p.setCancelledAt(now);
                        }
                    });

                    reservationTicketRepository.deleteAllByReservationId(resId);
                });
            }
        }

        int updatedSeats = screeningSeatRepository.releaseExpiredSeatsAndClearReservation(now);

        if (updatedSeats > 0) {
            log.info("만료 데이터 정리 완료: 예약 {}건, 좌석 {}개", reservationIds.size(), updatedSeats);
        }
    }
}
