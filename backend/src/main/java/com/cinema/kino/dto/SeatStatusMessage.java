/* ========================
좌석 상태 실시간 브로드캐스트 payload
구독 채널: /topic/seats/{screeningId}
======================== */
package com.cinema.kino.dto;

import com.cinema.kino.entity.enums.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SeatStatusMessage {

    private Long seatId;
    private SeatStatus status;

    public static SeatStatusMessage of(Long seatId, SeatStatus status) {
        return new SeatStatusMessage(seatId, status);
    }
}
