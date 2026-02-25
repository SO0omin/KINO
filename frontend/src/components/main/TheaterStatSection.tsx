import React, { useState } from 'react';
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
    <section className="py-24 border-t-4 border-black relative bg-[#F5F2ED]/30">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex items-center gap-12">
          {/* Left Arrow */}
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className={`p-4 border-2 border-black transition-all shrink-0 ${currentIndex === 0 ? 'opacity-10 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Slider Area */}
          <div className="flex-1 overflow-hidden py-4">
            <div 

              className="flex items-center transition-transform duration-700 ease-in-out gap-8"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                width: '100%' 
              }}
            >
              {stats.map((stat) => (
                <div 
                  key={stat.regionName} 
                  className="w-[calc(20%-26px)] flex-shrink-0 aspect-square group flex flex-col items-center justify-center border-2 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] hover:shadow-[12px_12px_0_0_#000] hover:-translate-y-2 transition-all cursor-default"
                >
                  <p className="font-typewriter text-[13px] font-bold text-black/50 uppercase tracking-[0.2em] mb-4 group-hover:text-black transition-colors">
                    {stat.regionName}
                  </p>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-serif text-6xl italic text-black group-hover:scale-110 transition-transform leading-none">
                      {stat.theaterCount}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-black/30 uppercase tracking-widest mt-2">
                      Venues
                    </span>
                  </div>

                  <div className="mt-4 h-px w-8 bg-black/10 group-hover:w-12 group-hover:bg-black/30 transition-all"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext} 
            disabled={currentIndex >= stats.length - itemsToShow}
            className={`p-4 border-2 border-black transition-all shrink-0 ${currentIndex >= stats.length - itemsToShow ? 'opacity-10 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-24 text-center">
          <div className="inline-block border-y-2 border-black/10 py-4 px-12">
            <p className="font-typewriter text-[11px] tracking-[0.6em] uppercase text-black/40">
              Exhibitions held daily • Est. 1928 • Golden Age Cinema
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheaterStatSection;