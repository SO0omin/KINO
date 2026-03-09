import { api } from './api';

import type {
  PrepareRequest,
  PrepareResponse,
  ConfirmRequest,
  ConfirmResponse,
  ReservationDetailResponse
} from '../types/dtos/payment.dto';

// 💡 API_BASE_URL은 api.ts에 이미 있으니 지워도 됩니다!

export async function getReservationDetail(
  reservationId: string | number
): Promise<ReservationDetailResponse> {
  try {
    // ✨ fetch 대신 api.get 사용!
    const response = await api.get(`/api/payments/${reservationId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || '예약 정보를 불러오는데 실패했습니다. (시간 초과되었거나 존재하지 않는 예약입니다)'
    );
  }
}

export async function preparePayment(
  request: PrepareRequest
): Promise<PrepareResponse> {
  try {
    // ✨ fetch 대신 api.post 사용 + JSON.stringify 생략 가능!
    const response = await api.post(`/api/payments/prepare`, request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '결제 준비 중 오류가 발생했습니다.');
  }
}

export async function confirmPayment(
  request: ConfirmRequest
): Promise<ConfirmResponse> {
  try {
    const response = await api.post(`/api/payments/confirm`, request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '최종 결제 승인에 실패했습니다. 고객센터에 문의해주세요.');
  }
}

export interface MyCouponResponse {
  memberCouponId: number;
  couponCode: string;
  couponName: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
  expiresAt: string;
  couponKind?: string;
  sourceType?: string;
  downloadable?: boolean;
  status?: string;
}

export async function redeemCoupon(
  code: string,
  memberId: number
): Promise<MyCouponResponse> {
  try {
    const response = await api.post(`/api/coupons/redeem`, { code, memberId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '쿠폰 등록 실패');
  }
}

export async function getMyCoupons(
  memberId: number
): Promise<MyCouponResponse[]> {
  try {
    const response = await api.get(`/api/coupons/my?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '쿠폰 목록 조회 실패');
  }
}

export async function getMyPoints(memberId: number) {
  try {
    const response = await api.get(`/api/mypage/summary?memberId=${memberId}`);
    return Number(response.data?.availablePoints ?? 0);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '포인트 조회 실패');
  }
}
