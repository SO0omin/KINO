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

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const reservationId = parseInt(searchParams.get('reservationId') || '0');

  // 이제 usePayment가 정상적으로 모든 변수를 줍니다.
  const { 
    isLoading, reservationDetail, fetchReservationDetail, requestPayment, updateAmount 
  } = usePayment();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [discountTab, setDiscountTab] = useState<DiscountTab>('coupon');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  
  // 팀원이 만든 UI를 위한 상태 관리
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('간편결제');
  
  const [currentFinalAmount, setCurrentFinalAmount] = useState<number>(0);

  // 1. 초기 데이터 로드
  useEffect(() => {
    if (reservationId) fetchReservationDetail(reservationId);
  }, [reservationId]);

  // 2. 금액 변경 감지
  useEffect(() => {
    if (reservationDetail) {
      const newFinalAmount = Math.max(0, reservationDetail.totalAmount - usedPoints);
      setCurrentFinalAmount(newFinalAmount);
      
      // 에러 해결: 이제 updateAmount가 숫자를 받을 수 있음
      updateAmount(newFinalAmount);
    }
  }, [reservationDetail, usedPoints]);

  if (!reservationDetail && isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }
  if (!reservationDetail) return null;

  const handlePayment = async () => {
    if (!agreeTerms) {
      alert('취소/환불 정책에 동의해주세요.');
      return;
    }

    await requestPayment({
      reservationId: reservationDetail.reservationId,
      screeningId: reservationDetail.screeningId,
      tickets: reservationDetail.seats.map(seat => ({
        seatId: seat.seatId,
        priceType: 'ADULT'
      })),
      totalPrice: currentFinalAmount,
      memberCouponId: selectedCouponId,
      usedPoints: usedPoints
    });
  };

  const bookingData: BookingData = {
    movieTitle: reservationDetail.movieTitle,
    dateTime: reservationDetail.startTime,
    theater: `${reservationDetail.theaterName} / ${reservationDetail.screenName}`,
    ticketType: `성인 ${reservationDetail.seats.length}명`,
    screeningId: reservationDetail.screeningId,
    posterUrl: reservationDetail.posterUrl,
  };

  const paymentData: PaymentData = {
    reservationId: reservationId,
    adultCount: reservationDetail.seats.length,
    adultPrice: reservationDetail.totalAmount / reservationDetail.seats.length,
    totalAmount: reservationDetail.totalAmount,
    discountAmount: usedPoints,
    finalAmount: currentFinalAmount,
    seats: [],
    memberId: reservationDetail.memberId || null,
    guestId: null
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
            />

            {/* [에러 해결] Props를 정상적으로 전달함 */}
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