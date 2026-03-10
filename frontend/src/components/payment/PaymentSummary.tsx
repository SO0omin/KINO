import type { PaymentData } from '../../types/models/payment';
import type { TossPaymentType } from '../../types/models/payment';

interface PaymentSummaryProps {
  paymentData: PaymentData;
  selectedPaymentMethod: TossPaymentType;
  onPayment: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

const paymentMethodLabel: Record<TossPaymentType, string> = {
  CARD: '카드결제',
  TRANSFER: '계좌이체',
  VIRTUAL_ACCOUNT: '가상계좌',
  MOBILE_PHONE: '휴대폰결제',
};

export function PaymentSummary({
  paymentData,
  selectedPaymentMethod,
  onPayment,
  onBack,
  isProcessing = false,
}: PaymentSummaryProps) {
  const methodText = paymentMethodLabel[selectedPaymentMethod] ?? '결제수단 선택';

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* 1. 영수증 내역 영역 */}
      <div className="p-8 flex-1 flex flex-col gap-6">
        
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4">Ticket Price</div>
          <div className="space-y-3 text-sm font-medium">
            {paymentData.adultCount > 0 && (
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span>성인 {paymentData.adultCount}명</span>
                <span>{(paymentData.adultCount * paymentData.adultPrice).toLocaleString()}원</span>
              </div>
            )}
            {paymentData.youthCount > 0 && (
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span>청소년 {paymentData.youthCount}명</span>
                <span>{(paymentData.youthCount * paymentData.youthPrice).toLocaleString()}원</span>
              </div>
            )}
            {paymentData.seniorCount > 0 && (
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span>경로 {paymentData.seniorCount}명</span>
                <span>{(paymentData.seniorCount * paymentData.seniorPrice).toLocaleString()}원</span>
              </div>
            )}
            {paymentData.specialCount > 0 && (
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span>우대 {paymentData.specialCount}명</span>
                <span>{(paymentData.specialCount * paymentData.speciaPrice).toLocaleString()}원</span>
              </div>
            )}
            
            <div className="pt-3 border-t border-dashed border-black/20 flex justify-between items-center">
              <span className="text-xs font-bold tracking-widest text-black/60">티켓 총액</span>
              <span className="font-display text-xl">{paymentData.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-black/5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B91C1C]">Discount</span>
            <span className="font-display text-xl text-[#B91C1C]">
              -{paymentData.discountAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 2. 최종 결제 영역 (하단) */}
      <div className="bg-[#F8F8F8] border-t border-black/5 p-8 flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Final Amount</span>
            <div className="font-display text-4xl md:text-5xl text-[#B91C1C] leading-none">
              {paymentData.finalAmount.toLocaleString()} <span className="text-sm text-[#1A1A1A] tracking-widest">KRW</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/40 mt-2">
            <span>Method</span>
            <span className="text-[#1A1A1A]">{methodText}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-black/5">
          <button
            onClick={onBack}
            className="w-1/3 py-4 bg-white border border-black/10 rounded-sm text-xs font-bold tracking-[0.2em] uppercase text-black/60 hover:bg-black/5 hover:text-black transition-colors"
          >
            Back
          </button>
          <button
            onClick={onPayment}
            disabled={isProcessing}
            className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#B91C1C] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>

    </div>
  );
}