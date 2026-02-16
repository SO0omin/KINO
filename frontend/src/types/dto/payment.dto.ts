/**
 * 백엔드 PaymentDTO와 1:1로 맞춰 사용하는 타입 정의 파일입니다.
 *
 * 중요:
 * - 이 파일은 프론트와 백엔드 간 '계약서' 역할을 합니다.
 * - 필드명이나 타입이 변경되면 반드시 양쪽을 함께 수정해야 합니다.
 */

/**
 * 티켓 가격 타입
 *
 * DB enum과 동일해야 합니다.
 * (예: ADULT, YOUTH, SENIOR, SPECIAL)
 */
export type PriceType = 'ADULT' | 'YOUTH' | 'SENIOR' | 'SPECIAL';

/**
 * 티켓 요청 정보
 *
 * 좌석 선택 시, 어떤 좌석에 어떤 요금 타입을 적용했는지 서버로 전달합니다.
 */
export interface TicketRequest {
  seatId: number;
  priceType: PriceType;
}

/**
 * [1단계] 결제 준비 요청 (PrepareRequest)
 *
 * 결제 버튼 클릭 시 백엔드로 전달되는 데이터입니다.
 *
 * 핵심 원칙:
 * - totalPrice는 참고용이며, 최종 금액은 서버에서 재계산합니다.
 * - reservationId는 반드시 존재해야 합니다.
 */
export interface PrepareRequest {
  reservationId: number;  // 기존 예약 ID (필수)
  screeningId: number;

  tickets: TicketRequest[];

  memberId?: number | null;  // 회원 결제 시 사용
  guestId?: number | null;   // 비회원 결제 시 사용

  totalPrice: number;        // 프론트 계산 금액 (서버에서 재검증됨)

  memberCouponId?: number | null; // 쿠폰 미사용 시 null
  usedPoints?: number;            // 포인트 미사용 시 0 또는 undefined
}

/**
 * [1단계] 결제 준비 응답 (PrepareResponse)
 *
 * 서버가 금액 검증 및 좌석 선점(HELD) 후 반환하는 데이터입니다.
 *
 * 중요:
 * - calculatedPrice / finalAmount 값을 기준으로 Toss 결제를 진행해야 합니다.
 * - 프론트에서 계산한 금액을 그대로 사용하면 안 됩니다.
 */
export interface PrepareResponse {
  reservationId: number;

  orderId: string;        // Toss에 전달할 주문 ID
  orderName: string;      // Toss 결제창에 표시될 주문명

  calculatedPrice: number; // 결제창 표시 금액
  originalPrice: number;   // 할인 전 총 금액
  discountAmount: number;  // 쿠폰 할인 금액
  usedPoints: number;      // 실제 차감될 포인트
  finalAmount: number;     // 최종 결제 금액 (DB 기준)
}

/**
 * [2단계] 결제 승인 요청 (ConfirmRequest)
 *
 * Toss 결제 성공 후 success 페이지에서 서버로 전달합니다.
 *
 * 역할:
 * - paymentKey, orderId, amount를 서버로 전달하여
 *   최종 결제 확정을 요청합니다.
 */
export interface ConfirmRequest {
  paymentKey: string;  // Toss에서 발급한 고유 결제 키
  orderId: string;     // Prepare 단계에서 생성된 주문 ID
  amount: number;      // 실제 승인된 금액
}

/**
 * [2단계] 결제 승인 응답 (ConfirmResponse)
 *
 * 서버에서 결제가 최종 확정되면 반환됩니다.
 */
export interface ConfirmResponse {
  paymentId: number;   // 생성된 Payment PK
}

// ----------------------------------------------------
// 쿠폰/포인트 기능 확장을 위한 타입 정의
// ----------------------------------------------------

/**
 * 쿠폰 기본 정보
 *
 * discountType:
 * - FIXED: 정액 할인
 * - PERCENT: 퍼센트 할인
 */
export interface Coupon {
  id: number;
  name: string;

  discountType: 'FIXED' | 'PERCENT';
  discountValue: number;

  minPurchaseAmount?: number; // 최소 구매 금액 조건 (있을 경우)
}

/**
 * 회원이 보유한 쿠폰 정보
 *
 * isUsed:
 * - true이면 이미 사용 완료
 *
 * expiresAt:
 * - 만료일 (ISO 문자열)
 */
export interface MemberCoupon {
  id: number;
  coupon: Coupon;

  isUsed: boolean;
  expiresAt: string;
}
