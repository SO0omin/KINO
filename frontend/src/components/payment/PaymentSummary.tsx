import type { PaymentData } from '../../types/models/payment';

export type TossPaymentType =
  | 'CARD'
  | 'TRANSFER'
  | 'VIRTUAL_ACCOUNT'
  | 'MOBILE_PHONE';

interface PaymentSummaryProps {
  paymentData: PaymentData;
  selectedPaymentMethod: TossPaymentType; // string 말고 고정 타입
  onPayment: () => void;
  isProcessing?: boolean;
}

const paymentMethodLabel: Record<TossPaymentType, string> = {
  CARD: '카드결제',
  TRANSFER: '실시간 계좌이체',
  VIRTUAL_ACCOUNT: '가상계좌',
  MOBILE_PHONE: '휴대폰 결제',
};

export function PaymentSummary({
  paymentData,
  selectedPaymentMethod,
  onPayment,
  isProcessing = false,
}: PaymentSummaryProps) {
  const methodText = paymentMethodLabel[selectedPaymentMethod] ?? '결제수단 선택';

  return (
    <div className="w-[340px]">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 sticky top-4">
        <h2 className="text-xl mb-6">결제금액</h2>

        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-3">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>인원</span>
              <span>{paymentData.adultCount}</span>
            </div>

            <div className="h-px bg-gray-300"></div>

            <div className="flex justify-between">
              <span>금액</span>
              <span>{paymentData.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#eb4d32] flex items-center justify-center">
            <span className="text-white font-bold">-</span>
          </div>
        </div>

        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span>할인금액</span>
            <span>{paymentData.discountAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span>최종 결제</span>
            <span className="text-2xl text-[#eb4d32]">
              {paymentData.finalAmount.toLocaleString()}원
            </span>
          </div>
          <div className="text-sm text-gray-700">
            <p>결제수단</p>
            <p className="mt-2">{methodText}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 bg-white border-2 border-gray-300 rounded hover:bg-gray-50 transition-colors">
            이전
          </button>
          <button
            onClick={onPayment}
            disabled={isProcessing}
            className="flex-1 py-3 bg-[#eb4d32] text-white rounded hover:bg-[#d43d22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리중...' : '결제'}
          </button>
        </div>
      </div>
    </div>
  );
}
