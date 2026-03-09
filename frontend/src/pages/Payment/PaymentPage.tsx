import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookingInfo } from '../../components/payment/BookingInfo';
import { DiscountSection } from '../../components/payment/DiscountSection';
import { PaymentMethodSection } from '../../components/payment/PaymentMethodSection';
import { PaymentSummary } from '../../components/payment/PaymentSummary';
import { usePayment } from '../../hooks/usePayment';
import type { DiscountTab, BookingData, PaymentData } from '../../types/models/payment';

import {
  preparePayment,
  getMyCoupons,
  redeemCoupon,
  getMyPoints,
  type MyCouponResponse,
} from '../../api/paymentApi';

import type { PriceType, TicketRequest } from '../../types/dtos/payment.dto';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = parseInt(searchParams.get('reservationId') || '0', 10);

  const { isLoading, reservationDetail, fetchReservationDetail, requestPayment, updateAmount } =
    usePayment();

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

  // 추가: 보유 포인트
  const [availablePoints, setAvailablePoints] = useState<number>(0);

  const typeCounts = useMemo(() => {
    const counts = { ADULT: 0, YOUTH: 0, SENIOR: 0, SPECIAL: 0 };
    if (!reservationDetail) return counts;

    reservationDetail.seats.forEach((seat) => {
      const type = normalizePriceType(seat.priceType);
      counts[type]++;
    });
    return counts;
  }, [reservationDetail]);

  useEffect(() => {
    if (reservationId) fetchReservationDetail(reservationId);
  }, [reservationId, fetchReservationDetail]);

  // 쿠폰 목록 조회
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

  // 추가: 보유 포인트 조회
  useEffect(() => {
    const memberId = reservationDetail?.memberId ?? null;

    if (!memberId) {
      setAvailablePoints(0);
      setUsedPoints(0); // 비회원이면 사용 포인트도 0으로 정리
      return;
    }

    (async () => {
      try {
        const p = await getMyPoints(memberId);
        const n = Number(p) || 0;
        setAvailablePoints(n);

        // 현재 입력된 usedPoints가 보유 포인트보다 크면 자동 보정
        setUsedPoints((prev) => Math.min(prev, n));
      } catch (e) {
        console.error('포인트 조회 실패:', e);
        setAvailablePoints(0);
        setUsedPoints(0);
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

  // 쿠폰/포인트 변경 시 prepare 재계산
  useEffect(() => {
    const recalc = async () => {
      if (!reservationDetail) return; //티켓 정보없으면 실행하지 않음

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

        // 에러 발생 시 폴백 로직
        setServerOriginalPrice(reservationDetail.totalAmount);
        setServerCouponDiscount(0);
        setServerUsedPoints(safeUsedPoints);

        const fallback = Math.max(0, reservationDetail.totalAmount - safeUsedPoints);
        setCurrentFinalAmount(fallback);
        updateAmount(fallback);
      }
    };

      recalc();
  }, [reservationDetail?.reservationId, selectedCouponId, usedPoints]);

  if (!reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">잘못된 접근입니다. reservationId가 필요합니다.</p>
      </div>
    );
  }

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
    adultCount: typeCounts.ADULT,
    youthCount: typeCounts.YOUTH,
    seniorCount: typeCounts.SENIOR,
    specialCount: typeCounts.SPECIAL,
    adultPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
    youthPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
    seniorPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
    speciaPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
    totalAmount: baseTotal,
    discountAmount: totalDiscount,
    finalAmount: currentFinalAmount,
    seats: [],
    memberId: reservationDetail.memberId || null,
    guestId: reservationDetail.guestId || null,
  };
  

  // console.log("🚨 서버에서 온 예약 상세 데이터:", reservationDetail); 디버깅용
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/ticketing');
  };

  return (
    <div className="min-h-screen bg-[#fdf4e3]">
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
              availablePoints={availablePoints}
              pointUnit={100}
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
              onBack={handleBack}
              onPayment={handlePayment}
              isProcessing={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
