import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MovieDTO } from '../../types/main';

interface ReviewSectionProps {
  movies: MovieDTO[];
}

const ReviewSection = ({ movies }: ReviewSectionProps) => {
  const [index, setIndex] = useState(0);
  if (!movies || movies.length === 0) return null;

  const current = movies[index];
  const nextMovie = () => setIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  const prevMovie = () => setIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  // ✨ 프로그레스 바 너비 계산 (현재 인덱스 기반으로 1/4, 2/4... 정확히 계산)
  const progressWidth = ((index + 1) / movies.length) * 100;

  return (
    <section className="py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 섹션 헤더 */}
        <div className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="text-purple-500 font-black text-[10px] tracking-[0.5em] uppercase italic">Exclusive Selection</span>
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              Kino Original <span className="text-zinc-800 text-stroke-white">Review</span>
            </h2>
          </div>
          <p className="text-zinc-600 text-[10px] font-bold tracking-widest uppercase">Verified Audience Only</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* 1. 왼쪽: 정보 및 정밀 컨트롤러 */}
          <div className="w-full lg:w-[280px] space-y-12 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${current.id}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.85] text-white break-keep">
                  {current.title}
                </h3>
                <div className="flex items-center gap-3 text-2xl font-black font-mono text-purple-500 italic">
                  <span className="text-yellow-500">★</span> {current.avgRating.toFixed(1)}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ✨ 수정된 정밀 컨트롤러 영역 */}
            <div className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-zinc-600 font-black italic text-sm tracking-tighter uppercase">Progress</span>
                <span className="text-zinc-400 font-black font-mono italic text-lg tracking-widest">
                  <span className="text-purple-500">{index + 1}</span> / {movies.length}
                </span>
              </div>
              
              {/* 진행 바 (배경) */}
              <div className="h-[3px] w-full bg-zinc-900 rounded-full relative overflow-hidden">
                {/* 실제 진행도 (게이지) - 프레임워크에 맞춰 정확한 %로 이동 */}
                <motion.div 
                  initial={false}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute h-full bg-gradient-to-r from-purple-800 to-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.6)]" 
                />
              </div>

              <div className="flex gap-4">
                <button onClick={prevMovie} className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-purple-600 hover:text-white transition-all group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-active:scale-75 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onClick={nextMovie} className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-purple-600 hover:text-white transition-all group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-active:scale-75 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 2. 중앙: 세로로 나열된 티켓 리뷰 3개 */}
          <div className="flex-1 w-full flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`list-${current.id}`}
                className="space-y-6"
              >
                {current.latestReviews.length > 0 ? current.latestReviews.map((rev: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="relative w-full bg-[#141414] border border-white/5 p-8 rounded-2xl shadow-xl group hover:border-purple-500/30 transition-colors"
                    style={{ 
                      // ✨ 메가박스 스타일의 왼쪽 절취선 (세로 나열에도 유지)
                      maskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px)',
                      WebkitMaskImage: 'radial-gradient(circle at 0px 50%, transparent 12px, black 13px)'
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-600/30 group-hover:bg-purple-600 transition-colors" />
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-purple-500/50 tracking-[0.2em] uppercase italic">Original Ticket {i+1}</span>
                        <div className="flex gap-1">
                          {[1,2,3].map(s => <div key={s} className="w-1 h-1 rounded-full bg-zinc-800" />)}
                        </div>
                      </div>
                      <p className="text-zinc-400 italic text-base leading-relaxed pl-4 border-l border-white/5 group-hover:text-zinc-200 transition-colors">
                        "{rev}"
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                    <p className="text-zinc-800 font-black italic text-xl uppercase tracking-tighter">Waiting for reviews...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. 오른쪽: 대형 포스터 */}
          <div className="w-full lg:w-[340px] shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`poster-${current.id}`}
                initial={{ opacity: 0, scale: 0.95, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 1.05 }}
                className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_60px_100px_rgba(0,0,0,0.7)] border border-white/10 group"
              >
                <img src={current.posterUrl} alt={current.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-[10px] font-black text-purple-400 tracking-[0.4em] uppercase italic mb-2">Now Showing</p>
                  <p className="text-xl font-bold italic text-white uppercase tracking-tight line-clamp-1">{current.title}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ReviewSection;