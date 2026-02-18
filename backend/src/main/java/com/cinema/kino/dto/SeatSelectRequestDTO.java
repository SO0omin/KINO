/* ========================
프론트 → 서버로 보내는 데이터
누가 좌석을 선택했는지 확인하는 입력용 Dto
======================== */
package com.cinema.kino.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class SeatSelectRequestDTO {

    private Long screeningId;
    private List<Long> seatIds;  // 다수의 좌석을 받기 위해서 list로 변경
    private Long memberId;   // 로그인
    private Long guestId;    // 비회원
}