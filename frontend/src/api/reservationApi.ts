import { api } from './api';

interface HoldSeatPayload {
  screeningId: number;
  memberId: number | null;
  guestId: number | null;
  tickets: {
    seatId: number;
    priceType: string;
  }[];
}

export const reservationApi = {
  holdSeats: async (payload: HoldSeatPayload) => {
    const response = await api.post('/api/reservations/hold', payload);
    return response.data;
  }
};