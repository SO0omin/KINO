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
    <section className="pt-10 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
         <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Box Office <span className="text-purple-500 text-sm not-italic ml-2 font-medium">실시간 예매 순위</span>
        </h2>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {movies.map((movie, index) => (
          <div key={movie.id} className="group relative w-48 md:w-56">
            <span className="absolute -left-4 -top-4 text-6xl font-black italic text-white/80 drop-shadow-lg z-20">
              {index + 1}
            </span>

            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 shadow-2xl">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-700">NO POSTER</div>
              )}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                <button 
                  onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })}
                  className="w-full py-2 bg-purple-600 text-white text-sm font-bold rounded hover:bg-purple-700 transition-colors"
                >
                  예매하기
                </button>
                <button 
                  onClick={() => navigate(`/movies/${movie.id}`)}
                  className="w-full py-2 bg-transparent border border-white/50 text-white text-sm font-bold rounded hover:bg-white/20 transition-colors"
                >
                  상세정보
                </button>
              </div>
            </div>

            <div className="mt-3 text-center">
              <h3 className="text-base font-bold truncate text-white">{movie.title}</h3>
              <div className="mt-1 flex justify-center items-center gap-1 text-yellow-500 text-sm">
                <span>★</span>
                <span className="text-zinc-300">{movie.avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RankingSection;