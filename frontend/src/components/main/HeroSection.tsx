import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MovieDTO } from '../../types/main';

interface HeroSectionProps {
  movies: MovieDTO[];
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  
  const videoId = currentMovie.trailerUrl?.split('/').pop()?.split('?')[0] || '';
  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`;

  // 슬라이드 이동 함수
  const nextSlide = () => setActiveIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setActiveIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  return (
    <section className="relative w-full h-[95vh] overflow-hidden bg-black flex items-center">
      
      {/* 1. 배경 트레일러 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentMovie.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <iframe
              src={videoSrc}
              className="w-full h-full object-cover scale-110"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="Hero Background Trailer"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. 시네마틱 오버레이 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* 좌측 텍스트 가독성을 위한 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        {/* 하단 섹션 연결을 위한 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* 3. 메인 콘텐츠 */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-bold tracking-[0.2em] text-[#B91C1C] uppercase font-mono">
                <span>Kino Exclusive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></span>
                <div className="flex items-center gap-1.5 text-white">
                  <Star size={16} fill="#FFD700" stroke="#FFD700" />
                  <span>{currentMovie.avgRating.toFixed(1)} / 10</span>
                </div>
              </div>
              
              <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                {currentMovie.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-5 pt-6">
              {/* 상세 페이지 이동 기능 유지 */}
              <button 
                onClick={() => navigate(`/ticketing`)}
                className="btn-primary flex items-center gap-3 px-12 py-5 rounded-sm shadow-[0_10px_20px_rgba(185,28,28,0.3)]"
              >
                <Play size={20} fill="currentColor" />
                <span className="text-lg">BOOK NOW</span>
              </button>
              
              <button 
                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-5 px-12 rounded-sm transition-all duration-300 uppercase tracking-widest flex items-center gap-3 border border-white/10"
              >
                <Info size={20} />
                <span className="text-lg">Details</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. 하단 네비게이션 인디케이터 */}
      <div className="absolute bottom-16 right-10 z-50 flex flex-col items-end gap-6">
        <div className="flex items-center gap-3">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                activeIndex === idx ? 'w-16 bg-[#B91C1C]' : 'w-4 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <div className="font-mono text-sm text-white/50 font-bold tracking-widest">
          {String(activeIndex + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
        </div>
      </div>

      {/* 5. 사이드 화살표 네비게이션 */}
      <div className="absolute top-1/2 -translate-y-1/2 right-10 z-50 hidden md:flex flex-col gap-4">
        <button 
          onClick={prevSlide}
          className="p-4 border border-white/10 rounded-sm hover:bg-[#B91C1C] hover:border-[#B91C1C] transition-all duration-300 text-white group"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-4 border border-white/10 rounded-sm hover:bg-[#B91C1C] hover:border-[#B91C1C] transition-all duration-300 text-white group"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      {/* 6. Decorative Side Elements */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-15 pointer-events-none opacity-80" />
    </section>
  );
};

export default HeroSection;
