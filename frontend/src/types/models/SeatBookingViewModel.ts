/* ===================================
models/SeatBookingViewModel에서는
SeatBooking에서 필요한 데이터 구조를 선언하고,
이후 mappers/seatMappers에서 mapping 해줍니다.
=================================== */

export interface SeatViewModel {
  id: number;
  row: string;
  number: number;
  label: string;       // "A1"
  status: "AVAILABLE" | "HELD" | "RESERVED";
  type: "NORMAL" | "DISABLED" | "COUPLE" | "ENTRANCE" | "EXIT" | "ETRANCE_EXIT_ALL";
  x: number;
  y: number;
  isRealSeat: boolean; // row !== "0"
  isEntrance: boolean,
  displayIcon: string,
  displayLabel: string
}

export interface ScreeningInfoViewModel {
  movie: {
    title: string;
    poster: string;
    ageRating: string;
  };
  theater: {
    name: string;
    screenName: string;
    screenType: string;
  };
  time: {
    start: string;
    end: string;
  };
}