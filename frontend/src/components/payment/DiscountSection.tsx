import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
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
  availablePoints?: number;
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
  pointUnit = 100,
}: DiscountSectionProps) {
  const [pointInput, setPointInput] = useState<string>('');
  const [activeMemberCouponId, setActiveMemberCouponId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const normalizePoint = (raw: string) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
    return Math.min(num, availablePoints);
  };

  const handlePointInput = (val: string) => {
    const entered = normalizePoint(val);
    const applied = pointUnit > 1 ? Math.floor(entered / pointUnit) * pointUnit : entered;
    setPointInput(entered > 0 ? entered.toLocaleString() : '');
    onPointChange?.(applied);
  };

  const syncPointInputToAppliedUnit = () => {
    const entered = normalizePoint(pointInput);
    const applied = pointUnit > 1 ? Math.floor(entered / pointUnit) * pointUnit : entered;
    setPointInput(applied > 0 ? applied.toLocaleString() : '');
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
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
          <div className="w-8 h-px bg-[#B91C1C]"></div>
          <span>Discounts</span>
        </div>
        <button
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors"
          onClick={handleReset}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {!isMember ? (
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-12 text-center flex flex-col items-center shadow-xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            비회원은 할인 혜택을 이용하실 수 없습니다.
          </span>
        </div>
      ) : (
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl overflow-hidden">
          <div className="flex border-b border-black/5">
            <button
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                discountTab === 'coupon' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'
              }`}
              onClick={() => setDiscountTab('coupon')}
            >
              Coupons
            </button>
            <button
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                discountTab === 'point' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'
              }`}
              onClick={() => setDiscountTab('point')}
            >
              Points
            </button>
          </div>

          <div className="p-8 min-h-[300px]">
            {discountTab === 'coupon' && (
              <div className="animate-in fade-in space-y-8">
                <div className="flex gap-3">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="쿠폰 코드 입력 (예: WELCOME-2000)"
                    className="flex-1 py-3 px-4 bg-white border border-black/10 rounded-sm text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20"
                  />
                  <button
                    className="px-8 py-3 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
                    onClick={handleRedeem}
                    disabled={redeemBusy}
                  >
                    {redeemBusy ? '등록중' : '등록'}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/60">My Coupons</p>
                    {couponLoading && <p className="text-[10px] uppercase tracking-widest text-[#B91C1C] animate-pulse">Loading...</p>}
                  </div>

                  {coupons.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">
                      사용 가능한 쿠폰이 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.map((c) => (
                        <button
                          key={c.memberCouponId}
                          onClick={() => handleCouponClick(c.memberCouponId)}
                          className={`p-5 border rounded-sm text-left transition-all group ${
                            activeMemberCouponId === c.memberCouponId
                              ? 'border-[#B91C1C] bg-[#B91C1C]/5'
                              : 'border-black/5 hover:border-black/20 bg-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          <p className={`font-bold text-sm mb-2 ${activeMemberCouponId === c.memberCouponId ? 'text-[#B91C1C]' : 'text-[#1A1A1A]'}`}>
                            {c.couponName}
                          </p>
                          <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest text-black/40">
                            <span>
                              {c.discountType === 'FIXED'
                                ? `${c.discountValue.toLocaleString()}원 할인`
                                : `${c.discountValue}% 할인`}
                              {c.minPrice > 0 ? ` (최소 ${c.minPrice.toLocaleString()}원)` : ''}
                            </span>
                            <span>~ {c.expiresAt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {discountTab === 'point' && (
              <div className="animate-in fade-in space-y-4 pt-4">
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={pointInput}
                      onChange={(e) => handlePointInput(e.target.value)}
                      onBlur={syncPointInputToAppliedUnit}
                      placeholder="0"
                      className="w-full py-4 px-4 bg-white border border-black/10 rounded-sm focus:border-[#B91C1C] outline-none text-right font-display text-2xl transition-all placeholder:text-black/10 pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 font-bold">P</span>
                  </div>
                  <button
                    className="px-8 py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#B91C1C] transition-colors h-full"
                    onClick={() => handlePointInput(String(availablePoints))}
                  >
                    전액사용
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 pl-1">
                  <span>보유 포인트: <span className="text-[#1A1A1A]">{availablePoints.toLocaleString()}</span> P</span>
                  {pointUnit > 1 && <span>({pointUnit.toLocaleString()}P 단위)</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}