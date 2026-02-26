import axios from 'axios';

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
  holdSeats: async (payload: HoldSeatPayload) => { // 👈 여기서 타입을 사용
    const response = await axios.post('/api/reservations/hold', payload);
    return response.data;
  }
};