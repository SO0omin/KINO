/* ===================================
api를 분리할 때는 내부에서 실행되는 실질적인 
통신 로직만을 빼는 것을 원칙으로 하므로 이 로직을 
훅에 가져가서 사용하면 됩니다.
=================================== */

import type { SeatStatusDto } from "../types/dtos/SeatStatusDto";

const BASE_URL = "http://localhost:8080/api";

export const seatBookingApi = {
  getScreeningSeats: async (screeningId: number): Promise<SeatStatusDto[]> => {
    const response = await fetch(`${BASE_URL}/screenings/${screeningId}/seats`);
    if (!response.ok) {
      throw new Error("좌석 데이터를 불러오는데 실패했습니다.");
    }
    return response.json();
  },
};