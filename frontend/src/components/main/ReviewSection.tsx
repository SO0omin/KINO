import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
    <section className="py-32 relative bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* 1. 섹션 헤더: 모던 시네마 스타일 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
              <div className="w-12 h-px bg-[#B91C1C]"></div>
              <span>The Critics' Corner</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-[#1A1A1A] uppercase tracking-tighter leading-none">
              Patron <span className="text-[#B91C1C]">Reviews</span>
            </h2>
          </div>
          <div className="hidden md:block text-right space-y-2">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/20">Volume XIV • Issue 08</p>
            <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-tight italic">"Cinema speaks for itself"</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          
          {/* 2. Left: Info & Controls */}
          <div className="w-full lg:w-[340px] flex flex-col justify-between shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${current.id}`}
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="font-display text-4xl md:text-5xl text-[#1A1A1A] uppercase tracking-tight leading-[0.9]">
                    {current.title}
                  </h3>
                  <div className="h-1.5 w-20 bg-[#B91C1C]"></div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex gap-1.5 text-[#FFD700]">
                    {[1,2,3,4,5].map(s => (
                      <Star 
                        key={s} 
                        size={20} 
                        fill={s <= Math.round(current.avgRating / 2) ? "currentColor" : "none"} 
                        className={s <= Math.round(current.avgRating / 2) ? "" : "text-black/10"} 
                      />
                    ))}
                  </div>
                  <span className="font-mono text-2xl font-bold italic text-[#1A1A1A]">{current.avgRating.toFixed(1)}</span>
                </div>

                <button 
                  onClick={() => navigate(`/movies/${current.id}`)}
                  className="w-full py-4 bg-black/5 hover:bg-black/10 backdrop-blur-md text-[#1A1A1A] font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-sm border border-black/10 flex items-center justify-center gap-3"
                >
                  <Info size={18} />
                  <span>View Full Archive</span>
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Progress & Navigation */}
            <div className="space-y-8 pt-12 border-t border-black/10 mt-12 lg:mt-0">
              <div className="flex justify-between items-end font-mono">
                <span className="font-bold text-[10px] text-black/20 uppercase tracking-widest">Reel Progress</span>
                <span className="text-lg font-bold italic text-[#1A1A1A]">
                  {String(index + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-black/5 rounded-full relative overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute h-full bg-[#B91C1C]" 
                />
              </div>

              <div className="flex gap-4">
                <button onClick={prevMovie} className="flex-1 py-4 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 group flex items-center justify-center">
                  <ChevronLeft size={24} strokeWidth={3} className="text-[#1A1A1A] group-hover:text-white group-hover:scale-110 transition-all" />
                </button>
                <button onClick={nextMovie} className="flex-1 py-4 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 group flex items-center justify-center">
                  <ChevronRight size={24} strokeWidth={3} className="text-[#1A1A1A] group-hover:text-white group-hover:scale-110 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Center: Ticket Reviews */}
          <div className="flex-1 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`list-${current.id}`}
                className="space-y-6"
              >
                {current.latestReviews && current.latestReviews.length > 0 ? current.latestReviews.map((rev: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="relative w-full bg-[#FDFDFD] border border-black/5 p-8 rounded-sm group hover:border-[#B91C1C]/30 transition-all duration-500 shadow-xl"
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#B91C1C]/10 rounded-sm text-[#B91C1C]">
                            <Quote size={16} fill="currentColor" />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-black/20 tracking-[0.3em] uppercase">Testimonial 0{i+1}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[1,2,3].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-black/10" />)}
                        </div>
                      </div>
                      <p className="font-sans text-lg md:text-xl text-[#1A1A1A] leading-relaxed font-medium italic">
                        "{rev}"
                      </p>
                      <div className="pt-6 border-t border-black/5 flex justify-end">
                        <span className="font-bold text-[10px] text-black/20 uppercase tracking-widest">— Verified Patron</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="h-full border-2 border-dashed border-black/5 flex flex-col items-center justify-center p-20 rounded-sm space-y-4">
                    <Quote size={40} className="text-black/5" />
                    <p className="font-display text-2xl text-black/10 uppercase tracking-widest">Awaiting Manifest...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4. Right: Large Poster */}
          <div className="w-full lg:w-[380px] shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`poster-${current.id}`}
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[2/3] border border-black/10 shadow-2xl overflow-hidden group rounded-sm"
              >
                <img src={current.posterUrl} alt={current.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-10 left-10 right-10 space-y-2">
                  <p className="font-bold text-[10px] text-[#B91C1C] tracking-[0.4em] uppercase">Now Archives</p>
                  <p className="font-display text-3xl text-white uppercase tracking-tight leading-none drop-shadow-lg">{current.title}</p>
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