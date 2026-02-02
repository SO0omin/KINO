import { useState } from 'react';
import type { DiscountTab } from '../../types/model/payment';

// [수정 핵심] PaymentPage에서 전달하는 핸들러를 받기 위한 인터페이스 확장
interface DiscountSectionProps {
  discountTab: DiscountTab;
  setDiscountTab: (tab: DiscountTab) => void;
  isMember?: boolean;                          // 회원 여부 확인
  onCouponSelect?: (couponId: number | null) => void; // 쿠폰 선택 시 호출
  onPointChange?: (points: number) => void;         // 포인트 변경 시 호출
}

export function DiscountSection({ 
  discountTab, 
  setDiscountTab, 
  isMember, 
  onCouponSelect, 
  onPointChange 
}: DiscountSectionProps) {
  const [pointInput, setPointInput] = useState<string>('');
  const [activeCoupon, setActiveCoupon] = useState<number | null>(null);

  // 포인트 입력 핸들러
  const handlePointInput = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    setPointInput(num.toLocaleString());
    if (onPointChange) onPointChange(num); // 부모 상태 업데이트
  };

  // 쿠폰 선택 핸리러 (임시 PK 1번 적용 예시)
  const handleCouponClick = (id: number) => {
    const newId = activeCoupon === id ? null : id;
    setActiveCoupon(newId);
    if (onCouponSelect) onCouponSelect(newId); // 부모 상태 업데이트
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-300">
        <h2 className="text-xl font-bold">할인정보</h2>
        <button 
          className="text-sm text-gray-600 hover:text-[#eb4d32]"
          onClick={() => {
            setPointInput('');
            setActiveCoupon(null);
            if (onPointChange) onPointChange(0);
            if (onCouponSelect) onCouponSelect(null);
          }}
        >
          초기화
        </button>
      </div>

      {!isMember ? (
        <div className="bg-gray-100 rounded-lg p-10 text-center text-gray-500">
          비회원은 할인 혜택을 이용하실 수 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              className={`py-3 border rounded font-medium transition-all ${
                discountTab === 'coupon' ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]' : 'border-gray-300 text-gray-600'
              }`}
              onClick={() => setDiscountTab('coupon')}
            >
              쿠폰
            </button>
            <button 
              className={`py-3 border rounded font-medium transition-all ${
                discountTab === 'point' ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]' : 'border-gray-300 text-gray-600'
              }`}
              onClick={() => setDiscountTab('point')}
            >
              포인트
            </button>
          </div>

          {/* 쿠폰 섹션 */}
          {discountTab === 'coupon' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => handleCouponClick(1)} // 실제 DB의 Coupon ID 연동 지점
                  className={`py-4 border rounded text-sm transition-all ${
                    activeCoupon === 1 ? 'border-[#eb4d32] bg-[#fdf4e3]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <p className="font-bold">신규 가입 2,000원 할인</p>
                  <p className="text-xs text-gray-500 mt-1">~ 2026.12.31까지</p>
                </button>
                <button 
                  onClick={() => handleCouponClick(2)}
                  className={`py-4 border rounded text-sm transition-all ${
                    activeCoupon === 2 ? 'border-[#eb4d32] bg-[#fdf4e3]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <p className="font-bold">평일 관람 10% 할인</p>
                  <p className="text-xs text-gray-500 mt-1">평일 월~목 사용 가능</p>
                </button>
              </div>
            </div>
          )}

          {/* 포인트 섹션 */}
          {discountTab === 'point' && (
            <div className="animate-fadeIn">
              <div className="flex gap-2 items-center">
                <input 
                  type="text"
                  value={pointInput}
                  onChange={(e) => handlePointInput(e.target.value)}
                  placeholder="0"
                  className="flex-1 py-3 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-[#eb4d32] outline-none text-right font-mono"
                />
                <span className="text-gray-600">P</span>
                <button 
                  className="px-4 py-3 bg-gray-800 text-white rounded text-sm hover:bg-black transition-colors"
                  onClick={() => handlePointInput('5000')} // 예시: 전액 사용
                >
                  전액사용
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 ml-1">
                보유 포인트: <span className="text-black font-bold">5,000</span> P (1,000P 단위로 사용 가능)
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <ul className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
              <li>• 쿠폰과 포인트는 중복 적용이 가능합니다.</li>
              <li>• 최종 결제 금액이 0원 미만일 경우 포인트 사용이 제한될 수 있습니다.</li>
              <li>• 사용하신 쿠폰은 예매 취소 시 자동 복구됩니다.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}