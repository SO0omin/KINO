import { api } from '../api';
import type {
  DownloadableCouponsResponse,
  DownloadAllCouponsResponse,
  DownloadSelectedCouponsResponse,
  MyCouponItem,
} from './types';

export async function getMyCoupons(memberId: number): Promise<MyCouponItem[]> {
  try {
    const response = await api.get(`/api/coupons/my?memberId=${memberId}&includeAll=true`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '쿠폰 목록을 불러오지 못했습니다.');
  }
}

export async function redeemCoupon(memberId: number, code: string) {
  try {
    const response = await api.post(`/api/coupons/redeem`, { memberId, code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '쿠폰 등록에 실패했습니다.');
  }
}

export async function downloadAllCoupons(
  memberId: number,
  sourceType: 'KINO' | 'PARTNER' | 'ALL'
): Promise<DownloadAllCouponsResponse> {
  try {
    const response = await api.post(`/api/coupons/download-all`, { memberId, sourceType });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '쿠폰 전체 다운로드에 실패했습니다.');
  }
}

export async function getDownloadableCoupons(
  memberId: number,
  sourceType: 'KINO' | 'PARTNER' | 'ALL'
): Promise<DownloadableCouponsResponse> {
  try {
    const response = await api.get(`/api/coupons/downloadables`, {
      params: { memberId, sourceType },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '다운로드 가능 쿠폰 조회에 실패했습니다.');
  }
}

export async function downloadSelectedCoupons(
  memberId: number,
  sourceType: 'KINO' | 'PARTNER' | 'ALL',
  couponIds: number[]
): Promise<DownloadSelectedCouponsResponse> {
  try {
    const response = await api.post(`/api/coupons/download-selected`, {
      memberId,
      sourceType,
      couponIds,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '선택 쿠폰 다운로드에 실패했습니다.');
  }
}
