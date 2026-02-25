
import React, { useState, useRef, useEffect } from 'react';

interface MediaTabProps {
  data: { title: string; stillCutUrls: string[]; };
}

const MediaTab = ({ data }: MediaTabProps) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeThumbRef.current && thumbnailRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedIdx]);

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev === 0 ? data.stillCutUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev === data.stillCutUrls.length - 1 ? 0 : prev + 1));
  };

  if (!data.stillCutUrls || data.stillCutUrls.length === 0) {
    return (
      <div className="py-40 text-center border-4 border-dashed border-black/10 rounded-3xl">
        <p className="font-serif italic text-3xl text-black/20 uppercase tracking-[0.2em]">Archive Empty • No Still Cuts</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-40 relative">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end mb-12 border-b-[6px] border-black pb-8">
        <div className="space-y-2">
          <span className="font-typewriter text-[10px] text-black/40 tracking-[0.5em] uppercase">Visual Records</span>
          <h3 className="font-serif text-5xl italic tracking-tighter text-black uppercase leading-none">
            Still <span className="bg-black text-white px-4">Cuts</span>
          </h3>
        </div>
        <span className="font-mono text-lg font-bold text-black/40 tracking-widest italic">
          {String(selectedIdx + 1).padStart(2, '0')} / {String(data.stillCutUrls.length).padStart(2, '0')}
        </span>
      </div>

      {/* 2. Main Viewer - Framed like a Cinema Screen */}
      <div className="relative group flex flex-col items-center">
        <div className="relative w-full aspect-[16/9] border-[12px] border-black bg-black shadow-[30px_30px_0_0_rgba(0,0,0,0.1)] overflow-hidden">
          <img 
            src={data.stillCutUrls[selectedIdx]} 
            alt="Main Still" 
            className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-1000" 
          />
          
          {/* Navigation Arrows */}
          <button 
            onClick={handlePrev} 
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 p-4 text-white/40 hover:text-white transition-all bg-black/20 hover:bg-black/60 rounded-full backdrop-blur-sm border border-white/10"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <button 
            onClick={handleNext} 
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 p-4 text-white/40 hover:text-white transition-all bg-black/20 hover:bg-black/60 rounded-full backdrop-blur-sm border border-white/10"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Film Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        
        {/* Caption */}
        <div className="mt-8 text-center">
          <p className="font-typewriter text-xs text-black/40 uppercase tracking-[0.4em]">Property of Golden Age Cinema Exhibitions • Frame {selectedIdx + 1}</p>
        </div>
      </div>

      {/* 3. Thumbnail Slider - Film Strip Style */}
      <div className="relative px-20">
        <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-black/20 hover:text-black transition-all">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <div ref={thumbnailRef} className="flex items-center gap-6 overflow-hidden scroll-smooth no-scrollbar py-4">
          {data.stillCutUrls.map((url, idx) => (
            <div 
              key={idx} 
              ref={selectedIdx === idx ? activeThumbRef : null}
              onClick={() => setSelectedIdx(idx)}
              className={`relative shrink-0 w-[calc(25%-18px)] aspect-[16/10] border-[4px] transition-all duration-500 cursor-pointer overflow-hidden
                ${selectedIdx === idx ? 'border-black scale-110 z-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]' : 'border-black/10 opacity-40 hover:opacity-100'}`}
            >
              <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover grayscale" />
              {/* Film Sprocket Holes (Decorative) */}
              <div className="absolute top-1 left-0 right-0 flex justify-around px-1">
                {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-black/20 rounded-sm" />)}
              </div>
              <div className="absolute bottom-1 left-0 right-0 flex justify-around px-1">
                {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-black/20 rounded-sm" />)}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-black/20 hover:text-black transition-all">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      
      {/* 4. Gallery Toggle */}
      <div className="flex flex-col items-center gap-16 pt-12">
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="flex flex-col items-center gap-4 group"
        >
          <span className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.5em] group-hover:text-black transition-colors">
            {showAll ? 'Close Archive' : 'Expand Full Gallery'}
          </span>
          <div className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-transform duration-500 ${showAll ? 'rotate-180' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
          </div>
        </button>

        {showAll && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full animate-in fade-in slide-in-from-top-8 duration-700">
            {data.stillCutUrls.map((url, idx) => (
              <div 
                key={idx} 
                className="group relative aspect-[16/10] border-[4px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] hover:shadow-[12px_12px_0_0_#000] hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedIdx(idx);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="font-serif italic text-white text-lg border-b border-white/30 pb-1">View Frame</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTab;
