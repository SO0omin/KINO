import { useState } from 'react';
import type { DiscountTab } from '../../types/models/payment';
import type { MyCouponResponse } from '../../api/paymentApi';

interface DiscountSectionProps {
  discountTab: DiscountTab;
  setDiscountTab: (tab: DiscountTab) => void;

  isMember?: boolean;

  coupons: MyCouponResponse[];
  couponLoading?: boolean;

  onRedeemCoupon: (code: string) => Promise<void>;

  onCouponSelect?: (couponId: number | null) => void;
  onPointChange?: (points: number) => void;

  // 추가: 서버에서 조회한 보유 포인트
  availablePoints?: number;

  // 옵션: 포인트 사용 단위(기본 1000)
  pointUnit?: number;
}

export function DiscountSection({
  discountTab,
  setDiscountTab,
  isMember,
  coupons,
  couponLoading,
  onRedeemCoupon,
  onCouponSelect,
  onPointChange,
  availablePoints = 0,
  pointUnit = 1000,
}: DiscountSectionProps) {
  const [pointInput, setPointInput] = useState<string>('');
  const [activeMemberCouponId, setActiveMemberCouponId] = useState<number | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const normalizePoint = (raw: string) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;

    // 보유 포인트 초과 방지
    const clamped = Math.min(num, availablePoints);

    // 단위 강제(예: 1000P 단위)
    const unitApplied = pointUnit > 1 ? Math.floor(clamped / pointUnit) * pointUnit : clamped;

    return unitApplied;
  };

  const handlePointInput = (val: string) => {
    const points = normalizePoint(val);
    setPointInput(points > 0 ? points.toLocaleString() : '');
    onPointChange?.(points);
  };

  const handleCouponClick = (memberCouponId: number) => {
    const newId = activeMemberCouponId === memberCouponId ? null : memberCouponId;
    setActiveMemberCouponId(newId);
    onCouponSelect?.(newId);
  };

  const handleReset = () => {
    setPointInput('');
    setActiveMemberCouponId(null);
    setCouponCode('');
    onPointChange?.(0);
    onCouponSelect?.(null);
  };

  const handleRedeem = async () => {
    const code = couponCode.trim();
    if (!code) {
      alert('쿠폰 코드를 입력해주세요.');
      return;
    }
    setRedeemBusy(true);
    try {
      await onRedeemCoupon(code);
      setCouponCode('');
    } catch (e: any) {
      alert(e?.message ?? '쿠폰 등록 실패');
    } finally {
      setRedeemBusy(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-300">
        <h2 className="text-xl font-bold">할인정보</h2>
        <button
          className="text-sm text-gray-600 hover:text-[#eb4d32]"
          onClick={handleReset}
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
                discountTab === 'coupon'
                  ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]'
                  : 'border-gray-300 text-gray-600'
              }`}
              onClick={() => setDiscountTab('coupon')}
            >
              쿠폰
            </button>
            <button
              className={`py-3 border rounded font-medium transition-all ${
                discountTab === 'point'
                  ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]'
                  : 'border-gray-300 text-gray-600'
              }`}
              onClick={() => setDiscountTab('point')}
            >
              포인트
            </button>
          </div>

          {discountTab === 'coupon' && (
            <div className="animate-fadeIn space-y-4">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드 입력 (예: WELCOME-2000)"
                  className="flex-1 py-3 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-[#eb4d32] outline-none"
                />
                <button
                  className="px-4 py-3 bg-gray-800 text-white rounded text-sm hover:bg-black transition-colors disabled:opacity-50"
                  onClick={handleRedeem}
                  disabled={redeemBusy}
                >
                  {redeemBusy ? '등록중' : '등록'}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-700">보유 쿠폰</p>
                  {couponLoading && <p className="text-xs text-gray-500">불러오는 중...</p>}
                </div>

                {coupons.length === 0 ? (
                  <div className="bg-gray-50 rounded p-6 text-sm text-gray-500">
                    사용 가능한 쿠폰이 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {coupons.map((c) => (
                      <button
                        key={c.memberCouponId}
                        onClick={() => handleCouponClick(c.memberCouponId)}
                        className={`py-4 border rounded text-sm transition-all text-left px-4 ${
                          activeMemberCouponId === c.memberCouponId
                            ? 'border-[#eb4d32] bg-[#fdf4e3]'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <p className="font-bold">{c.couponName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {c.discountType === 'FIXED'
                            ? `${c.discountValue.toLocaleString()}원 할인`
                            : `${c.discountValue}% 할인`}
                          {c.minPrice > 0 ? ` (최소 ${c.minPrice.toLocaleString()}원)` : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">~ {c.expiresAt}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                  onClick={() => handlePointInput(String(availablePoints))}
                >
                  전액사용
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 ml-1">
                보유 포인트:{' '}
                <span className="text-black font-bold">{availablePoints.toLocaleString()}</span> P
                {pointUnit > 1 ? ` (${pointUnit.toLocaleString()}P 단위로 사용 가능)` : ''}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <ul className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
              <li>• 쿠폰과 포인트는 중복 적용이 가능합니다.</li>
              <li>• 최종 결제 금액은 서버 계산이 기준입니다.</li>
              <li>• 결제 실패 시 쿠폰은 자동으로 복구됩니다.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
