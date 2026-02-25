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
  sourceType: 'MEGABOX' | 'PARTNER' | string;
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

export interface PointPasswordSmsVerifyResponse {
  verificationToken: string;
  message: string;
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

export async function getMyVouchers(
  memberId: number,
  voucherType: VoucherType,
  status?: VoucherStatus
): Promise<MyVoucherItem[]> {
  const query = new URLSearchParams({
    memberId: String(memberId),
    voucherType,
  });
  if (status) query.set('status', status);

  const response = await fetch(`${API_BASE_URL}/api/mypage/vouchers?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '관람권/교환권 목록을 불러오지 못했습니다.');
  }
  return response.json();
}

export async function registerVoucher(
  payload: RegisterVoucherRequest
): Promise<RegisterVoucherResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/vouchers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '관람권/교환권 등록에 실패했습니다.');
  }
  return response.json();
}

export async function getMyCoupons(memberId: number): Promise<MyCouponItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/coupons/my?memberId=${memberId}&includeAll=true`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '쿠폰 목록을 불러오지 못했습니다.');
  }
  return response.json();
}

export async function redeemCoupon(memberId: number, code: string) {
  const response = await fetch(`${API_BASE_URL}/api/coupons/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '쿠폰 등록에 실패했습니다.');
  }
  return response.json();
}

export async function getMyMembershipCards(memberId: number): Promise<MyMembershipCardItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/cards?memberId=${memberId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '멤버십 카드 목록을 불러오지 못했습니다.');
  }
  return response.json();
}

export async function registerMembershipCard(
  payload: RegisterMembershipCardRequest
): Promise<RegisterMembershipCardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/cards/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '멤버십 카드 등록에 실패했습니다.');
  }
  return response.json();
}

export async function getMyPointHistories(
  memberId: number,
  from: string,
  to: string
): Promise<MyPointHistoryItem[]> {
  const query = new URLSearchParams({
    memberId: String(memberId),
    from,
    to,
  });

  const response = await fetch(`${API_BASE_URL}/api/mypage/points?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '포인트 이용내역을 불러오지 못했습니다.');
  }
  return response.json();
}

export async function sendPointPasswordSms(memberId: number, phoneNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/mypage/point-password/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, phoneNumber }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '인증번호 발송에 실패했습니다.');
  }
  return response.json();
}

export async function verifyPointPasswordSms(
  memberId: number,
  phoneNumber: string,
  authCode: string
): Promise<PointPasswordSmsVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mypage/point-password/sms/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, phoneNumber, authCode }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '휴대폰 인증 확인에 실패했습니다.');
  }
  return response.json();
}

export async function updatePointPassword(
  memberId: number,
  verificationToken: string,
  newPassword: string,
  confirmPassword: string
) {
  const response = await fetch(`${API_BASE_URL}/api/mypage/point-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, verificationToken, newPassword, confirmPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(error.message || '포인트 비밀번호 설정에 실패했습니다.');
  }
  return response.json();
}
