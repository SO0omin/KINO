//API용 DTO는 백엔드 응답과 동일하게 만들어줌
export interface SeatStatusDto {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  status: "AVAILABLE" | "HELD" | "RESERVED";
  seatType: "NORMAL" | "DISABLED" | "COUPLE" | "ENTRANCE" | "EXIT" | "ETRANCE_EXIT_ALL";
  posX: number;
  posY: number;

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

  memberId?: number;
  guestId?: number;
}