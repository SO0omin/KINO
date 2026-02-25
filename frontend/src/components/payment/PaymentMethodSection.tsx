import { Plus } from 'lucide-react';

export type TossPaymentType =
  | 'CARD'
  | 'TRANSFER'
  | 'VIRTUAL_ACCOUNT'
  | 'MOBILE_PHONE';

interface PaymentMethodSectionProps {
  selectedPaymentMethod: TossPaymentType;
  setSelectedPaymentMethod: (method: TossPaymentType) => void;
}

export function PaymentMethodSection({
  selectedPaymentMethod,
  setSelectedPaymentMethod
}: PaymentMethodSectionProps) {

  const paymentMethods: { label: string; type: TossPaymentType }[] = [
    { label: '카드결제', type: 'CARD' },
    { label: '실시간 계좌이체', type: 'TRANSFER' },
    { label: '가상계좌', type: 'VIRTUAL_ACCOUNT' },
    { label: '휴대폰 결제', type: 'MOBILE_PHONE' }
  ];

  return (
    <section className="mb-8">
      <h2 className="text-xl mb-4 pb-3 border-b-2 border-gray-300">
        결제수단
      </h2>

      <div className="bg-white rounded-lg p-8">

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[200px]">
          <Plus size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-500 mb-1">
            자주 사용하는 카드 등록하고
          </p>
          <p className="text-gray-500">
            더욱 빠르게 결제하세요!
          </p>
        </div>

        <div className="mt-6 flex gap-3 flex-wrap">
          {paymentMethods.map((method) => (
            <button
              key={method.type}
              className={`px-6 py-2 rounded transition-colors ${
                selectedPaymentMethod === method.type
                  ? 'bg-[#eb4d32] text-white'
                  : 'border border-gray-300 hover:border-[#eb4d32] hover:bg-[#fdf4e3]'
              }`}
              onClick={() => setSelectedPaymentMethod(method.type)}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
