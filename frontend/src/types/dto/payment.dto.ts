/**
 * 백엔드 PaymentDTO와 동일한 타입 정의
 */

// 가격 타입 (DB schema: ADULT, YOUTH, SENIOR, SPECIAL)
export type PriceType = 'ADULT' | 'YOUTH' | 'SENIOR' | 'SPECIAL';

// 티켓 요청 (좌석 + 가격 타입)
export interface TicketRequest {
  seatId: number;
  priceType: PriceType;
}

// [1단계] 결제 준비 요청
// 좌석 선택 후 '결제하기' 눌렀을 때 백엔드로 보낼 데이터
export interface PrepareRequest {
  reservationId: number;  // [중요] 기존 예약 ID는 필수입니다!
  screeningId: number;
  tickets: TicketRequest[];
  memberId?: number | null;
  guestId?: number | null;
  totalPrice: number;
  memberCouponId?: number | null; // 쿠폰을 안 썼으면 null
  usedPoints?: number;            // 포인트를 안 썼으면 0 또는 undefined
}

// [1단계] 결제 준비 응답
// 백엔드가 "주문서 만들었습니다"라고 응답 주는 데이터
export interface PrepareResponse {
  reservationId: number;
  orderId: string;        // 토스에 보낼 주문 ID
  orderName: string;      // 토스에 보낼 주문명 (예: 범죄도시4 외 1건)
  calculatedPrice: number; // 토스 결제창에 띄울 최종 금액
  originalPrice: number;
  discountAmount: number;
  usedPoints: number;
  finalAmount: number;
}

// [2단계] 결제 승인 요청 (토스 인증 후)
// 토스 팝업에서 결제 성공하면 받아오는 키를 백엔드에 전달
export interface ConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// [2단계] 결제 승인 응답
export interface ConfirmResponse {
  paymentId: number;
}

// ----------------------------------------------------
// [추가] 쿠폰/포인트 기능 대비용 타입
// ----------------------------------------------------

// 쿠폰 상세 정보
export interface Coupon {
  id: number;
  name: string;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number;
  minPurchaseAmount?: number;
}

// 내 보유 쿠폰 정보
export interface MemberCoupon {
  id: number;
  coupon: Coupon;
  isUsed: boolean;
  expiresAt: string;
}