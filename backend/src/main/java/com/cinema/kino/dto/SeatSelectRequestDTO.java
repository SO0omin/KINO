/* ========================
프론트 → 서버로 보내는 데이터
누가 좌석을 선택했는지 확인하는 입력용 Dto
======================== */
package com.cinema.kino.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SeatSelectRequestDTO {
    private Long screeningId;
    private Long memberId;
    private Long guestId;

    private List<TicketRequest> tickets; //좌석정보(좌석번호+가격타입)

    @Getter @Setter
    public static class TicketRequest {
        private Long seatId;
        private String priceType; // "ADULT", "YOUTH" 등
    }
}