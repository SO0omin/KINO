import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { MovieDTO } from '../../types/main';

interface ReviewSectionProps {
  movies: MovieDTO[];
}

const ReviewSection = ({ movies }: ReviewSectionProps) => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  const current = movies[index];
  const nextMovie = () => setIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  const prevMovie = () => setIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  const progressWidth = ((index + 1) / movies.length) * 100;

  return (
    <section className="py-32 relative overflow-hidden bg-[#f4f1ea]/30">
      <div className="max-w-7xl mx-auto px-10">
        
        {/* Section Header - Newspaper Style */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-[6px] border-black pb-10">
          <div className="space-y-4">
            <span className="font-typewriter text-[10px] text-black/40 tracking-[0.6em] uppercase">The Critics' Corner</span>
            <h2 className="font-serif text-6xl italic tracking-tighter text-black uppercase leading-none">
              Daily <span className="bg-black text-white px-4">Reviews</span>
            </h2>
          </div>
          <div className="hidden md:block text-right">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/40">Volume XIV • Issue 08</p>
            <p className="font-serif italic text-xl text-black">"Fine cinema for fine people"</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          
          {/* 1. Left: Info & Controls */}
          <div className="w-full lg:w-[300px] flex flex-col justify-between shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${current.id}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-4xl italic tracking-tighter uppercase leading-[0.9] text-black">
                    {current.title}
                  </h3>
                  <div className="h-1 w-16 bg-black"></div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-xl ${s <= Math.round(current.avgRating) ? 'text-black' : 'text-black/10'}`}>★</span>
                    ))}
                  </div>
                  <span className="font-mono text-lg font-bold italic text-black">{current.avgRating.toFixed(1)}</span>
                </div>

                <button 
                  onClick={() => navigate(`/movies/${current.id}`)} // 경로 /movies/로 통일
                  className="w-full py-3.5 border-[3px] border-black bg-white text-black font-serif italic text-base hover:bg-black hover:text-white transition-all shadow-[5px_5px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  View Full Archive
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Progress & Controls */}
            <div className="space-y-6 pt-10 border-t-2 border-black/10 mt-10 lg:mt-0">
              <div className="flex justify-between items-end">
                <span className="font-typewriter text-[9px] text-black/40 uppercase tracking-widest">Reel Progress</span>
                <span className="font-mono text-base font-bold italic text-black">
                  {String(index + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
                </span>
              </div>
              
              <div className="h-1 w-full bg-black/5 rounded-full relative overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute h-full bg-black" 
                />
              </div>

              <div className="flex gap-3">
                <button onClick={prevMovie} className="flex-1 py-3 border-2 border-black hover:bg-black hover:text-white transition-all group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto group-active:-translate-x-1 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onClick={nextMovie} className="flex-1 py-3 border-2 border-black hover:bg-black hover:text-white transition-all group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto group-active:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Center: Ticket Reviews */}
          <div className="flex-1 flex flex-col gap-5">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`list-${current.id}`}
                className="space-y-5"
              >
                {current.latestReviews.length > 0 ? current.latestReviews.map((rev: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="relative w-full bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000] group hover:bg-[#f4f1ea] transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[8px] font-bold text-black/40 tracking-[0.3em] uppercase">Testimonial 0{i+1}</span>
                        <div className="flex gap-1.5">
                          {[1,2,3].map(s => <div key={s} className="w-1 h-1 rounded-full bg-black/10" />)}
                        </div>
                      </div>
                      <p className="font-serif italic text-lg text-black leading-snug">
                        "{rev}"
                      </p>
                      <div className="pt-3 border-t border-black/5 flex justify-end">
                        <span className="font-typewriter text-[9px] text-black/30 uppercase tracking-widest">— Verified Patron</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="h-full border-4 border-dashed border-black/10 flex items-center justify-center p-20">
                    <p className="font-serif italic text-xl text-black/20 uppercase tracking-tighter">Awaiting Manifest...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. Right: Large Poster */}
          <div className="w-full lg:w-[340px] shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`poster-${current.id}`}
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                className="relative aspect-[2/3] border-[8px] border-black shadow-[15px_15px_0_0_#000] overflow-hidden group"
              >
                <img src={current.posterUrl} alt={current.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="font-typewriter text-[9px] text-white/60 tracking-[0.4em] uppercase mb-1">Now Playing</p>
                  <p className="font-serif text-xl italic text-white uppercase tracking-tight leading-tight">{current.title}</p>
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