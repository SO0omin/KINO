import { Plus } from 'lucide-react';

export type TossPaymentType =
  | 'CARD'
  | 'TRANSFER'
  | 'VIRTUAL_ACCOUNT'
  | 'MOBILE_PHONE';

interface PaymentMethodSectionProps {
  selectedPaymentMethod: TossPaymentType;
  setSelectedPaymentMethod: (method: TossPaymentType) => void;
  membershipCards?: MyMembershipCardItem[];
  selectedMembershipCardId?: number | null;
  setSelectedMembershipCardId?: (cardId: number | null) => void;
}

export function PaymentMethodSection({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  membershipCards = [],
  selectedMembershipCardId = null,
  setSelectedMembershipCardId
}: PaymentMethodSectionProps) {

  const paymentMethods: { label: string; type: TossPaymentType }[] = [
    { label: '카드결제', type: 'CARD' },
    { label: '실시간 계좌이체', type: 'TRANSFER' },
    { label: '가상계좌', type: 'VIRTUAL_ACCOUNT' },
    { label: '휴대폰 결제', type: 'MOBILE_PHONE' }
  ];

  return (
    <section>
      <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-8">
        <div className="w-8 h-px bg-[#B91C1C]"></div>
        <span>Payment Method</span>
      </div>

      <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[200px]">
          <Plus size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-500 mb-1">
            자주 사용하는 카드 등록하고
          </p>
          <p className="text-gray-500">
            더욱 빠르게 결제하세요!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.type}
              className={`py-4 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all border ${
                selectedPaymentMethod === method.type
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md scale-[1.02]'
                  : 'bg-white border-black/10 text-black/60 hover:border-black/30 hover:text-black'
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