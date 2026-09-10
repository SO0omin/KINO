/* ========================
좌석 선점 요청 DTO
예약 주체(회원/비회원)는 JWT에서 추출하므로 요청 본문에 담지 않습니다.
======================== */
package com.cinema.kino.dto;

import com.cinema.kino.entity.enums.PriceType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class SeatSelectRequestDTO {

    private Long screeningId;
    private List<TicketRequest> tickets;

    @Getter @Setter
    public static class TicketRequest {
        private Long seatId;
        private PriceType priceType;
    }
}
