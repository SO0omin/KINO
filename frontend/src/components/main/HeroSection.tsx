import React, { useState } from 'react';
import type { MovieDTO } from '../../types/main';

interface HeroSectionProps {
  movies: MovieDTO[];
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  
  // URL 파라미터는 동일합니다.
  const videoSrc = `${currentMovie.trailerUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentMovie.trailerUrl?.split('/').pop()}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3`;

  return (
    // 1. 섹션 높이를 화면의 95%로 높게 잡고 overflow를 숨깁니다.
    <section className="relative w-full h-[80vh] overflow-hidden bg-black">
      
      {/* 2. 배경 유튜브 트레일러 (CSS 트릭 적용) */}
      {/* pointer-events-none으로 클릭 방지 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 이 래퍼 div를 엄청 크게 만들어서 가운데 정렬하는 것이 핵심 트릭입니다! */}
        <div className="absolute min-w-full min-h-full w-[300%] h-[300%] top-[-100%] left-[-100%]">
            <iframe
              src={videoSrc}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title={currentMovie.title}
              style={{ pointerEvents: 'none' }} // 이중 안전 장치
            />
        </div>
      </div>

      {/* 3. 상하 비네팅: 중앙은 선명, 위/아래로 갈수록 어두워짐 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(10,10,10,1) 0%,
                rgba(10,10,10,0.4) 15%,
                rgba(10,10,10,0) 40%,
                rgba(10,10,10,0) 60%,
                rgba(10,10,10,0.4) 85%,
                rgba(10,10,10,1) 100%
              )
            `,
          }}
        />
      </div>


      {/* 4. 영화 정보 텍스트 (z-index 20으로 그라데이션 위로 확실히 배치) */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end items-start pb-32"> 
        <div className="space-y-4 animate-fadeIn max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] text-white">
            {currentMovie.title}
          </h1>
          <p className="text-zinc-200 text-lg drop-shadow-md font-medium">
            지금 바로 KINO에서 가장 압도적인 스케일의 영화를 확인하세요.
          </p>
        </div>
      </div>

      {/* 5. 슬라이더 네비게이션 */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              activeIndex === idx ? 'w-12 bg-purple-500' : 'w-3 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;