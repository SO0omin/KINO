import React, { useState, useRef, useEffect } from 'react';

interface MediaTabProps {
  data: { title: string; stillCutUrls: string[]; };
}

const MediaTab = ({ data }: MediaTabProps) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);

  // ✨ 선택된 썸네일이 바뀔 때마다 해당 썸네일이 화면 안으로 들어오도록 자동 스크롤
  useEffect(() => {
    if (activeThumbRef.current && thumbnailRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedIdx]);

  // 메인 및 하단 화살표 공용 이동 로직
  const handlePrev = () => {
    setSelectedIdx((prev) => (prev === 0 ? data.stillCutUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev === data.stillCutUrls.length - 1 ? 0 : prev + 1));
  };

  if (!data.stillCutUrls || data.stillCutUrls.length === 0) {
    return <div className="py-40 text-center text-zinc-700 font-black italic tracking-widest border-2 border-dashed border-zinc-900 rounded-2xl">STILL CUTS COMING SOON</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-40 relative">
      
      {/* 1. 상단 타이틀 & 카운트 */}
      <div className="flex justify-between items-end mb-10 border-b border-zinc-900 pb-6 text-white">
        <h3 className="text-xl font-black uppercase tracking-[0.2em] italic">Still Cuts</h3>
        <span className="text-sm font-mono text-zinc-500 font-bold">{String(selectedIdx + 1).padStart(2, '0')} / {String(data.stillCutUrls.length).padStart(2, '0')}</span>
      </div>

      {/* 2. 메인 스틸컷 뷰어 */}
      <div className="relative group flex items-center justify-center">
        <button 
          onClick={handlePrev} 
          className="absolute left-6 z-10 p-2 text-zinc-400/30 hover:text-white transition-all bg-black/10 hover:bg-black/40 rounded-full backdrop-blur-[2px]"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
          <img src={data.stillCutUrls[selectedIdx]} alt="Main" className="w-full h-full object-contain" />
        </div>

        <button 
          onClick={handleNext} 
          className="absolute right-6 z-10 p-2 text-zinc-400/30 hover:text-white transition-all bg-black/10 hover:bg-black/40 rounded-full backdrop-blur-[2px]"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* 3. 하단 썸네일 슬라이더 */}
      <div className="relative px-16">
        <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-zinc-600 hover:text-white transition-all">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <div ref={thumbnailRef} className="flex items-center gap-4 overflow-hidden scroll-smooth no-scrollbar">
          {data.stillCutUrls.map((url, idx) => (
            <div 
              key={idx} 
              ref={selectedIdx === idx ? activeThumbRef : null}
              onClick={() => setSelectedIdx(idx)}
              className={`relative shrink-0 w-[calc(25%-12px)] aspect-[16/10] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 
                ${selectedIdx === idx ? 'border-purple-600 scale-105 z-10 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-zinc-600 hover:text-white transition-all">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      
      {/* 4. 갤러리 토글 섹션 (나열 형식) */}
      <div className="flex flex-col items-center gap-16 pt-10">
        <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-3 text-zinc-600 hover:text-purple-400 transition-colors group">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{showAll ? 'Close Gallery' : 'All Image Gallery'}</span>
          <svg className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
        </button>

        {showAll && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            {data.stillCutUrls.map((url, idx) => (
              <div 
                key={idx} 
                className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer"
                onClick={() => {
                  setSelectedIdx(idx);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-[10px] font-black text-white border border-white/30 px-3 py-1 rounded-full uppercase tracking-tighter">View Focus</span>
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