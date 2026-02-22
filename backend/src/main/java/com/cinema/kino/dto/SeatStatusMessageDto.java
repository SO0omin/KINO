package com.cinema.kino.dto;

public class SeatStatusMessageDto {

    private Long screeningId;      // screening_seats.screening_id
    private Long seatId;           // screening_seats.seat_id

    private String seatRow;        // seats.seat_row
    private int seatNumber;        // seats.seat_number

    private String status;         // AVAILABLE | HELD | RESERVED
    private Long memberId;         // held_by_member_id
}