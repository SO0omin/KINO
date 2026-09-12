import { api } from '../api';
import type {
  MemberPasswordUpdateRequest,
  MemberProfile,
  MemberProfileUpdateRequest,
  MyPageSummary,
} from './types';

export async function getMyPageSummary(memberId: number): Promise<MyPageSummary> {
  try {
    const response = await api.get(`/api/mypage/summary?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '마이페이지 요약 정보를 불러오지 못했습니다.');
  }
}

export async function getMemberProfile(memberId: number): Promise<MemberProfile> {
  try {
    const response = await api.get(`/api/mypage/profile?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '회원 정보를 불러오지 못했습니다.');
  }
}

export async function updateMemberProfile(payload: MemberProfileUpdateRequest) {
  try {
    const response = await api.put(`/api/mypage/profile`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '회원 정보 수정에 실패했습니다.');
  }
}

export async function deleteMember() {
  try {
    const response = await api.delete(`/api/mypage/profile/delete`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
  }
}

export async function updateMemberPassword(payload: MemberPasswordUpdateRequest) {
  try {
    const response = await api.post(`/api/mypage/profile/password`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
  }
}
