// src/api/paymentApi.ts

import type {
  PrepareRequest,
  PrepareResponse,
  ConfirmRequest,
  ConfirmResponse
} from '../types/dto/payment.dto';

// [개선 1] 하드코딩 대신 환경변수 사용 (배포 시 유리)
// 로컬 개발일 때는 8080을 쓰고, 나중에 서버 배포하면 그 주소를 자동으로 씁니다.
const API_BASE_URL = 'http://localhost:8080';

/**
 * [API 1] 예약 상세 정보 조회 (페이지 진입 시 실행)
 * 목적: "내가 지금 뭘 결제하려고 하는 거지?"에 대한 정보를 서버에서 가져옵니다.
 */
export interface ReservationDetailResponse {
  reservationId: number;
  screeningId: number;
  movieTitle: string;
  posterUrl?: string;
  screenName: string; // 예: 1관
  theaterName: string; // 예: 강남점
  startTime: string; // 상영 시작 시간
  endTime: string;   // 상영 종료 시간
  totalAmount: number; // 할인 전 총 금액
  seats: Array<{
    seatId: number;
    seatName: string; // 예: H4, H5
  }>;
  memberId?: number | null;
  guestId?: number | null;
}

export async function getReservationDetail(
  reservationId: string | number
): Promise<ReservationDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/${reservationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('예약 정보를 불러오는데 실패했습니다. (시간 초과되었거나 존재하지 않는 예약입니다)');
  }
  return response.json();
}


/**
 * [API 2] 결제 준비 (결제 버튼 클릭 시 실행)
 * 목적: 백엔드에 "나 이 주문(OrderId)으로 결제 시작할게"라고 알리고 검증받습니다.
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '결제 준비 중 오류가 발생했습니다.');
  }
  return response.json();
}


/**
 * [API 3] 결제 승인 (토스창에서 성공 후 실행)
 * 목적: 토스에서 받은 키(paymentKey)를 백엔드에 넘겨서 "진짜 돈 가져가세요"라고 확정합니다.
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
    const errorData = await response.json().catch(() => ({}));
    // 사용자에게 보여줄 에러 메시지를 더 명확하게 처리
    throw new Error(errorData.message || '최종 결제 승인에 실패했습니다. 고객센터에 문의해주세요.');
  }
  return response.json();
}

// -----------------------------------------------------------
// [추가 제안] 향후 쿠폰/포인트 기능을 위해 미리 만들어두면 좋은 함수들
// -----------------------------------------------------------

/**
 * [API 4] 내 쿠폰 목록 조회 (선택사항)
 */
export async function getMyCoupons(memberId: number) {
  const response = await fetch(`${API_BASE_URL}/api/coupons?memberId=${memberId}`);
  if (!response.ok) return []; // 에러나면 빈 배열 반환
  return response.json();
}

/**
 * [API 5] 내 보유 포인트 조회 (선택사항)
 */
export async function getMyPoints(memberId: number) {
  const response = await fetch(`${API_BASE_URL}/api/points?memberId=${memberId}`);
  if (!response.ok) return 0; // 에러나면 0원 반환
  return response.json(); // { point: 3000 }
}