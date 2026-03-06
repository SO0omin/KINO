import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <section className="relative w-full h-[90vh] overflow-hidden bg-black flex items-center justify-center">
      
      {/* 1. 배경 트레일러*/}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute min-w-full min-h-full w-[300%] h-[300%] top-[-100%] left-[-100%]">
          <iframe
            src={videoSrc}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Background Trailer"
          />
        </div>
      </div>

      {/* 2. 시네마틱 비네팅 & 그레인 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_100%)] opacity-70" />
        <div className="absolute inset-0 opacity-10 mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 3. 중앙 영화관 스크린 프레임 & 내부 정보 (하이브리드 핵심) */}
      <div className="relative z-20 w-full max-w-6xl px-4 md:px-0 aspect-video border-[16px] border-[#151515] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden rounded-sm group">

        {/* 비디오 레이어 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-zinc-900">
           <iframe
            src={videoSrc}
            className="absolute w-[115%] h-[115%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-[2000ms] group-hover:scale-110"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Screen Trailer"
          />
        </div>

        {/* 영화 정보 오버레이 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-30 pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex justify-between items-end z-40 pointer-events-none">
          {/* 좌측: 타이틀 정보 */}
          <div className="animate-fadeIn">
            <h1 className="font-serif text-4xl md:text-7xl italic text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
              {currentMovie.title}
            </h1>
            <p className="font-mono text-[10px] md:text-sm text-white/70 uppercase tracking-[0.4em] italic">
              Now Showing • KINO Exclusive
            </p>
          </div>

          {/* 우측: View Details 버튼 */}
          <div className="pointer-events-auto">
            <button 
              onClick={() => navigate(`/movie-detail/${currentMovie.id}`)}
              className="px-6 py-2.5 md:px-10 md:py-4 bg-white text-black font-serif italic text-sm md:text-lg hover:bg-[#f4f1ea] transition-all shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-tight"
            >
              View Details
            </button>
          </div>
        </div>

        {/* 전체 클릭 차단 레이어 */}
        <div className="absolute inset-0 z-30 pointer-events-none" />
      </div>

      {/* 4. 슬라이더 네비게이션 */}
      <div className="absolute bottom-12 md:bottom-20 right-10 md:right-24 z-50 flex items-center gap-6">
        <div className="flex items-center gap-4">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1 transition-all duration-500 ${
                activeIndex === idx ? 'w-12 md:w-16 bg-white' : 'w-3 md:w-4 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="font-mono text-[10px] text-white/40 italic tracking-widest">
          {String(activeIndex + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
        </div>
      </div>

      {/* 5. 사이드 데코레이션 */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none opacity-60" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none opacity-60" />

    </section>
  );
};

export default HeroSection;