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
import { getMyMembershipCards, type MyMembershipCardItem } from '../../api/myPageApi';

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
  const [membershipCards, setMembershipCards] = useState<MyMembershipCardItem[]>([]);
  const [selectedMembershipCardId, setSelectedMembershipCardId] = useState<number | null>(null);

  const [serverOriginalPrice, setServerOriginalPrice] = useState<number>(0);
  const [serverCouponDiscount, setServerCouponDiscount] = useState<number>(0);
  const [serverUsedPoints, setServerUsedPoints] = useState<number>(0);
  const [currentFinalAmount, setCurrentFinalAmount] = useState<number>(0);

  // 보유 포인트
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

  // 보유 포인트 조회
  useEffect(() => {
    const memberId = reservationDetail?.memberId ?? null;

    if (!memberId) {
      setAvailablePoints(0);
      setUsedPoints(0);
      return;
    }

    (async () => {
      try {
        const p = await getMyPoints(memberId);
        const n = Number(p) || 0;
        setAvailablePoints(n);
        setUsedPoints((prev) => Math.floor(Math.min(prev, n) / 100) * 100);
      } catch (e) {
        console.error('포인트 조회 실패:', e);
        setAvailablePoints(0);
        setUsedPoints(0);
      }
    })();
  }, [reservationDetail?.memberId]);

  useEffect(() => {
    const memberId = reservationDetail?.memberId ?? null;

    if (!memberId) {
      setMembershipCards([]);
      setSelectedMembershipCardId(null);
      return;
    }

    (async () => {
      try {
        const cards = await getMyMembershipCards(memberId);
        setMembershipCards(cards);
        setSelectedMembershipCardId((prev) => {
          if (prev && cards.some((card) => card.cardId === prev)) {
            return prev;
          }
          return cards[0]?.cardId ?? null;
        });
      } catch (e) {
        console.error('멤버십 카드 조회 실패:', e);
        setMembershipCards([]);
        setSelectedMembershipCardId(null);
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

    recalc();
  }, [reservationDetail?.reservationId, selectedCouponId, usedPoints]);

  const baseTotal = serverOriginalPrice > 0 ? serverOriginalPrice : reservationDetail?.totalAmount ?? 0;
  const maxUsablePoints = Math.max(0, baseTotal - (serverCouponDiscount || 0));

  useEffect(() => {
    const clampedPoints = Math.floor(Math.min(usedPoints, availablePoints, maxUsablePoints) / 100) * 100;
    if (clampedPoints !== usedPoints) {
      setUsedPoints(clampedPoints);
    }
  }, [availablePoints, maxUsablePoints, usedPoints]);

  if (!reservationId) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-display text-4xl uppercase tracking-tighter text-[#1A1A1A]">Invalid Access</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Reservation ID is required</p>
        </div>
      </div>
    );
  }

  if (!reservationDetail && isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] animate-pulse">
          Loading Payment Data...
        </div>
      </div>
    );
  }
  
  if (!reservationDetail) return null;

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

  const seatNamesText = reservationDetail.seats.map((seat) => seat.seatName).join(', ');

  const bookingData: BookingData = {
    movieTitle: reservationDetail.movieTitle,
    dateTime: reservationDetail.startTime,
    theater: `${reservationDetail.theaterName} / ${reservationDetail.screenName}`,
    seatNamesText: seatNamesText,
    screeningId: reservationDetail.screeningId,
    posterUrl: reservationDetail.posterUrl,
  };
  const totalDiscount = (serverCouponDiscount || 0) + (serverUsedPoints || 0);

  const paymentData: PaymentData = {
    reservationId: reservationId,
    adultCount: typeCounts.ADULT,
    youthCount: typeCounts.YOUTH,
    seniorCount: typeCounts.SENIOR,
    specialCount: typeCounts.SPECIAL,
    adultPrice: reservationDetail.seats.find(s => normalizePriceType(s.priceType) === 'ADULT')?.price || 0,
    youthPrice: reservationDetail.seats.find(s => normalizePriceType(s.priceType) === 'YOUTH')?.price || 0,
    seniorPrice: reservationDetail.seats.find(s => normalizePriceType(s.priceType) === 'SENIOR')?.price || 0,
    speciaPrice: reservationDetail.seats.find(s => normalizePriceType(s.priceType) === 'SPECIAL')?.price || 0,
    totalAmount: baseTotal,
    discountAmount: totalDiscount,
    finalAmount: currentFinalAmount,
    seats: [],
    memberId: reservationDetail.memberId || null,
    guestId: reservationDetail.guestId || null,
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/ticketing');
  };

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white">
      
      {/* Header Area */}
      <div className="bg-[#1A1A1A] text-white pt-15 pb-10 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-sans text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tighter leading-none">
              결제<span className="text-white/20"></span>
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* ===================== [좌측] 결제 상세 정보 영역 ===================== */}
          <div className="flex-[2] flex flex-col gap-12 w-full">
            
            {/* 자식 컴포넌트들: 내부 디자인은 각 컴포넌트에서 수정해야 하지만 여백은 통일 */}
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
              maxUsablePoints={maxUsablePoints}
              pointUnit={100}
            />

            <PaymentMethodSection
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              membershipCards={membershipCards}
              selectedMembershipCardId={selectedMembershipCardId}
              setSelectedMembershipCardId={setSelectedMembershipCardId}
            />

            {/* 약관 동의 체크박스 (디자인 리팩토링) */}
            <section>
              <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 shadow-xl transition-all hover:border-black/10">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-black/20 rounded-sm peer-checked:bg-[#B91C1C] peer-checked:border-[#B91C1C] transition-all flex items-center justify-center group-hover:border-[#B91C1C]/50">
                      <svg 
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">
                    취소 및 환불 규정에 동의합니다.
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* ===================== [우측] 결제 요약 (Ticket Stub) ===================== */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-8 flex flex-col gap-8">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>Payment Summary</span>
            </div>
            
            <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl flex flex-col overflow-hidden">
              {/* PaymentSummary 컴포넌트를 이 안에 렌더링 */}
              <PaymentSummary
                paymentData={paymentData}
                selectedPaymentMethod={selectedPaymentMethod}
                onBack={handleBack}
                onPayment={handlePayment}
                isProcessing={isLoading}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}