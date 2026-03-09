import type { PriceType } from '../dtos/payment.dto';

/**
 * 할인 탭 종류
 *
 * - coupon: 쿠폰 할인
 * - point: 포인트 사용
 *
 * 결제 페이지에서 어떤 할인 UI를 보여줄지 구분하는 용도입니다.
 */
export type DiscountTab = 'coupon' | 'point';

/**
 * 결제 페이지 상단에 표시할 영화/상영 정보
 *
 * 순수 UI 표시용 데이터입니다.
 * 서버에 그대로 전송되는 데이터는 아닙니다.
 */
export interface BookingData {
  movieTitle: string;
  dateTime: string;
  theater: string;
  screenName?: string; // 예: "1관"
  ticketType: string;
  posterUrl?: string;

  /**
   * 결제 준비(Prepare) 요청 시 필요합니다.
   * 상영 스케줄 ID는 백엔드에서 가격 정책 조회에 사용됩니다.
   */
  screeningId: number;
}

/**
 * 선택된 좌석 정보
 *
 * priceType은 백엔드에서 요금 정책을 조회할 때 사용됩니다.
 * price는 UI 표시용이며, 최종 금액은 서버에서 재계산합니다.
 */
export interface SeatInfo {
  seatId: number;

  /**
   * 화면에 표시할 좌석 번호
   * 예: "A1", "B5"
   */
  seatNumber: string;

  /**
   * 요금 타입 (ADULT, YOUTH 등)
   */
  priceType: PriceType;

  /**
   * 프론트 계산 금액 (표시용)
   * 실제 결제 금액은 서버가 확정합니다.
   */
  price: number;
}

/**
 * 결제 페이지 전체 상태 모델
 *
 * 특징:
 * - UI 계산 값과 서버 전송 값이 함께 포함됩니다.
 * - 결제 버튼 클릭 시 PrepareRequest로 변환되어 전송됩니다.
 */
export interface PaymentData {

  /**
   * 결제에 필수인 예약 ID
   * 이 값이 없으면 결제 요청을 보낼 수 없습니다.
   */
  reservationId: number;

  // ------------------------
  // 금액 관련 상태
  // ------------------------

  /**
   * 성인 인원 수
   */
  adultCount: number;
  youthCount: number;
  seniorCount: number;
  specialCount: number;
  

  /**
   * 성인 1인 가격 (UI 표시용)
   */
  adultPrice: number;
  youthPrice: number;
  seniorPrice: number;
  speciaPrice: number;

  /**
   * 할인 전 총 금액 (UI 계산값)
   */
  totalAmount: number;

  /**
   * 총 할인 금액 (쿠폰 + 포인트)
   */
  discountAmount: number;

  /**
   * 최종 결제 금액 (totalAmount - discountAmount)
   *
   * 중요:
   * - 이 값은 UI 기준 계산값입니다.
   * - 실제 결제 금액은 prepare API 응답(finalAmount)을 사용해야 합니다.
   */
  finalAmount: number;

  // ------------------------
  // 할인 적용 상태 (서버 전송용)
  // ------------------------

  /**
   * 적용한 쿠폰 ID
   * - 미사용 시 null
   */
  memberCouponId?: number | null;

  /**
   * 사용한 포인트
   * - 미사용 시 0 또는 undefined
   */
  usedPoints?: number;

  // ------------------------
  // 사용자 / 좌석 정보
  // ------------------------

  /**
   * 선택한 좌석 목록
   */
  seats: SeatInfo[];

  /**
   * 회원 결제 시 사용
   */
  memberId?: number | null;

  /**
   * 비회원 결제 시 사용
   */
  guestId?: number | null;
}
