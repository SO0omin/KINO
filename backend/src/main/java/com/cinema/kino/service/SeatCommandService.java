/* =========================================================================
   [CQRS - Command] 좌석 선점 및 상태 변경 전용 서비스
   - 데이터의 상태를 변경(CUD - 예매, 선점, 취소)하는 핵심 비즈니스 로직을 담당합니다.
   - 비관적 락(Pessimistic Lock)을 사용하여 다수의 사용자가 동시 접속할 때의 동시성 문제를 제어합니다.
   - 순수하게 '변경'에만 집중하며, 필요한 조회 로직은 SeatService(Query)를 주입받아 사용합니다.
 ============================================================================ */
package com.cinema.kino.service;

import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.dto.SeatStatusResponseDTO;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.repository.ScreeningSeatRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional // 여기는 상태를 변경해야 하므로 readOnly를 쓰면 안 됩니다!
@RequiredArgsConstructor
public class SeatCommandService {

    private final ScreeningSeatRepository screeningSeatRepository;

    // 💡 가격 정보를 빌려오기 위해 Query 서비스(SeatService)를 주입받습니다.
    private final SeatService seatService;

    // 좌석 선점 로직
    public List<SeatStatusResponseDTO> holdSeats(SeatSelectRequestDTO request) {

        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(),
                request.getSeatIds()
        ); // 비관적 락

        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("요청한 좌석 중 일부를 찾을 수 없습니다.");
        }

        // 💡 중복 코드를 지우고, 주입받은 seatService에서 깔끔하게 가격 맵을 꺼내옵니다.
        Map<String, Integer> prices = seatService.getPricesForScreening(request.getScreeningId());

        return seats.stream().map(ss -> {
            ss.hold(request.getMemberId(), request.getGuestId()); // 도메인 메서드 실행

            return SeatStatusResponseDTO.from(ss, prices);
        }).collect(Collectors.toList());
    }
}