import { api } from '../api';
import type { MyPointHistoryItem, PointPasswordSmsVerifyResponse } from './types';

export async function getMyPointHistories(memberId: number, from: string, to: string): Promise<MyPointHistoryItem[]> {
  try {
    const query = new URLSearchParams({ memberId: String(memberId), from, to });
    const response = await api.get(`/api/mypage/points?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '포인트 이용내역을 불러오지 못했습니다.');
  }
}

export async function sendPointPasswordSms(memberId: number, phoneNumber: string) {
  try {
    const response = await api.post(`/api/mypage/point-password/sms/send`, { memberId, phoneNumber });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '인증번호 발송에 실패했습니다.');
  }
}

export async function verifyPointPasswordSms(memberId: number, phoneNumber: string, authCode: string): Promise<PointPasswordSmsVerifyResponse> {
  try {
    const response = await api.post(`/api/mypage/point-password/sms/verify`, { memberId, phoneNumber, authCode });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '휴대폰 인증 확인에 실패했습니다.');
  }
}

export async function updatePointPassword(memberId: number, verificationToken: string, newPassword: string, confirmPassword: string) {
  try {
    const response = await api.post(`/api/mypage/point-password`, { memberId, verificationToken, newPassword, confirmPassword });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '포인트 비밀번호 설정에 실패했습니다.');
  }
}
