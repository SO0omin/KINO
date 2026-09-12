import { api } from '../api';
import type {
  MyVoucherItem,
  RegisterVoucherRequest,
  RegisterVoucherResponse,
  VoucherStatus,
  VoucherType,
} from './types';

export async function getMyVouchers(
  memberId: number,
  voucherType: VoucherType,
  status?: VoucherStatus
): Promise<MyVoucherItem[]> {
  try {
    const query = new URLSearchParams({ memberId: String(memberId), voucherType });
    if (status) query.set('status', status);

    const response = await api.get(`/api/mypage/vouchers?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '관람권/교환권 목록을 불러오지 못했습니다.');
  }
}

export async function registerVoucher(payload: RegisterVoucherRequest): Promise<RegisterVoucherResponse> {
  try {
    const response = await api.post(`/api/mypage/vouchers/register`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '관람권/교환권 등록에 실패했습니다.');
  }
}
