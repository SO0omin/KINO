import { Plus } from 'lucide-react';

interface PaymentMethodSectionProps {
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
}

export function PaymentMethodSection({ selectedPaymentMethod, setSelectedPaymentMethod }: PaymentMethodSectionProps) {
  const paymentMethods = ['실시간 계좌이체', '간편결제', 'KM', '인증결제', '기타결제'];

  return (
    <section className="mb-8">
      <h2 className="text-xl mb-4 pb-3 border-b-2 border-gray-300">결제수단</h2>
      
      <div className="bg-white rounded-lg p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[200px]">
          <Plus size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-500 mb-1">자주사용하는 카드 등록하고</p>
          <p className="text-gray-500">더욱 빠르게 결제하세요!</p>
        </div>

        <div className="mt-6 flex gap-3">
          {paymentMethods.map((method) => (
            <button 
              key={method}
              className={`px-6 py-2 rounded transition-colors ${
                selectedPaymentMethod === method 
                  ? 'bg-[#eb4d32] text-white' 
                  : 'border border-gray-300 hover:border-[#eb4d32] hover:bg-[#fdf4e3]'
              }`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-600">카드사 선택</label>
          <select className="w-full mt-2 p-3 border border-gray-300 rounded bg-white">
            <option>선택</option>
          </select>
        </div>
      </div>
    </section>
  );
}
