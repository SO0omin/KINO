import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MovieDTO } from '../../types/main';

interface RankingSectionProps {
  movies: MovieDTO[];
}

const RankingSection = ({ movies }: RankingSectionProps) => {
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* 헤더 영역*/}
        <div className="flex items-center gap-4 md:gap-6 mb-16">
          <div className="h-px flex-1 bg-black/20"></div>
          <h2 className="font-serif text-3xl md:text-5xl italic tracking-tighter uppercase text-black text-center md:text-left">
            Box Office <span className="font-sans text-sm not-italic ml-2 md:ml-4 text-black/40 font-bold tracking-tight">실시간 예매 순위</span>
          </h2>
          <div className="h-px flex-1 bg-black/20"></div>
        </div>

        {/* 그리드 설정: 모바일 2열(grid-cols-2) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {movies.map((movie, index) => (
            <div key={movie.id} className="group relative">
              <span className="absolute -left-2 -top-6 md:-left-6 md:-top-10 font-serif text-7xl md:text-[120px] font-black italic text-black/10 select-none pointer-events-none z-0">
                {index + 1}
              </span>

              {/* 포스터 프레임 */}
              <div className="relative z-10">
                <div className="aspect-[2/3] w-full border-[4px] md:border-[6px] border-black bg-white shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000] overflow-hidden group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:shadow-[4px_4px_0_0_#000] transition-all duration-300">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-typewriter text-black/20">No Reel</div>
                  )}

                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                    <div className="border-2 border-white/20 p-2 md:p-4 w-full h-full flex flex-col items-center justify-center gap-3 md:gap-4">
                      <p className="font-typewriter text-white text-[10px] uppercase tracking-widest mb-1">Admit One</p>
                      <button 
                        onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })}
                        className="w-full py-2 md:py-3 bg-white text-black font-serif italic text-base md:text-lg hover:bg-purple-100 transition-colors"
                      >
                        Book Ticket
                      </button>
                      <button 
                        onClick={() => navigate(`/movies/${movie.id}`)}
                        className="w-full py-2 md:py-3 border border-white/30 text-white font-mono text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* 하단 영화 정보 */}
                <div className="mt-6 md:mt-8 space-y-2">
                  <h3 className="font-serif text-lg md:text-2xl italic text-black truncate uppercase tracking-tight">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between border-t border-black/10 pt-2">
                    <div className="flex items-center gap-1 text-black/60">
                      <span className="text-yellow-600 text-xs">★</span>
                      <span className="font-mono text-xs font-bold">{movie.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="font-typewriter text-[9px] md:text-[10px] text-black/40 uppercase">Top Chart</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RankingSection;