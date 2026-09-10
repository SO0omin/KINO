/* ===================================
   서버에서 넘어오는 래퍼(Wrapper) 응답 DTO
=================================== */
export type SeatStatus = "AVAILABLE" | "HELD" | "RESERVED";

export type SeatTypeDto =
  | "NORMAL" | "DISABLED" | "COUPLE"
  | "ENTRANCE" | "EXIT" | "ENTRANCE_EXIT_ALL";

export interface ScreeningInfoDto {
  theaterId: number;
  theaterName: string;
  screeningId: number;
  screenName: string;
  screenType: string;
  movieId: number;
  movieTitle: string;
  ageRating: string;
  posterUrl: string;
  startTime: string;
  endTime: string;
  priceAdult: number;
  priceYouth: number;
  priceSenior: number;
  priceSpecial: number;
}

export interface SeatInfoDto {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  status: SeatStatus;
  seatType: SeatTypeDto;
  posX: number;
  posY: number;
  memberId?: number;
  guestId?: number;
}

// 💡 새롭게 추가될 최상위 응답 객체
export interface SeatBookingResponseDto {
  screeningInfo: ScreeningInfoDto;
  seats: SeatInfoDto[];
}

/* ===================================
   WebSocket 좌석 상태 브로드캐스트 payload
   채널: /topic/seats/{screeningId}
   좌석 전체가 아니라 "변경된 좌석"만 내려옵니다.
=================================== */
export interface SeatStatusMessage {
  seatId: number;
  status: SeatStatus;
}

export type PriceTypeCode = "ADULT" | "YOUTH" | "SENIOR" | "SPECIAL";
