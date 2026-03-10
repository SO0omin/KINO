import { motion } from 'framer-motion';
import { Gift, Zap, Crown, ShieldCheck } from 'lucide-react';
import type { CouponDTO } from '../../types/main';

interface BenefitSectionProps {
    coupons: CouponDTO[];
}

const BenefitSection = ({ coupons }: BenefitSectionProps) => {
    if (!coupons || coupons.length === 0) return null;

    const icons = [Gift, Zap, Crown, ShieldCheck];

    return (
        <section className="py-32 relative bg-white overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B91C1C]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
                {/* Header */}
                <div className="mb-20 flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                        <div className="w-12 h-px bg-[#B91C1C]"></div>
                        <span>Patron Privileges</span>
                        <div className="w-12 h-px bg-[#B91C1C]"></div>
                    </div>
                    <h2 className="font-display text-5xl md:text-7xl text-[#1A1A1A] uppercase tracking-tight">
                        Exclusive <span className="text-[#B91C1C]">Vouchers</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {coupons.map((coupon, idx) => {
                        const Icon = icons[idx % icons.length];
                        return (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="group relative h-[400px]"
                            >
                                {/* Card Container */}
                                <div className="relative w-full h-full bg-[#FDFDFD] border border-black/5 p-8 rounded-sm overflow-hidden group-hover:border-[#B91C1C]/30 transition-all duration-500 flex flex-col justify-between shadow-xl">

                                    {/* Background Icon Decoration */}
                                    <Icon size={120} className="absolute -right-8 -top-8 text-black/[0.02] group-hover:text-[#B91C1C]/5 transition-colors duration-500 rotate-12" />

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-black/5 rounded-sm text-[#B91C1C] group-hover:bg-[#B91C1C] group-hover:text-white transition-all duration-500">
                                                <Icon size={24} />
                                            </div>
                                            <span className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-widest">No. 00{idx + 1}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-display text-2xl text-[#1A1A1A] uppercase leading-tight group-hover:text-[#B91C1C] transition-colors">
                                                {coupon.name}
                                            </h3>
                                            <p className="text-black/40 text-xs font-medium leading-relaxed">
                                                Valid for single use only. Min purchase ₩{coupon.minPrice.toLocaleString()}.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-baseline gap-1">
                      <span className="font-display text-6xl text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">
                        {coupon.discountType === 'AMOUNT' ? '₩' : ''}
                          {coupon.discountValue.toLocaleString()}
                          {coupon.discountType === 'PERCENT' ? '%' : ''}
                      </span>
                                            <span className="font-bold text-xs text-black/20 uppercase tracking-widest ml-2">Off</span>
                                        </div>

                                        <button className="w-full py-4 bg-black/5 hover:bg-[#B91C1C] text-[#1A1A1A] hover:text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-sm border border-black/10 hover:border-[#B91C1C] shadow-lg">
                                            Collect Now
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
