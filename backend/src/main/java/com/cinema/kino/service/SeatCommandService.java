/* =========================================================================
   [CQRS - Command] 좌석 선점 및 상태 변경 전용 서비스
   - 데이터의 상태를 변경(CUD - 예매, 선점, 취소)하는 핵심 비즈니스 로직을 담당합니다.
   - 비관적 락(Pessimistic Lock)을 사용하여 다수의 사용자가 동시 접속할 때의 동시성 문제를 제어합니다.
   - 순수하게 '변경'에만 집중하며, 필요한 조회 로직은 SeatService(Query)를 주입받아 사용합니다.
 ============================================================================ */
package com.cinema.kino.service;

import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.repository.ScreeningSeatRepository;
import com.cinema.kino.util.AuthenticatedActor;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SeatCommandService {

    private final ScreeningSeatRepository screeningSeatRepository;

    // 좌석 선점 로직
    public void holdSeats(SeatSelectRequestDTO request, AuthenticatedActor actor) {

        //티켓 리스트에서 seatId만 뽑아내기
        List<Long> requestedSeatIds = request.getTickets().stream()
                .map(SeatSelectRequestDTO.TicketRequest::getSeatId)
                .collect(Collectors.toList());

        //추출한 ID 리스트로 DB 조회
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(),
                requestedSeatIds
        );

        //검증 로직도 추출한 리스트 사이즈와 비교하도록 수정
        if (seats.size() != requestedSeatIds.size()) {
            throw new IllegalArgumentException("요청한 좌석 중 일부를 찾을 수 없거나 이미 선택된 좌석입니다.");
        }

        //선점 주체는 토큰에서 해석된 값만 사용
        seats.forEach(ss -> ss.hold(actor.memberId(), actor.guestId()));
    }
}
