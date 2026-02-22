package com.cinema.kino.dto;

import com.cinema.kino.entity.ScreeningSeat;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SeatResponseDTO {
    private Long id;            // screening_seat_id
    private String seatRow;     // A, B, C...
    private Integer seatNumber; // 1, 2, 3...
    private String status;      // AVAILABLE, HELD, RESERVED
    private String type;        // NORMAL, DISABLED, COUPLE...
    private Integer posX;       // 그리드 X 좌표
    private Integer posY;       // 그리드 Y 좌표

    public static SeatResponseDTO from(ScreeningSeat ss) {
        return SeatResponseDTO.builder()
                .id(ss.getId())
                .seatRow(ss.getSeat().getSeatRow())
                .seatNumber(ss.getSeat().getSeatNumber())
                .status(ss.getStatus().name())
                .type(ss.getSeat().getSeatType().name())
                .posX(ss.getSeat().getPosX())
                .posY(ss.getSeat().getPosY())
                .build();
    }
}