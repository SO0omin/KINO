const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface MyPageSummary {
  memberId: number;
  memberName: string;
  availablePoints: number;
  availableCouponCount: number;
  paidReservationCount: number;
  reviewCount: number;
  likedMovieCount: number;
}

export interface MyReservationItem {
  reservationId: number;
  movieTitle: string;
  posterUrl?: string;
  theaterName: string;
  screenName: string;
  startTime: string;
  finalAmount: number;
  reservationStatus: string;
  paymentStatus: string;
  seatNames: string[];
  cancellable: boolean;
}

export interface CancelReservationResponse {
  reservationId: number;
  reservationStatus: string;
  paymentStatus: string;
  cancelledAt: string;
}

export async function getMyPageSummary(memberId: number): Promise<MyPageSummary> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/summary?memberId=${memberId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '마이페이지 요약 정보를 불러오지 못했습니다.');
  }
  return response.json();
}

export async function getMyReservations(memberId: number): Promise<MyReservationItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/reservations?memberId=${memberId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '예매 내역을 불러오지 못했습니다.');
  }
  return response.json();
}

export async function cancelReservation(
  memberId: number,
  reservationId: number,
  reason = '사용자 요청 취소'
): Promise<CancelReservationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/mypage/reservations/${reservationId}/cancel?memberId=${memberId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '환불 처리에 실패했습니다.');
  }
  return response.json();
}
