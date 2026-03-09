import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { CouponDTO } from '../../types/main';

interface BenefitSectionProps {
  coupons: CouponDTO[];
}

const BenefitSection = ({ coupons }: BenefitSectionProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  if (!coupons || coupons.length === 0) return null;

  const isPointCoupon = (coupon: CouponDTO) => {
    const kind = (coupon.couponKind || '').trim();
    const name = (coupon.name || '').trim();
    return kind === '포인트' || name.includes('포인트');
  };

  const inferCouponKind = (coupon: CouponDTO) => {
    const rawKind = (coupon.couponKind || '').trim();
    if (rawKind) return rawKind;
    const name = (coupon.name || '').trim();
    if (name.includes('포인트')) return '포인트';
    if (name.includes('포토')) return '포토카드';
    if (name.includes('매점') || name.includes('스토어')) return '매점';
    if (name.includes('매표') || name.includes('영화')) return '매표';
    return '기타';
  };

  const displaySourceLabel = (coupon: CouponDTO) => {
    const source = (coupon.sourceType || '').toUpperCase();
    if (source === 'PARTNER') return '제휴';
    return '키노';
  };

  const displayCouponName = (coupon: CouponDTO) => {
    const rawName = (coupon.name || '').trim();
    const baseName = rawName.replace(/^(키노|제휴)\s*/, '');
    if ((coupon.sourceType || '').toUpperCase() === 'PARTNER') {
      return `제휴 ${baseName}`;
    }
    return baseName || rawName;
  };

  const formatDiscount = (coupon: CouponDTO) => {
    if (isPointCoupon(coupon)) {
      return `${coupon.discountValue.toLocaleString()}P`;
    }
    const discountType = coupon.discountType;
    const discountValue = coupon.discountValue;
    if (discountType === 'RATE') {
      return `${discountValue.toLocaleString()}%`;
    }
    return `₩${discountValue.toLocaleString()}`;
  };

  const handleCollectNow = () => {
    if (isLoggedIn) {
      navigate('/mypage/coupons');
      return;
    }
    navigate('/login');
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="font-typewriter text-[10px] text-black/40 tracking-[0.6em] uppercase mb-4">쿠폰 혜택</span>
          <h2 className="font-serif text-5xl italic tracking-tighter text-black uppercase">
            Exclusive <span className="text-white bg-black px-4 py-1">Vouchers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {coupons.map((coupon, idx) => (
            <div key={coupon.id} className="group [perspective:1000px] h-[320px]">
              {/* Card Inner: Handles the 3D Flip */}
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                {/* --- FRONT: Dark Style (Black Background) --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-black border-[4px] border-black p-1 shadow-[12px_12px_0_0_#000]">
                  <div className="h-full border-2 border-dashed border-white/20 p-6 flex flex-col justify-between relative overflow-hidden text-white">
                    
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-widest">No. 00{idx + 1}</span>
                      <div className="w-8 h-8 border-2 border-white/40 rounded-full flex items-center justify-center font-serif italic text-lg">K</div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl italic text-white uppercase leading-tight">
                        {displayCouponName(coupon)}
                      </h3>
                      <p className="font-mono text-[9px] text-white/50 tracking-widest uppercase">
                        {displaySourceLabel(coupon)} • {inferCouponKind(coupon)}
                      </p>
                      <div className="h-px w-12 bg-white/20"></div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-black italic text-white">
                        {formatDiscount(coupon)}
                      </span>
                      <span className="font-typewriter text-[10px] text-white/40 uppercase ml-1">혜택</span>
                    </div>
                  </div>
                </div>

                {/* --- BACK: Light Style (White Background + Detailed Info) --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-[4px] border-black p-1 shadow-[12px_12px_0_0_#000]">
                  <div className="h-full border-2 border-dashed border-black/20 p-6 flex flex-col justify-between text-black relative overflow-hidden">

                    <div className="space-y-4">
                      <div className="pb-3 border-b border-black/10 flex justify-between items-center">
                        <span className="text-black/40 text-[8px] font-mono tracking-widest uppercase">이용 안내</span>
                        <span className="text-black/40 text-[8px] font-mono uppercase tracking-widest">KINO 쿠폰</span>
                      </div>

                      <div className="space-y-3">
                        <p className="font-typewriter text-[11px] text-black/80 leading-relaxed">
                          {coupon.minPrice > 0 ? (
                            <>
                              최소 결제금액 <span className="text-black font-bold font-mono">₩{coupon.minPrice.toLocaleString()}</span> 이상에서 사용 가능합니다.
                            </>
                          ) : (
                            <>최소 결제금액 제한 없이 사용할 수 있습니다.</>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Button: Black Style */}
                    <button
                      type="button"
                      onClick={handleCollectNow}
                      className="w-full py-4 bg-transparent border-2 border-black text-black font-serif italic text-lg hover:bg-black hover:text-white transition-all active:scale-95"
                    >
                      쿠폰함 가기
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitSection;
