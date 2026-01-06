package com.cinema.kino.dto;

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
    private Integer posX;
    private Integer posY;

    // 상영 정보
    private Long screeningId;
    private String screenName;       // 상영관 이름
    private Long movieId;
    private String movieTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // 유저 정보 (선택적)
    private String username;         // 로그인 회원이면
    private String guestName;        // 비회원이면
    private String guestTel;
}