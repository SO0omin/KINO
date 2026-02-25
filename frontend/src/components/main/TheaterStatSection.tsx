import React, { useState } from 'react';
import type { TheaterStat } from '../../types/main';

interface TheaterStatSectionProps {
  stats: TheaterStat[];
}

const TheaterStatSection = ({ stats }: TheaterStatSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 5; // 한 번에 보여줄 지역 수

  if (!stats || stats.length === 0) return null;

  // 다음/이전 핸들러
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= stats.length - itemsToShow ? prev : prev + 1));
  };

  return (
    <section className="py-20 border-t border-zinc-900 relative">
      <div className="flex items-center gap-8">
        {/* 왼쪽 화살표 */}
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className={`p-2 transition-all ${currentIndex === 0 ? 'text-zinc-800' : 'text-white hover:text-purple-500'}`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* 슬라이더 영역 */}
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out gap-8"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
          >
            {stats.map((stat) => (
              <div key={stat.regionName} className="min-w-[calc(20%-26px)] group text-center py-4 bg-zinc-900/20 rounded-2xl border border-transparent hover:border-zinc-800 transition-all">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3 group-hover:text-purple-400">
                  {stat.regionName}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black italic font-mono text-white group-hover:scale-110 transition-transform inline-block">
                    {stat.theaterCount}
                  </span>
                  <span className="text-zinc-600 font-bold text-[10px]">THEATERS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <button 
          onClick={handleNext} 
          disabled={currentIndex >= stats.length - itemsToShow}
          className={`p-2 transition-all ${currentIndex >= stats.length - itemsToShow ? 'text-zinc-800' : 'text-white hover:text-purple-500'}`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* 하단 시크한 문구 (기존 유지) */}
      <div className="mt-24 text-center">
        <p className="text-zinc-700 text-[10px] tracking-[0.6em] uppercase font-bold">
          Find your cinema, Find your story with KINO
        </p>
      </div>
    </section>
  );
};

export default TheaterStatSection;