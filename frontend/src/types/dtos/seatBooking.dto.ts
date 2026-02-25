/* ===================================
   서버에서 넘어오는 래퍼(Wrapper) 응답 DTO
=================================== */
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
  status: "AVAILABLE" | "HELD" | "RESERVED";
  seatType: "NORMAL" | "DISABLED" | "COUPLE" | "ENTRANCE" | "EXIT" | "ENTRANCE_EXIT_ALL";
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