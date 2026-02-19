import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { BookingInfo } from '../../components/payment/BookingInfo';
import { DiscountSection } from '../../components/payment/DiscountSection';
import { PaymentMethodSection } from '../../components/payment/PaymentMethodSection';
import { PaymentSummary } from '../../components/payment/PaymentSummary';
import { usePayment } from '../../hooks/usePayment';
import type { DiscountTab, BookingData, PaymentData } from '../../types/model/payment';

import {
  preparePayment,
  getMyCoupons,
  redeemCoupon,
  type MyCouponResponse,
} from '../../api/paymentApi';

import type { PriceType, TicketRequest } from '../../types/dto/payment.dto';

function normalizePriceType(pt?: PriceType): PriceType {
  return pt ?? 'ADULT';
}

function buildTicketsFromReservationDetail(detail: any): TicketRequest[] {
  return (detail.seats ?? []).map((seat: any) => ({
    seatId: seat.seatId,
    priceType: normalizePriceType(seat.priceType),
  }));
}

function buildTicketTypeText(seats: Array<{ priceType?: PriceType }>): string {
  const counts: Record<PriceType, number> = { ADULT: 0, YOUTH: 0, SENIOR: 0, SPECIAL: 0 };

  for (const s of seats) {
    const pt = normalizePriceType(s.priceType);
    counts[pt] += 1;
  }

  const parts: string[] = [];
  if (counts.ADULT) parts.push(`성인 ${counts.ADULT}명`);
  if (counts.YOUTH) parts.push(`청소년 ${counts.YOUTH}명`);
  if (counts.SENIOR) parts.push(`경로 ${counts.SENIOR}명`);
  if (counts.SPECIAL) parts.push(`우대 ${counts.SPECIAL}명`);

  return parts.length ? parts.join(' / ') : '성인 0명';
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const reservationId = parseInt(searchParams.get('reservationId') || '0', 10);

  const { isLoading, reservationDetail, fetchReservationDetail, requestPayment, updateAmount } = usePayment();

  const [discountTab, setDiscountTab] = useState<DiscountTab>('coupon');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);

  const [coupons, setCoupons] = useState<MyCouponResponse[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE_PHONE'>('CARD');

  const [serverOriginalPrice, setServerOriginalPrice] = useState<number>(0);
  const [serverCouponDiscount, setServerCouponDiscount] = useState<number>(0);
  const [serverUsedPoints, setServerUsedPoints] = useState<number>(0);
  const [currentFinalAmount, setCurrentFinalAmount] = useState<number>(0);

  useEffect(() => {
    if (reservationId) fetchReservationDetail(reservationId);
  }, [reservationId, fetchReservationDetail]);

  useEffect(() => {
    const memberId = reservationDetail?.memberId ?? null;

    if (!memberId) {
      setCoupons([]);
      setSelectedCouponId(null);
      return;
    }

    (async () => {
      setCouponLoading(true);
      try {
        const list = await getMyCoupons(memberId);
        setCoupons(list);
      } catch (e) {
        console.error('쿠폰 목록 조회 실패:', e);
        setCoupons([]);
      } finally {
        setCouponLoading(false);
      }
    })();
  }, [reservationDetail?.memberId]);

  const handleRedeemCoupon = async (code: string) => {
    const memberId = reservationDetail?.memberId ?? null;

    if (!memberId) {
      alert('회원만 쿠폰 등록이 가능합니다.');
      return;
    }

    setCouponLoading(true);
    try {
      await redeemCoupon(code, memberId);
      const list = await getMyCoupons(memberId);
      setCoupons(list);
    } catch (e: any) {
      alert(e?.message ?? '쿠폰 등록에 실패했습니다.');
    } finally {
      setCouponLoading(false);
    }
  };

  const tickets: TicketRequest[] = useMemo(() => {
    if (!reservationDetail) return [];
    return buildTicketsFromReservationDetail(reservationDetail);
  }, [reservationDetail]);

  useEffect(() => {
    const recalc = async () => {
      if (!reservationDetail) return;

      const isMember = !!reservationDetail.memberId;

      const safeUsedPoints = isMember ? usedPoints : 0;
      const safeCouponId = isMember ? selectedCouponId : null;

      try {
        const res = await preparePayment({
          reservationId: reservationDetail.reservationId,
          screeningId: reservationDetail.screeningId,
          tickets,
          totalPrice: reservationDetail.totalAmount,
          memberCouponId: safeCouponId,
          usedPoints: safeUsedPoints,
          memberId: reservationDetail.memberId ?? null,
          guestId: reservationDetail.guestId ?? null,
        });

        setServerOriginalPrice(res.originalPrice);
        setServerCouponDiscount(res.discountAmount);
        setServerUsedPoints(res.usedPoints);
        setCurrentFinalAmount(res.finalAmount);

        updateAmount(res.finalAmount);
      } catch (e) {
        console.error('prepare 재계산 실패:', e);

        setServerOriginalPrice(reservationDetail.totalAmount);
        setServerCouponDiscount(0);
        setServerUsedPoints(safeUsedPoints);

        const fallback = Math.max(0, reservationDetail.totalAmount - safeUsedPoints);
        setCurrentFinalAmount(fallback);
        updateAmount(fallback);
      }
    };

    if (tickets.length > 0) {
      recalc();
    }
  }, [reservationDetail, selectedCouponId, usedPoints, tickets, updateAmount]);

  if (!reservationDetail && isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }
  if (!reservationDetail) return null;

  const ticketTypeText = buildTicketTypeText(reservationDetail.seats);

  const handlePayment = async () => {
    if (!agreeTerms) {
      alert('취소/환불 정책에 동의해주세요.');
      return;
    }

    const isMember = !!reservationDetail.memberId;

    await requestPayment(
      {
        reservationId: reservationDetail.reservationId,
        screeningId: reservationDetail.screeningId,
        tickets,
        totalPrice: currentFinalAmount,
        memberCouponId: isMember ? selectedCouponId : null,
        usedPoints: isMember ? usedPoints : 0,
        memberId: reservationDetail.memberId ?? null,
        guestId: reservationDetail.guestId ?? null,
      },
      selectedPaymentMethod
    );
  };

  const bookingData: BookingData = {
    movieTitle: reservationDetail.movieTitle,
    dateTime: reservationDetail.startTime,
    theater: `${reservationDetail.theaterName} / ${reservationDetail.screenName}`,
    ticketType: ticketTypeText,
    screeningId: reservationDetail.screeningId,
    posterUrl: reservationDetail.posterUrl,
  };

  const baseTotal = serverOriginalPrice > 0 ? serverOriginalPrice : reservationDetail.totalAmount;
  const totalDiscount = (serverCouponDiscount || 0) + (serverUsedPoints || 0);

  const paymentData: PaymentData = {
    reservationId: reservationId,
    adultCount: reservationDetail.seats.length,
    adultPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
    totalAmount: baseTotal,
    discountAmount: totalDiscount,
    finalAmount: currentFinalAmount,
    seats: [],
    memberId: reservationDetail.memberId || null,
    guestId: reservationDetail.guestId || null,
  };

  return (
    <div className="min-h-screen bg-[#fdf4e3]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 pb-16 pt-8">
        <div className="flex gap-8">
          <div className="flex-1 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">결제하기</h1>

            <BookingInfo bookingData={bookingData} />

            <DiscountSection
              discountTab={discountTab}
              setDiscountTab={setDiscountTab}
              onCouponSelect={setSelectedCouponId}
              onPointChange={setUsedPoints}
              isMember={!!reservationDetail.memberId}
              coupons={coupons}
              couponLoading={couponLoading}
              onRedeemCoupon={handleRedeemCoupon}
            />

            <PaymentMethodSection
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
            />

            <section className="bg-white rounded-lg p-6 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 accent-[#eb4d32]"
                />
                <span className="font-bold text-gray-700">취소 및 환불 규정에 동의합니다.</span>
              </label>
            </section>
          </div>

          <div className="w-[380px]">
            <PaymentSummary
              paymentData={paymentData}
              selectedPaymentMethod={selectedPaymentMethod}
              onPayment={handlePayment}
              isProcessing={isLoading}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
