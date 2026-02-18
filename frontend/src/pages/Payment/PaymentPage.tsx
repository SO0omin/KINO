import { useState, useEffect } from 'react';
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

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const reservationId = parseInt(searchParams.get('reservationId') || '0', 10);

  // 결제/예약 데이터
  const { isLoading, reservationDetail, fetchReservationDetail, requestPayment, updateAmount } = usePayment();

  // 할인 관련 상태
  const [discountTab, setDiscountTab] = useState<DiscountTab>('coupon');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null); // memberCouponId
  const [usedPoints, setUsedPoints] = useState<number>(0);

  // 쿠폰 목록 상태(옵션 B: memberId로 조회)
  const [coupons, setCoupons] = useState<MyCouponResponse[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  // 결제수단/약관
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =useState<'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE_PHONE'>('CARD');


  // ✅ 서버 prepare 결과로 표시할 값들
  const [serverOriginalPrice, setServerOriginalPrice] = useState<number>(0);
  const [serverCouponDiscount, setServerCouponDiscount] = useState<number>(0);
  const [serverUsedPoints, setServerUsedPoints] = useState<number>(0);
  const [currentFinalAmount, setCurrentFinalAmount] = useState<number>(0);

  // 1) 예약 상세 로드
  useEffect(() => {
    if (reservationId) fetchReservationDetail(reservationId);
  }, [reservationId, fetchReservationDetail]);

  // 2) 회원이면 내 쿠폰 목록 로드
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

  // 3) 쿠폰 등록 핸들러 (등록 후 목록 재조회)
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

  // ✅ 4) 쿠폰/포인트 변경 시 서버 prepare로 최종금액/할인 재계산
  useEffect(() => {
    const recalc = async () => {
      if (!reservationDetail) return;

      // 비회원이면 서버 prepare를 굳이 안 때리고 기본 표시만
      if (!reservationDetail.memberId) {
        setServerOriginalPrice(reservationDetail.totalAmount);
        setServerCouponDiscount(0);
        setServerUsedPoints(0);
        setCurrentFinalAmount(reservationDetail.totalAmount);
        updateAmount(reservationDetail.totalAmount);
        return;
      }

      try {
        const res = await preparePayment({
          reservationId: reservationDetail.reservationId,
          screeningId: reservationDetail.screeningId,
          tickets: reservationDetail.seats.map((seat) => ({
            seatId: seat.seatId,
            priceType: 'ADULT', // 현재 모델상 고정(성인만이면 OK)
          })),
          totalPrice: reservationDetail.totalAmount, // 참고값
          memberCouponId: selectedCouponId,
          usedPoints: usedPoints,
        });

        // 서버 계산 결과 반영
        setServerOriginalPrice(res.originalPrice);
        setServerCouponDiscount(res.discountAmount);
        setServerUsedPoints(res.usedPoints);
        setCurrentFinalAmount(res.finalAmount);

        updateAmount(res.finalAmount);
      } catch (e) {
        console.error('prepare 재계산 실패:', e);

        // 실패 fallback
        setServerOriginalPrice(reservationDetail.totalAmount);
        setServerCouponDiscount(0);
        setServerUsedPoints(usedPoints);

        const fallback = Math.max(0, reservationDetail.totalAmount - usedPoints);
        setCurrentFinalAmount(fallback);
        updateAmount(fallback);
      }
    };

    recalc();
  }, [reservationDetail, selectedCouponId, usedPoints, updateAmount]);

  // 로딩/가드
  if (!reservationDetail && isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }
  if (!reservationDetail) return null;

  // 결제 요청
  const handlePayment = async () => {
    if (!agreeTerms) {
      alert('취소/환불 정책에 동의해주세요.');
      return;
    }

    await requestPayment(
      {
        reservationId: reservationDetail.reservationId,
        screeningId: reservationDetail.screeningId,
        tickets: reservationDetail.seats.map(seat => ({
          seatId: seat.seatId,
          priceType: 'ADULT'
        })),
        totalPrice: currentFinalAmount,
        memberCouponId: selectedCouponId,
        usedPoints: usedPoints
      },
      selectedPaymentMethod
    );
    
  };

  const bookingData: BookingData = {
    movieTitle: reservationDetail.movieTitle,
    dateTime: reservationDetail.startTime,
    theater: `${reservationDetail.theaterName} / ${reservationDetail.screenName}`,
    ticketType: `성인 ${reservationDetail.seats.length}명`,
    screeningId: reservationDetail.screeningId,
    posterUrl: reservationDetail.posterUrl,
  };

  const baseTotal = serverOriginalPrice || reservationDetail.totalAmount;
  const totalDiscount = (serverCouponDiscount || 0) + (serverUsedPoints || 0);

  const paymentData: PaymentData = {
    reservationId: reservationId,
    adultCount: reservationDetail.seats.length,
    adultPrice: baseTotal / reservationDetail.seats.length,
    totalAmount: baseTotal,
    discountAmount: totalDiscount,
    finalAmount: currentFinalAmount,
    seats: [],
    memberId: reservationDetail.memberId || null,
    guestId: null,
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
