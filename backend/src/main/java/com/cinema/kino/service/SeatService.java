/* =========================================================================
   [CQRS - Query] 좌석 상태 및 정보 조회 전용 서비스
   - 데이터의 상태를 변경하지 않고, 오직 프론트엔드로 내보낼 '조회(Read)'만을 담당합니다.
   - @Transactional(readOnly = true)를 적용하여 DB 조회 성능을 극대화했습니다.
   - 공통으로 사용되는 조회 로직(예: 동적 티켓 가격 계산)을 포함하여 타 서비스에 제공합니다.
   ========================================================================= */
package com.cinema.kino.service;

import com.cinema.kino.dto.SeatBookingResponseDTO;
import com.cinema.kino.dto.SeatStatusResponseDTO;
import com.cinema.kino.entity.Screening;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.TicketPrice;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.entity.enums.ScreeningType;
import com.cinema.kino.repository.ScreeningRepository;
import com.cinema.kino.repository.ScreeningSeatRepository;
import com.cinema.kino.repository.TicketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeatService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ScreeningRepository screeningRepository;
    private final TicketPriceRepository ticketPriceRepository;

    // 1. 프론트엔드로 좌석 상태 목록 반환
    // 💡 반환 타입이 List<DTO>에서 단일 객체(SeatBookingResponseDTO)로 변경되었습니다.
    public SeatBookingResponseDTO getSeatStatus(Long screeningId) {

        // 1. 공통 상영 정보 원본(Entity) 조회
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2. 가격 맵 계산
        Map<String, Integer> prices = getPricesForScreening(screeningId);

        // 3. 해당 상영의 좌석 리스트 조회
        List<ScreeningSeat> screeningSeats = screeningSeatRepository.findByScreeningId(screeningId);

        // 4. 새롭게 만든 DTO의 of 메서드를 통해 하나로 예쁘게 포장해서 반환!
        return SeatBookingResponseDTO.of(screening, screeningSeats, prices);
    }

    // 2. 💡 타 서비스(Command)에서도 쓸 수 있도록 public으로 개방!
    public Map<String, Integer> getPricesForScreening(Long screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        ScreenType screenType = screening.getScreen().getScreenType();
        int startHour = screening.getStartTime().getHour();
        ScreeningType screeningType;

        if (startHour < 10) {
            screeningType = ScreeningType.MORNING;
        } else if (startHour >= 21) {
            screeningType = ScreeningType.NIGHT;
        } else {
            screeningType = ScreeningType.NORMAL;
        }

        List<TicketPrice> ticketPrices = ticketPriceRepository.findByScreenTypeAndScreeningType(screenType, screeningType);

        if (ticketPrices.isEmpty()) {
            throw new IllegalStateException("해당 상영에 대한 티켓 가격 정책이 DB에 등록되어 있지 않습니다.");
        }

        return ticketPrices.stream()
                .collect(Collectors.toMap(
                        tp -> tp.getPriceType().name(),
                        TicketPrice::getPrice
                ));
    }
}