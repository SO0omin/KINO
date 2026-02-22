/* ========================
서버 → 프론트로 내려주는 좌석 상태
좌석+상영+영화+홀드 정보를 전부 포함하고 있는 Dto
======================== */
package com.cinema.kino.dto;

import com.cinema.kino.entity.ScreeningSeat;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SeatStatusResponseDto {

    // 좌석 정보
    private Long seatId;
    private String seatRow;
    private int seatNumber;
    private String status;
    private String seatType;
    private Integer posX;
    private Integer posY;

    // 상영 정보
    private Long theaterId;
    private String theaterName;
    private Long screeningId;
    private String screenName;       // 상영관 이름
    private String screenType;
    private Long movieId;
    private String movieTitle;
    private String ageRating;
    private String posterUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Long memberId;         // 회원
    private Long guestId;         //  비회원

    public static SeatStatusResponseDto from(ScreeningSeat ss) {
        var seat = ss.getSeat();
        var screening = ss.getScreening();
        var movie = screening.getMovie();
        var screen = screening.getScreen();
        var theater = screen.getTheater();

        return new SeatStatusResponseDto(
                seat.getId(),
                seat.getSeatRow(),
                seat.getSeatNumber(),
                ss.getStatus().name(),
                seat.getSeatType().name(),
                seat.getPosX(),
                seat.getPosY(),
                theater.getId(),
                theater.getName(),
                screening.getId(),
                screen.getName(),
                screen.getScreenType().getValue(),
                movie.getId(),
                movie.getTitle(),
                movie.getAgeRating().name(),
                movie.getPosterUrl(),
                screening.getStartTime(),
                screening.getEndTime(),
                ss.getHeldByMember() != null ? ss.getHeldByMember().getId() : null,
                ss.getHeldByGuest() != null ? ss.getHeldByGuest().getId() : null
        );
    }
}