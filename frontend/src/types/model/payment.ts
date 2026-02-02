import type { PriceType } from '../dto/payment.dto';

export type DiscountTab = 'coupon' | 'point';

// 영화/극장 정보 (화면 표시용)
export interface BookingData {
  movieTitle: string;
  dateTime: string;
  theater: string;
  screenName?: string; // 예: "1관" (추가하면 좋음)
  ticketType: string;
  posterUrl?: string;
  screeningId: number; 
}

// 좌석 정보
export interface SeatInfo {
  seatId: number;
  seatNumber: string; // 예: "A1", "B5"
  priceType: PriceType;
  price: number;
}

// 결제 페이지 전체 상태 데이터
export interface PaymentData {
  // [중요] 예약 ID 추가 (이게 없으면 결제를 못함)
  reservationId: number; 

  // 금액 관련
  adultCount: number;
  adultPrice: number;
  totalAmount: number;    // 할인 전 총 금액
  discountAmount: number; // 총 할인 금액
  finalAmount: number;    // 최종 결제 금액 (total - discount)

  // [추가] 할인 적용 상태 (백엔드 전송용)
  memberCouponId?: number | null; // 적용한 쿠폰 ID
  usedPoints?: number;            // 사용한 포인트

  // 사용자/좌석 정보
  seats: SeatInfo[]; 
  memberId?: number | null;
  guestId?: number | null;
}