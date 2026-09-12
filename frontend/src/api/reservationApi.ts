import { api } from './api';
import type { PriceTypeCode } from '../types/dtos/seatBooking.dto';

/**
 * 예약 주체(회원/비회원)는 서버가 JWT에서 직접 꺼내 씁니다.
 * 요청 본문에 memberId/guestId를 담지 않습니다.
 */
interface HoldSeatPayload {
  screeningId: number;
  tickets: {
    seatId: number;
    priceType: PriceTypeCode;
  }[];
}

interface HoldSeatResponse {
  reservationId: number;
}

export const reservationApi = {
  holdSeats: async (payload: HoldSeatPayload): Promise<HoldSeatResponse> => {
    const response = await api.post('/api/reservations/hold', payload);
    return response.data;
  }
};
