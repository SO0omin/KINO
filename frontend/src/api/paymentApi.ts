// src/api/paymentApi.ts

import type {
  PrepareRequest,
  PrepareResponse,
  ConfirmRequest,
  ConfirmResponse
} from '../types/dto/payment.dto';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const API_BASE_URL = 'http://localhost:8080';

/**
 * 결제 페이지 진입 시 필요한 예약 상세 응답 타입
 * NOTE: 백엔드 응답에 endTime이 없다면 optional로 두는 게 안전해요.
 */
export interface ReservationDetailResponse {
  reservationId: number;
  screeningId: number;

  movieTitle: string;
  posterUrl?: string;

  screenName: string;
  theaterName: string;

  startTime: string;
  endTime?: string; // ✅ optional

  totalAmount: number;
  seats: Array<{
    seatId: number;
    seatName: string;
  }>;

  memberId?: number | null;
  guestId?: number | null;
}

/**
 * [API 1] 예약 상세 정보 조회
 */
export async function getReservationDetail(
  reservationId: string | number
): Promise<ReservationDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/${reservationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      '예약 정보를 불러오는데 실패했습니다. (시간 초과되었거나 존재하지 않는 예약입니다)'
    );
  }

  return response.json();
}

/**
 * [API 2] 결제 준비(Prepare)
 */
export async function preparePayment(
  request: PrepareRequest
): Promise<PrepareResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(errorData.message || '결제 준비 중 오류가 발생했습니다.');
  }

  return response.json();
}

/**
 * [API 3] 결제 승인(Confirm)
 */
export async function confirmPayment(
  request: ConfirmRequest
): Promise<ConfirmResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(errorData.message || '최종 결제 승인에 실패했습니다. 고객센터에 문의해주세요.');
  }

  return response.json();
}

// -----------------------------------------------------------
// 확장: 쿠폰/포인트 기능 API (옵션 B: memberId를 프론트에서 전달)
// -----------------------------------------------------------

export interface MyCouponResponse {
  memberCouponId: number;
  couponName: string;
  discountType: string; // FIXED | RATE
  discountValue: number;
  minPrice: number;
  expiresAt: string;
}

/**
 * [API 4] 쿠폰 등록 (옵션 B)
 * POST /api/coupons/redeem
 */
export async function redeemCoupon(
  code: string,
  memberId: number
): Promise<MyCouponResponse> {
  const response = await fetch(`${API_BASE_URL}/api/coupons/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, memberId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(errorData.message || '쿠폰 등록 실패');
  }

  return response.json();
}

/**
 * [API 5] 내 쿠폰 목록 조회 (옵션 B)
 * GET /api/coupons/my?memberId=123
 */
export async function getMyCoupons(
  memberId: number
): Promise<MyCouponResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/coupons/my?memberId=${memberId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(errorData.message || '쿠폰 목록 조회 실패');
  }

  return response.json();
}

/**
 * [API 6] 내 보유 포인트 조회 (선택사항)
 * NOTE: 백엔드가 아직 없으면 나중에 맞춰요.
 */
export async function getMyPoints(memberId: number) {
  const response = await fetch(`${API_BASE_URL}/api/points?memberId=${memberId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) return 0;
  return response.json();
}
