import { api } from '../api';
import type {
  MyMembershipCardItem,
  RegisterMembershipCardRequest,
  RegisterMembershipCardResponse,
} from './types';

export async function getMyMembershipCards(memberId: number): Promise<MyMembershipCardItem[]> {
  try {
    const response = await api.get(`/api/mypage/cards?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '멤버십 카드 목록을 불러오지 못했습니다.');
  }
}

export async function registerMembershipCard(payload: RegisterMembershipCardRequest): Promise<RegisterMembershipCardResponse> {
  try {
    const response = await api.post(`/api/mypage/cards/register`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '멤버십 카드 등록에 실패했습니다.');
  }
}
