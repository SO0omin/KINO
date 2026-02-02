import type { PaymentData } from '../../types/model/payment';

interface PaymentSummaryProps {
  paymentData: PaymentData;
  selectedPaymentMethod: string;
  onPayment: () => void; // 결제 버튼 클릭 핸들러 추가
  isProcessing?: boolean; // 로딩 상태
}

export function PaymentSummary({ 
  paymentData, 
  selectedPaymentMethod,
  onPayment,
  isProcessing = false
}: PaymentSummaryProps) {
  return (
    <div className="w-[340px]">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 sticky top-4">
        <h2 className="text-xl mb-6">결제금액</h2>
        
        {/* 결제 금액 박스 */}
        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-3">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>성인</span>
              <span>{paymentData.adultCount}</span>
            </div>
            
            <div className="h-px bg-gray-300"></div>
            
            <div className="flex justify-between">
              <span>금액</span>
              <span>{paymentData.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* - 기호 (두 박스 사이) */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#eb4d32] flex items-center justify-center">
            <span className="text-white font-bold">-</span>
          </div>
        </div>

        {/* 할인 금액 박스 */}
        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span>할인금액</span>
            <span>{paymentData.discountAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="bg-[#f5e6d3] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span>최종 결제</span>
            <span className="text-2xl text-[#eb4d32]">{paymentData.finalAmount.toLocaleString()}원</span>
          </div>
          <div className="text-sm text-gray-700">
            <p>결제수단</p> 
            <p className="mt-2">{selectedPaymentMethod || '상품/기프트콘'}</p>
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