import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaTabProps {
  data: { title: string; stillCutUrls: string[]; };
}

const MediaTab = ({ data }: MediaTabProps) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  const mainViewerRef = useRef<HTMLDivElement>(null); // 💡 메인 뷰어 스크롤용 Ref 추가!

  useEffect(() => {
    // 💡 1. 썸네일 리스트는 "가로"로만 부드럽게 이동하게 해서 세로 튐 현상 원천 차단
    if (thumbnailRef.current && activeThumbRef.current) {
      const container = thumbnailRef.current;
      const thumb = activeThumbRef.current;
      const scrollPosition = thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    // 💡 2. 큰 이미지가 바뀔 때마다 메인 뷰어를 화면 "정중앙(center)"으로 끌고 옴
    if (mainViewerRef.current) {
      mainViewerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // 화면 중앙 배치 핵심 속성!
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
      <div className="py-40 text-center border-2 border-dashed border-black/5 rounded-sm bg-[#FDFDFD]">
        <ImageIcon size={48} className="mx-auto mb-6 text-black/5" />
        <p className="font-display text-3xl text-black/10 uppercase tracking-widest text-center">
          Archive Empty • No Still Cuts
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-24 pb-40 relative font-sans">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end mb-16 border-b border-black/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[#B91C1C]"></div>
            <span className="font-mono text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.5em]">Visual Records</span>
          </div>
          <h3 className="font-display text-6xl uppercase tracking-tighter text-[#1A1A1A] leading-none">
            Still <span className="text-black/20">Cuts</span>
          </h3>
        </div>
        <div className="font-mono text-xl font-bold text-black/40 tracking-widest italic">
          {String(selectedIdx + 1).padStart(2, '0')} / {String(data.stillCutUrls.length).padStart(2, '0')}
        </div>
      </div>

      {/* 2. Main Viewer: 💡 ref={mainViewerRef} 적용 */}
      <div className="relative group flex flex-col items-center" ref={mainViewerRef}>
        <div className="relative w-full aspect-[16/9] border border-black/5 bg-[#1A1A1A] shadow-2xl overflow-hidden rounded-sm">
          <AnimatePresence mode="wait">
            <motion.img 
              key={selectedIdx}
              src={data.stillCutUrls[selectedIdx]} 
              alt="Main Still" 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-contain" 
            />
          </AnimatePresence>
          
          {/* Navigation Arrows */}
          <button 
            onClick={handlePrev} 
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 p-5 text-white/40 hover:text-white transition-all bg-black/20 hover:bg-[#B91C1C] rounded-full backdrop-blur-md border border-white/10"
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>

          <button 
            onClick={handleNext} 
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 p-5 text-white/40 hover:text-white transition-all bg-black/20 hover:bg-[#B91C1C] rounded-full backdrop-blur-md border border-white/10"
          >
            <ChevronRight size={32} strokeWidth={3} />
          </button>

          {/* Subtle Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
        
        {/* Caption */}
        <div className="mt-10 text-center">
          <p className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-[0.6em]">KINO ARCHIVAL EXHIBITION • FRAME {selectedIdx + 1}</p>
        </div>
      </div>

      {/* 3. Thumbnail Slider */}
      <div className="relative px-24">
        <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-black/20 hover:text-[#B91C1C] transition-all">
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
        
        <div ref={thumbnailRef} className="flex items-center gap-8 overflow-hidden scroll-smooth no-scrollbar py-6">
          {data.stillCutUrls.map((url, idx) => (
            <div 
              key={idx} 
              ref={selectedIdx === idx ? activeThumbRef : null}
              onClick={() => setSelectedIdx(idx)}
              className={`relative shrink-0 w-[calc(25%-24px)] aspect-[16/10] border transition-all duration-500 cursor-pointer overflow-hidden rounded-sm
                ${selectedIdx === idx ? 'border-[#B91C1C] scale-110 z-10 shadow-2xl' : 'border-black/5 opacity-40 hover:opacity-100'}`}
            >
              <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-black/20 hover:text-[#B91C1C] transition-all">
          <ChevronRight size={48} strokeWidth={1} />
        </button>
      </div>
      
      {/* 4. Gallery Toggle */}
      <div className="flex flex-col items-center gap-16 pt-20">
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="flex flex-col items-center gap-6 group"
        >
          <span className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.6em] group-hover:text-[#B91C1C] transition-colors">
            {showAll ? 'Close Archive' : 'Expand Full Gallery'}
          </span>
          <div className={`w-14 h-14 border border-black/10 flex items-center justify-center transition-all duration-500 rounded-full group-hover:border-[#B91C1C] group-hover:bg-[#B91C1C] group-hover:text-white ${showAll ? 'rotate-180' : ''}`}>
            <ChevronRight size={24} strokeWidth={3} className="rotate-90" />
          </div>
        </button>

        {showAll && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 w-full animate-in fade-in slide-in-from-top-8 duration-700 font-sans">
            {data.stillCutUrls.map((url, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -10 }}
                className="group relative aspect-[16/10] border border-black/5 bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden rounded-sm"
                onClick={() => {
                  setSelectedIdx(idx);
                  // 💡 기존의 딱딱한 하드코딩 스크롤 제거 (위의 useEffect가 자동으로 멋지게 센터링 해줍니다!)
                }}
              >
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-all duration-700" />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                   <Maximize2 size={32} className="text-white/60" />
                   <span className="font-display text-white text-2xl uppercase tracking-tighter border-b border-white/30 pb-1">View Frame</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTab;