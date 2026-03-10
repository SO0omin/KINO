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

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex items-center">
      
      {/* 1. Background Trailer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
          <iframe
            src={videoSrc}
            className="w-full h-full object-cover scale-110"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Background Trailer"
          />
        </div>
      </div>

      {/* 2. Cinematic Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-white" />
      </div>

      {/* 3. Content Area */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-bold tracking-[0.2em] text-[#B91C1C] uppercase">
                <span>Adventure / Action</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span>120 min</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <div className="flex items-center gap-1 text-white">
                  <Star size={14} fill="#FFD700" stroke="#FFD700" />
                  <span>IMDB {currentMovie.avgRating.toFixed(1)}</span>
                </div>
              </div>
              
              <h1 className="font-display text-7xl md:text-9xl text-white leading-none tracking-tight uppercase drop-shadow-2xl">
                {currentMovie.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                className="btn-primary flex items-center gap-3 px-10 py-4"
              >
                <Play size={20} fill="currentColor" />
                <span>Watch Trailer</span>
              </button>
              
              <button 
                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-10 rounded-sm transition-all duration-300 uppercase tracking-wider flex items-center gap-3 border border-white/10"
              >
                <Info size={20} />
                <span>Details</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Slider Navigation (Bottom Right) */}
      <div className="absolute bottom-12 right-10 z-50 flex flex-col items-end gap-6">
        <div className="flex items-center gap-4">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                activeIndex === idx ? 'w-16 bg-[#B91C1C]' : 'w-4 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="font-mono text-sm text-white/40 font-bold tracking-widest">
          {String(activeIndex + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
        </div>
      </div>

      {/* 5. Side Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 right-10 z-50 hidden md:flex flex-col gap-4">
        <button 
          onClick={() => setActiveIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1))}
          className="p-4 border border-white/10 rounded-sm hover:bg-[#B91C1C] hover:border-[#B91C1C] transition-all duration-300 text-white group"
        >
          <ChevronLeft size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setActiveIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1))}
          className="p-4 border border-white/10 rounded-sm hover:bg-[#B91C1C] hover:border-[#B91C1C] transition-all duration-300 text-white group"
        >
          <ChevronRight size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* 6. Decorative Side Elements */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-15 pointer-events-none opacity-80" />
    </section>
  );
};

export default HeroSection;
