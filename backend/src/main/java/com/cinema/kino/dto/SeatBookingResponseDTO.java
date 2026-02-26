/* =========================================================================
   서버 → 프론트로 내려주는 예매 화면용 래퍼(Wrapper) DTO
   - 네트워크 용량 최적화를 위해 공통 정보(상영, 영화, 가격)와 개별 좌석 정보를 분리합니다.
   ========================================================================= */
package com.cinema.kino.dto;

import com.cinema.kino.entity.Screening;
import com.cinema.kino.entity.ScreeningSeat;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class SeatBookingResponseDTO {

    private ScreeningInfo screeningInfo; // 💡 상영/영화/가격 정보 (단 1번만 전송)
    private List<SeatInfo> seats;        // 💡 좌석 목록 배열

    // 팩토리 메서드: 서비스 단에서 호출하기 쉽게 만듦
    public static SeatBookingResponseDTO of(Screening screening, List<ScreeningSeat> screeningSeats, Map<String, Integer> prices) {
        ScreeningInfo info = ScreeningInfo.from(screening, prices);
        List<SeatInfo> seatList = screeningSeats.stream()
                .map(SeatInfo::from)
                .collect(Collectors.toList());
        return new SeatBookingResponseDTO(info, seatList);
    }

    /* ========================
       1. 공통 상영 정보 (Inner Class)
       ======================== */
    @Getter
    @AllArgsConstructor
    public static class ScreeningInfo {
        private Long theaterId;
        private String theaterName;
        private Long screeningId;
        private String screenName;
        private String screenType;
        private Long movieId;
        private String movieTitle;
        private String ageRating;
        private String posterUrl;
        private LocalDateTime startTime;
        private LocalDateTime endTime;

        // 가격 정보
        private Integer priceAdult;
        private Integer priceYouth;
        private Integer priceSenior;
        private Integer priceSpecial;

        public static ScreeningInfo from(Screening screening, Map<String, Integer> prices) {
            var movie = screening.getMovie();
            var screen = screening.getScreen();
            var theater = screen.getTheater();

            return new ScreeningInfo(
                    theater.getId(), theater.getName(),
                    screening.getId(), screen.getName(), screen.getScreenType().getValue(),
                    movie.getId(), movie.getTitle(), movie.getAgeRating().name(), movie.getPosterUrl(),
                    screening.getStartTime(), screening.getEndTime(),
                    prices.getOrDefault("ADULT", 15000),
                    prices.getOrDefault("YOUTH", 12000),
                    prices.getOrDefault("SENIOR", 10000),
                    prices.getOrDefault("SPECIAL", 10000)
            );
        }
    }

    /* ========================
       2. 개별 좌석 정보 (Inner Class)
       ======================== */
    @Getter
    @AllArgsConstructor
    public static class SeatInfo {
        private Long seatId;
        private String seatRow;
        private int seatNumber;
        private String status;
        private String seatType;
        private Integer posX;
        private Integer posY;
        private Long memberId;
        private Long guestId;

        public static SeatInfo from(ScreeningSeat ss) {
            var seat = ss.getSeat();
            return new SeatInfo(
                    seat.getId(), seat.getSeatRow(), seat.getSeatNumber(),
                    ss.getStatus().name(), seat.getSeatType().name(),
                    seat.getPosX(), seat.getPosY(),
                    ss.getHeldByMember() != null ? ss.getHeldByMember().getId() : null,
                    ss.getHeldByGuest() != null ? ss.getHeldByGuest().getId() : null
            );
        }
    }
}