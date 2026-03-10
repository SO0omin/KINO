import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Gift, Zap, Crown, ShieldCheck } from 'lucide-react';
import type { CouponDTO } from '../../types/main';

interface BenefitSectionProps {
  coupons: CouponDTO[];
}

const BenefitSection = ({ coupons }: BenefitSectionProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  if (!coupons || coupons.length === 0) return null;

  const icons = [Gift, Zap, Crown, ShieldCheck];

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
    return source === 'PARTNER' ? '제휴' : '키노';
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
    if (isPointCoupon(coupon)) return `${coupon.discountValue.toLocaleString()}P`;
    const { discountType, discountValue } = coupon;
    return discountType === 'RATE' ? `${discountValue}%` : `₩${discountValue.toLocaleString()}`;
  };

  const handleCollectNow = () => {
    if (isLoggedIn) {
      navigate('/mypage/coupons');
      return;
    }
    navigate('/login', {
      state: {
        returnTo: '/mypage/coupons',
      },
    });
  };

  return (
    <section className="py-20 relative bg-white overflow-hidden">
      {/* 배경 장식: 은은한 레드 글로우 효과 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B91C1C]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* 1. 헤더: 모던 스타일 + 한국어 서브타이틀 */}
        <div className="mb-20 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs font-sans">
            <div className="w-12 h-px bg-[#B91C1C]"></div>
            <span>Patron Privileges</span>
            <div className="w-12 h-px bg-[#B91C1C]"></div>
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-[#1A1A1A] uppercase tracking-tighter">
            Exclusive <span className="text-[#B91C1C]">Vouchers</span>
          </h2>
          <p className="font-sans text-sm text-black/40 font-bold uppercase tracking-widest mt-2">
            오직 키노 회원님만을 위한 특별한 혜택
          </p>
        </div>

        {/* 2. 쿠폰 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coupons.map((coupon, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <motion.div 
                key={coupon.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative h-[420px]"
              >
                {/* 카드 컨테이너 */}
                <div className="relative w-full h-full bg-[#FDFDFD] border border-black/5 p-8 rounded-sm overflow-hidden group-hover:border-[#B91C1C]/30 transition-all duration-500 flex flex-col justify-between shadow-xl hover:shadow-2xl">
                  
                  {/* 배경 장식 아이콘 */}
                  <Icon size={140} className="absolute -right-8 -top-8 text-black/[0.02] group-hover:text-[#B91C1C]/5 transition-colors duration-500 rotate-12" />

                  <div className="space-y-6">
                    <div className="flex justify-between items-center relative z-10">
                      <div className="p-3 bg-black/5 rounded-sm text-[#B91C1C] group-hover:bg-[#B91C1C] group-hover:text-white transition-all duration-500">
                        <Icon size={24} />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-widest">
                        CODE: 00{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-black/5 text-[10px] font-bold text-black/40 rounded-sm group-hover:text-[#B91C1C] transition-colors">
                          {displaySourceLabel(coupon)}
                        </span>
                        <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">
                          {inferCouponKind(coupon)}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-[#1A1A1A] uppercase leading-tight group-hover:text-[#B91C1C] transition-colors min-h-[3.5rem] line-clamp-2">
                        {displayCouponName(coupon)}
                      </h3>
                      <p className="text-black/40 text-xs font-medium leading-relaxed">
                        {coupon.minPrice > 0 
                          ? `₩${coupon.minPrice.toLocaleString()} 이상 결제 시 사용 가능` 
                          : "금액 제한 없이 사용 가능한 쿠폰입니다."}
                      </p>
                    </div>
                  </div>

                  {/* 하단 혜택 정보 및 버튼 */}
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-6xl text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">
                        {formatDiscount(coupon)}
                      </span>
                      <span className="font-bold text-xs text-black/20 uppercase tracking-widest ml-2">OFF</span>
                    </div>

                    <button 
                      onClick={handleCollectNow}
                      className="w-full py-4 bg-[#1A1A1A] hover:bg-[#B91C1C] text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-sm shadow-lg active:scale-95"
                    >
                      쿠폰함 가기
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitSection;