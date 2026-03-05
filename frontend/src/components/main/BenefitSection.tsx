import type { CouponDTO } from '../../types/main';

interface BenefitSectionProps {
  coupons: CouponDTO[];
}

const BenefitSection = ({ coupons }: BenefitSectionProps) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="font-typewriter text-[10px] text-black/40 tracking-[0.6em] uppercase mb-4">Patron Privileges</span>
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
                        {coupon.name}
                      </h3>
                      <div className="h-px w-12 bg-white/20"></div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-black italic text-white">
                        {coupon.discountType === 'AMOUNT' ? '₩' : ''}
                        {coupon.discountValue.toLocaleString()}
                        {coupon.discountType === 'PERCENT' ? '%' : ''}
                      </span>
                      <span className="font-typewriter text-[10px] text-white/40 uppercase ml-1">Off</span>
                    </div>
                  </div>
                </div>

                {/* --- BACK: Light Style (White Background + Detailed Info) --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-[4px] border-black p-1 shadow-[12px_12px_0_0_#000]">
                  <div className="h-full border-2 border-dashed border-black/20 p-6 flex flex-col justify-between text-black relative overflow-hidden">

                    <div className="space-y-4">
                      <div className="pb-3 border-b border-black/10 flex justify-between items-center">
                        <span className="text-black/40 text-[8px] font-mono tracking-widest uppercase">Terms of Use</span>
                        <span className="text-black/40 text-[8px] font-mono uppercase tracking-widest">KINO VIP</span>
                      </div>

                      <div className="space-y-3">
                        <p className="font-typewriter text-[11px] text-black/80 leading-relaxed">
                          Valid for single use only. <br/>
                          Requires minimum purchase of <span className="text-black font-bold font-mono">₩{coupon.minPrice.toLocaleString()}</span>.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                          <span className="font-mono text-[9px] text-black/40 uppercase tracking-widest">Limited Access</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Black Style */}
                    <button className="w-full py-4 bg-transparent border-2 border-black text-black font-serif italic text-lg hover:bg-black hover:text-white transition-all active:scale-95">
                      Collect Now
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