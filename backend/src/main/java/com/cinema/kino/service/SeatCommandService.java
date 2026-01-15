/* ========================
좌석 상태를 변경하는 서비스, 명령(Command) 담당
CQRS 스타일로, SeatService(Query)와 분리
CQRS(Command Query Responsibility Segregation):
시스템의 데이터 변경(Command, 명령)과 데이터 조회(Query, 쿼리) 작업을 별도의 모델과 프로세스로 분리하여 관리 설계 패턴
======================== */
package com.cinema.kino.service;

import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.repository.ScreeningSeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class SeatCommandService {

    private final ScreeningSeatRepository screeningSeatRepository;

    public ScreeningSeat holdSeat(
            Long screeningId,
            Long seatId,
            Long memberId,
            Long guestId
    ) {
        ScreeningSeat ss = screeningSeatRepository
                .findByScreeningIdAndSeatId(screeningId, seatId)
                .orElseThrow(() -> new IllegalStateException("해당 상영의 좌석이 존재하지 않습니다."));

        ss.hold(memberId, guestId);
        return ss;
    }
}