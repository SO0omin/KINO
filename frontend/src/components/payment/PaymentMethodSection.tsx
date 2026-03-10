import { Plus } from 'lucide-react';
import type { MyMembershipCardItem } from '../../api/myPageApi';

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
    <section className="mb-8">
      <h2 className="text-xl mb-4 pb-3 border-b-2 border-gray-300">
        결제수단
      </h2>

      <div className="bg-white rounded-lg p-8">

        {selectedPaymentMethod === 'CARD' && membershipCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {membershipCards.map((card) => {
              const isSelected = selectedMembershipCardId === card.cardId;
              return (
                <button
                  key={card.cardId}
                  type="button"
                  onClick={() => setSelectedMembershipCardId?.(card.cardId)}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    isSelected
                      ? 'border-[#eb4d32] bg-[#fdf4e3] shadow-sm'
                      : 'border-gray-200 bg-white hover:border-[#eb4d32]'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{card.issuerName}</p>
                  <p className="mt-4 text-xl font-semibold text-gray-900">{card.cardNumber}</p>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{card.cardName}</p>
                      <p className="mt-1 text-xs text-gray-500">{card.channelName}</p>
                    </div>
                    {isSelected ? <span className="text-sm font-semibold text-[#eb4d32]">선택됨</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[200px]">
            <Plus size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-500 mb-1">
              자주 사용하는 카드 등록하고
            </p>
            <p className="text-gray-500">
              더욱 빠르게 결제하세요!
            </p>
          </div>
        )}

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
