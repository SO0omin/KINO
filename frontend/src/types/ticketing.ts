// 1. 지역 정보
export interface Region {
    id: number;
    name: string;
}

// 2. 영화관 정보
export interface Theater {
    id: number;
    name: string;
    regionId: number;
    address: string;
}

// 3. 영화 정보
export interface Movie {
    id: number;
    title: string;
    ageRating: string;
    durationMin: number;
}

// 4. 상영 시간표 정보 (ScreeningDTO와 매칭)
export interface Screening {
    id: number;
    theaterName: string;
    ageRating: string;
    screenName: string;
    movieTitle: string;
    screenType: string;
    startTime: string;
    endTime: string;
    availableSeats: number;
    totalSeats: number;
}

export interface Seat {
  id: number;
  seatRow: string;
  seatNumber: number;
  status: string;
  type: string;
  posX: number;
  posY: number;
}