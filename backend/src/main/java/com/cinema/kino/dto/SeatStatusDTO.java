package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusDTO {
    private Long screeningId; // 어떤 영화인지
    private String seatNo;    // 좌석 번호 (예: A10)
    private String status;    // 상태 (AVAILABLE, RESERVED, SELECTED)
}