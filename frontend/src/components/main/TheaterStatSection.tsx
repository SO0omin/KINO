import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TheaterStat } from '../../types/main';

interface TheaterStatSectionProps {
  stats: TheaterStat[];
}

const TheaterStatSection = ({ stats }: TheaterStatSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 5;

  if (!stats || stats.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= stats.length - itemsToShow ? prev : prev + 1));
  };

  return (
    <section className="py-32 relative bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
              <div className="w-12 h-px bg-[#B91C1C]"></div>
              <span>Network Coverage</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              <h2 className="font-display text-5xl md:text-7xl text-[#1A1A1A] uppercase tracking-tight">
                Our <span className="text-black/20">Venues</span>
              </h2>
              
              <div className="flex gap-2 pb-2">
                <button 
                  onClick={handlePrev} 
                  disabled={currentIndex === 0}
                  className={`p-3 border border-black/10 rounded-sm transition-all duration-300 ${currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#B91C1C] hover:border-[#B91C1C] hover:text-white'}`}
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={currentIndex >= stats.length - itemsToShow}
                  className={`p-3 border border-black/10 rounded-sm transition-all duration-300 ${currentIndex >= stats.length - itemsToShow ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#B91C1C] hover:border-[#B91C1C] hover:text-white'}`}
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block text-right">
            <p className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-[0.4em]">
              Scroll to explore <br /> our global network
            </p>
          </div>
        </div>

        {/* Slider Area */}
        <div className="overflow-hidden py-4">
          <motion.div 
            animate={{ x: `calc(-${currentIndex * (100 / itemsToShow)}% - ${currentIndex * (32 / itemsToShow)}px)` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex gap-8"
          >
            {stats.map((stat, idx) => (
              <div 
                key={stat.regionName} 
                className="w-[calc(20%-26px)] flex-shrink-0 aspect-square group relative flex flex-col items-center justify-center bg-[#FDFDFD] border border-black/5 rounded-sm hover:border-[#B91C1C]/50 transition-all duration-500 shadow-xl overflow-hidden"
              >
                {/* Background Decoration */}
                <MapPin size={80} className="absolute -right-4 -bottom-4 text-black/[0.02] group-hover:text-[#B91C1C]/5 transition-colors duration-500" />

                <p className="font-bold text-[12px] text-black/40 uppercase tracking-[0.3em] mb-6 group-hover:text-[#B91C1C] transition-colors">
                  {stat.regionName}
                </p>
                
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <span className="font-display text-7xl text-[#1A1A1A] group-hover:scale-110 transition-transform leading-none">
                    {stat.theaterCount}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-widest mt-2">
                    Venues
                  </span>
                </div>

                <div className="mt-6 h-1 w-8 bg-black/5 group-hover:w-16 group-hover:bg-[#B91C1C] transition-all duration-500"></div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-24 text-center">
          <div className="inline-block border-y border-black/5 py-6 px-16">
            <p className="font-bold text-[11px] tracking-[0.6em] uppercase text-black/20">
              Exhibitions held daily • Est. 1928 • Imagix Cinema
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheaterStatSection;
