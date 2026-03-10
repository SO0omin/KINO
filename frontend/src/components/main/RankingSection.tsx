import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MovieDTO } from '../../types/main';

interface RankingSectionProps {
  movies: MovieDTO[];
}

const RankingSection = ({ movies }: RankingSectionProps) => {
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-32 relative bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.3em] uppercase text-xs">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>Trending Now</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-[#1A1A1A] uppercase tracking-tight leading-none">
              Box Office <span className="text-black/10">Ranking</span>
            </h2>
          </div>
          <button 
            onClick={() => navigate('/boxoffice')}
            className="flex items-center gap-2 text-black/40 hover:text-[#1A1A1A] transition-colors font-bold uppercase tracking-widest text-xs group"
          >
            <span>View All Movies</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">
          {movies.map((movie, index) => (
            <motion.div 
              key={movie.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              {/* Large Background Number */}
              <span className="absolute -left-6 -top-12 font-display text-[180px] text-black/[0.03] select-none pointer-events-none z-0 leading-none">
                {index + 1}
              </span>

              {/* Poster Frame */}
              <div className="relative z-10">
                <div className="relative aspect-[2/3] w-full bg-[#F5F5F5] overflow-hidden rounded-sm border border-black/5 group-hover:border-[#B91C1C]/50 transition-all duration-500 shadow-xl">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/10 font-bold uppercase tracking-widest">No Poster</div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                    <div className="space-y-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                      <button 
                        onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })}
                        className="w-full py-4 bg-[#B91C1C] text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#991B1B] transition-colors rounded-sm shadow-xl"
                      >
                        <Ticket size={18} />
                        <span>Book Ticket</span>
                      </button>
                      <button 
                        onClick={() => navigate(`/movies/${movie.id}`)}
                        className="w-full py-4 bg-white/10 backdrop-blur-md text-white font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors rounded-sm border border-white/10"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Movie Info */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#FFD700]">
                      <Star size={14} fill="currentColor" />
                      <span className="font-mono text-sm font-bold text-[#1A1A1A]">{movie.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-black/20 font-bold text-[10px] uppercase tracking-widest">IMDB Score</span>
                  </div>
                  <h3 className="font-display text-2xl text-[#1A1A1A] uppercase tracking-tight group-hover:text-[#B91C1C] transition-colors truncate">
                    {movie.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RankingSection;
