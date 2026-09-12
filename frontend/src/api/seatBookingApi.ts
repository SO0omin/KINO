/* ===================================
api를 분리할 때는 내부에서 실행되는 실질적인 
통신 로직만을 빼는 것을 원칙으로 하므로 이 로직을 
훅에 가져가서 사용하면 됩니다.
=================================== */

import type { SeatBookingResponseDto } from "../types/dtos/seatBooking.dto";
import { api } from './api';

export const seatBookingApi = {
  getScreeningSeats: async (screeningId: number): Promise<SeatBookingResponseDto> => {
    const response = await api.get(`/api/screenings/${screeningId}/seats`);
    return response.data;
  },
};