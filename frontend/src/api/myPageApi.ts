import { api } from './api';

export interface MyPageSummary {
  memberId: number;
  memberName: string;
  profileImage?: string;
  availablePoints: number;
  pendingPoints: number;
  expiringPointsThisMonth: number;
  vipTicketPoints: number;
  vipStorePoints: number;
  vipEventPoints: number;
  pointTier: string;
  nextPointTier?: string | null;
  pointsToNextTier: number;
  availableCouponCount: number;
  paidReservationCount: number;
  reviewCount: number;
  likedMovieCount: number;
}

export interface MemberProfile {
  memberId: number;
  username: string;
  name: string;
  tel?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
  hasPointPassword: boolean;
  socialKakaoLinked: boolean;
  socialGoogleLinked: boolean;
  socialNaverLinked: boolean;
}

export interface MemberProfileUpdateRequest {
  memberId: number;
  name: string;
  tel?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
  pointPasswordUsing: boolean;
}

export interface MemberPasswordUpdateRequest {
  memberId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  reservationNumber: string;
  paymentStatus: string; // "PENDING", "PAID", "CANCELED" 등
  seatNames: string[];
  cancellable: boolean;
  paidAt?: string;
  cancelledAt?: string;
  holdExpiresAt?: string; // "2026-03-08T14:30:00" 형태의 ISO 문자열
}

export interface CancelReservationResponse {
  reservationId: number;
  reservationStatus: string;
  paymentStatus: string;
  cancelledAt: string;
}

export type VoucherType = 'MOVIE' | 'STORE';
export type VoucherStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface MyVoucherItem {
  voucherId: number;
  voucherType: VoucherType;
  status: VoucherStatus;
  code: string;
  name: string;
  validFrom?: string;
  validUntil?: string;
  registeredAt?: string;
}

export interface RegisterVoucherRequest {
  memberId: number;
  voucherType: VoucherType;
  code: string;
}

export interface RegisterVoucherResponse {
  voucherId: number;
  voucherType: VoucherType;
  status: VoucherStatus;
  code: string;
  name: string;
  registeredAt: string;
  message: string;
}

export interface MyCouponItem {
  memberCouponId: number;
  couponCode: string;
  couponName: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
  expiresAt: string;
  issuedAt?: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | string;
  couponKind: string;
  sourceType: 'KINO' | 'PARTNER' | string;
  downloadable?: boolean;
}

export interface DownloadAllCouponsResponse {
  downloadedCount: number;
  skippedCount: number;
  totalRequestedCount: number;
  pointAppliedCount?: number;
}

export interface DownloadableCouponItem {
  couponId: number;
  couponCode: string;
  couponName: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
  couponKind: string;
  sourceType: 'KINO' | 'PARTNER' | string;
  validDays: number;
  alreadyOwned: boolean;
}

export interface DownloadableCouponsResponse {
  totalCount: number;
  coupons: DownloadableCouponItem[];
}

export interface DownloadSelectedCouponsResponse {
  downloadedCount: number;
  skippedCount: number;
  totalRequestedCount: number;
  pointAppliedCount: number;
}

export interface MyMembershipCardItem {
  cardId: number;
  channelName: string;
  cardNumber: string;
  cardName: string;
  issuerName: string;
  issuedDate: string;
}

export interface RegisterMembershipCardRequest {
  memberId: number;
  cardNumber: string;
  cvc: string;
}

export interface RegisterMembershipCardResponse {
  cardId: number;
  cardNumber: string;
  cardName: string;
  issuerName: string;
  issuedDate: string;
  message: string;
}

export interface MyPointHistoryItem {
  pointId: number;
  createdAt: string;
  typeLabel: string;
  content: string;
  branchName: string;
  point: number;
}

export interface MyWishMovieItem {
  movieId: number;
  title: string;
  posterUrl?: string;
}

export interface PointPasswordSmsVerifyResponse {
  verificationToken: string;
  message: string;
}

export interface MyReviewItem {
  id: number;
  movieTitle: string;
  content: string;
  createdAt: string;
}


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

export async function deleteMember() { // 💡 ID를 인자로 받을 필요 없음 (토큰 사용)
  try {
    // 💡 .delete 메서드 사용 & 경로 오타 수정
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

export async function toggleMovieLike(movieId: number, memberId: number): Promise<boolean> {
  try {
    const response = await api.post(`/api/movies/${movieId}/likes`, { memberId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '찜 처리에 실패했습니다.');
  }
}

export async function removeMovieLike(movieId: number, memberId: number) {
  try {
    const response = await api.delete(`/api/movies/${movieId}/likes?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '찜 취소에 실패했습니다.');
  }
}

export async function getMyWishMovies(memberId: number): Promise<MyWishMovieItem[]> {
  try {
    const response = await api.get(`/api/movies/likes?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '보고싶어 목록을 불러오지 못했습니다.');
  }
}

export async function getMyReviews(memberId: number): Promise<MyReviewItem[]> {
  try {
    const response = await api.get(`/api/mypage/reviews?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '리뷰 목록을 불러오지 못했습니다.');
  }
}

export const linkSocialAccountApi = async (provider: string, code: string) => {
  const response = await api.post('/api/mypage/social/link', {
    provider,
    code,
  });
  return response.data;
};

// 소셜 해제 API
export const unlinkSocialAccountApi = async (provider: string) => {
  // provider를 쿼리 파라미터로 보냄
  const response = await api.delete(`/api/mypage/social/unlink?provider=${provider}`);
  return response.data;
};
