// src/api/paymentApi.ts

import type {
  PrepareRequest,
  PrepareResponse,
  ConfirmRequest,
  ConfirmResponse
} from '../types/dto/payment.dto';

/**
 * API Base URL 입니다.
 *
 * 권장:
 * - 로컬: http://localhost:8080
 * - 배포: 환경변수(Vite 기준 import.meta.env)로 주입
 *
 * NOTE:
 * - 지금은 하드코딩되어 있어요.
 * - 팀 프로젝트에서는 .env(.env.development / .env.production)로 분리하면
 *   프론트 배포/서버 주소 변경 시 코드 수정이 필요 없어서 유지보수에 유리해요요.
 */
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const API_BASE_URL = 'http://localhost:8080';

/**
 * 결제 페이지 진입 시 필요한 예약 상세 응답 타입이에요요.
 *
 * 서버 응답과의 일치가 중요해요:
 * - 필드가 하나라도 어긋나면 런타임에서 undefined 문제가 터지기 쉬워요요.
 *
 * NOTE:
 * - 백엔드 PaymentDTO.ReservationDetailResponse와 맞춰 관리하는 게 좋아요요.
 * - endTime이 백엔드 응답에 없다면, 프론트에서 계산하거나 타입에서 제거해야 해요요.
 */
export interface ReservationDetailResponse {
  reservationId: number;
  screeningId: number;

  movieTitle: string;
  posterUrl?: string;

  screenName: string;  // 예: "1관"
  theaterName: string; // 예: "강남점"

  startTime: string;   // 상영 시작 시간 (서버 제공)
  endTime: string;     // 상영 종료 시간 (서버 제공 or 프론트 계산 필요)

  totalAmount: number; // 결제 화면 표시용 금액(예약 기준)
  seats: Array<{
    seatId: number;
    seatName: string;  // 예: "H4", "H5"
  }>;

  memberId?: number | null;
  guestId?: number | null;
}

/**
 * [API 1] 예약 상세 정보 조회
 *
 * 호출 시점:
 * - 결제/예약 상세 페이지 진입 시 1회 호출해서 화면 구성에 사용해요요.
 *
 * 실패 가능성(대표):
 * - reservationId가 잘못됐거나 만료/취소된 예약이에요요.
 * - 서버 장애/네트워크 문제예요요.
 *
 * @param reservationId 예약 ID (라우트 파라미터로 string이 들어올 수 있어요요)
 */
export async function getReservationDetail(
  reservationId: string | number
): Promise<ReservationDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/${reservationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  // response.ok === false 인 경우:
  // - 4xx(잘못된 요청/권한/만료) 또는 5xx(서버 오류)이므로
  //   UI 레벨에서 에러 메시지/리다이렉트 등을 처리할 수 있게 예외로 올려요요.
  if (!response.ok) {
    throw new Error('예약 정보를 불러오는데 실패했습니다. (시간 초과되었거나 존재하지 않는 예약입니다)');
  }

  // JSON 파싱 실패도 예외가 날 수 있어요(응답이 HTML/빈 바디 등).
  return response.json();
}

/**
 * [API 2] 결제 준비(Prepare)
 *
 * 목적:
 * - 프론트가 만든 주문 데이터를 서버에 전달하고,
 * - 서버가 "금액/쿠폰/포인트/좌석 선점(HELD)" 등을 검증한 뒤
 * - PG(토스) 결제창 호출에 필요한 orderId/금액을 내려줘요요.
 *
 * 중요:
 * - 금액은 서버 계산이 최종이에요요(프론트 totalPrice는 참고값).
 * - PrepareResponse의 calculatedPrice/finalAmount를 결제창 금액으로 사용해야 안전해요요.
 *
 * @param request PrepareRequest (예약ID, 좌석/요금, 쿠폰/포인트 등)
 */
export async function preparePayment(
  request: PrepareRequest
): Promise<PrepareResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  // 서버가 에러 바디를 JSON으로 내려준다는 전제예요.
  // 내려주지 않는 경우도 있으니 catch로 빈 객체 처리해요요.
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(errorData.message || '결제 준비 중 오류가 발생했습니다.');
  }

  return response.json();
}

/**
 * [API 3] 결제 승인(Confirm)
 *
 * 호출 시점:
 * - 토스 결제창에서 결제가 성공한 뒤(프론트 콜백),
 *   paymentKey/orderId/amount를 서버로 전달해서 "최종 확정"해요요.
 *
 * 서버에서 하는 일(요약):
 * - orderId(merchantUid) 기준 Payment 레코드 락/멱등성 체크
 * - amount 검증(금액 위변조 방지)
 * - 토스 S2S 승인 호출
 * - 예약/좌석/쿠폰/포인트 DB 확정 처리
 *
 * @param request ConfirmRequest (paymentKey, orderId, amount)
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

    // 사용자에게는 가능한 한 "행동 가능한 메시지"가 좋아요요.
    // (예: 금액 불일치/좌석 만료/쿠폰 오류 등 서버가 내려주는 메시지를 우선 사용해요요.)
    throw new Error(errorData.message || '최종 결제 승인에 실패했습니다. 고객센터에 문의해주세요.');
  }

  return response.json();
}

// -----------------------------------------------------------
// 확장: 쿠폰/포인트 기능 API (현재는 선택사항)
// -----------------------------------------------------------

/**
 * [API 4] 내 쿠폰 목록 조회 (선택사항)
 *
 * NOTE:
 * - 실패 시 빈 배열을 반환하고 있어요요(UX 관점에선 "쿠폰 없음"처럼 보일 수 있어요).
 * - 운영에서는 오류를 조용히 삼키지 말고, 로깅/토스트 정도는 띄우는 편이 좋아요요.
 */
export async function getMyCoupons(memberId: number) {
  const response = await fetch(`${API_BASE_URL}/api/coupons?memberId=${memberId}`);
  if (!response.ok) return []; // 에러면 쿠폰 없는 것으로 처리(선택 정책)
  return response.json();
}

/**
 * [API 5] 내 보유 포인트 조회 (선택사항)
 *
 * NOTE:
 * - 실패 시 0을 반환해요요(UX 상 "포인트 없음"처럼 보일 수 있어요).
 * - 반환 타입이 number인지, { point: number }인지 서버 스펙과 맞춰야 해요요.
 */
export async function getMyPoints(memberId: number) {
  const response = await fetch(`${API_BASE_URL}/api/points?memberId=${memberId}`);
  if (!response.ok) return 0; // 에러면 0으로 처리(선택 정책)
  return response.json();
}
