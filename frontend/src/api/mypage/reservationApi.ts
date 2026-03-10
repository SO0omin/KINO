import { api } from '../api';
import type { CancelReservationResponse, MyReservationItem } from './types';

export async function getMyReservations(params: { memberId?: number; guestId?: number }): Promise<MyReservationItem[]> {
  try {
    const query = new URLSearchParams();
    if (params.memberId && params.memberId > 0) query.set('memberId', String(params.memberId));
    if (params.guestId && params.guestId > 0) query.set('guestId', String(params.guestId));
    const response = await api.get(`/api/mypage/reservations?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '예매 내역을 불러오지 못했습니다.');
  }
}

export async function cancelReservation(
  params: { memberId?: number; guestId?: number },
  reservationId: number,
  reason = '사용자 요청 취소'
): Promise<CancelReservationResponse> {
  try {
    const query = new URLSearchParams();
    if (params.memberId && params.memberId > 0) query.set('memberId', String(params.memberId));
    if (params.guestId && params.guestId > 0) query.set('guestId', String(params.guestId));
    const response = await api.post(`/api/mypage/reservations/${reservationId}/cancel?${query.toString()}`, { reason });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '환불 처리에 실패했습니다.');
  }
}
