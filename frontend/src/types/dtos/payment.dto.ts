

export type PriceType = 'ADULT' | 'YOUTH' | 'SENIOR' | 'SPECIAL';

export interface TicketRequest {
  seatId: number;
  priceType: PriceType;
}

export interface PrepareRequest {
  reservationId: number;
  screeningId: number;
  tickets: TicketRequest[];

  memberId?: number | null;
  guestId?: number | null;

  totalPrice?: number | null;

  memberCouponId?: number | null;
  usedPoints?: number | null;
}

export interface PrepareResponse {
  reservationId: number;
  orderId: string;
  orderName: string;

  calculatedPrice: number;
  originalPrice: number;
  discountAmount: number;
  usedPoints: number;
  finalAmount: number;
}

export interface ConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ConfirmResponse {
  paymentId: number;
  reservationNumber: string;
}

export interface ReservationDetailResponse {
  reservationId: number;
  screeningId: number;

  memberId?: number | null;
  guestId?: number | null;

  movieTitle: string;
  posterUrl?: string;

  theaterName: string;
  screenName: string;

  startTime: string;
  endTime?: string;

  totalAmount: number;
  status: string;

  seats: Array<{
    seatId: number;
    seatName: string;
    priceType?: PriceType; 
  }>;
}
