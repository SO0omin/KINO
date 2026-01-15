/* ========================
프론트 → 서버로 보내는 데이터
누가 좌석을 선택했는지 확인하는 입력용 Dto
======================== */
package com.cinema.kino.dto;

import lombok.Getter;

@Getter
public class SeatSelectRequestDto {

    private Long screeningId;
    private Long seatId;
    private Long memberId;   // 로그인
    private Long guestId;    // 비회원
}