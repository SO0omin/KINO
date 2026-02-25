import React from 'react';
import type { CouponDTO } from '../../types/main';

interface BenefitSectionProps {
  coupons: CouponDTO[];
}

const PANORAMA_B = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop";

const BACK_IMAGES_A = [
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=600",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600"
];

const BenefitSection = ({ coupons }: BenefitSectionProps) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <style>{`
        .flip-container { perspective: 1200px; }
        .flip-card { 
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
          transform-style: preserve-3d; 
          position: relative;
          width: 100%;
          height: 100%;
        }
        .group:hover .flip-card { transform: rotateY(180deg); }
        .flip-front, .flip-back { 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden;
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          border-radius: 30px;
          overflow: hidden;
        }
        .flip-back { transform: rotateY(180deg); }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-12 space-y-3">
          <span className="text-purple-500 font-black text-[9px] tracking-[0.5em] uppercase italic">The Collection</span>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Exclusive <span className="text-zinc-800 text-stroke-white">Vouchers</span>
          </h2>
        </div>

        {/* ✨ 세로 크기를 절반 수준인 h-[260px]로 조정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[260px]">
          {coupons.map((coupon, idx) => {
            const panoramaPos = `${(idx * 100) / 3}% center`;

            return (
              <div key={coupon.id} className="flip-container group">
                <div className="flip-card">
                  
                  {/* 앞면: 파노라마 조각 (그대로 유지하되 슬림하게) */}
                  <div 
                    className="flip-front border border-white/10 shadow-xl"
                    style={{ 
                      backgroundImage: `url(${PANORAMA_B})`,
                      backgroundSize: '400% auto',
                      backgroundPosition: panoramaPos,
                      filter: 'grayscale(50%)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-[8px] font-black text-white rounded-full border border-white/20 uppercase tracking-widest">
                          Piece 0{idx + 1}
                        </span>
                        <span className="text-purple-500 text-lg">✦</span>
                      </div>
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none line-clamp-2">
                        {coupon.name}
                      </h3>
                    </div>
                  </div>

                  {/* 뒷면: 연한 배경 + 콤팩트한 정보 */}
                  <div 
                    className="flip-back bg-[#121212] border border-purple-500/30 p-6 flex flex-col justify-between"
                    style={{ 
                      backgroundImage: `url(${BACK_IMAGES_A[idx % 4]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-[#121212]/92 backdrop-blur-sm" />

                    <div className="relative z-10 space-y-3">
                      <div className="pb-2 border-b border-white/5 flex justify-between items-center">
                        <span className="text-purple-500 text-[8px] font-black tracking-widest uppercase">Benefit</span>
                        <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">KINO VIP</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white italic tracking-tighter leading-none">
                          {coupon.discountValue.toLocaleString()}
                        </span>
                        <span className="text-xl font-black text-purple-600 italic">
                          {coupon.discountType === 'AMOUNT' ? 'W' : '%'}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest">
                        Min. order {coupon.minPrice.toLocaleString()} W
                      </p>
                    </div>

                    <button className="relative z-10 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-900/20">
                      Collect Now
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitSection;