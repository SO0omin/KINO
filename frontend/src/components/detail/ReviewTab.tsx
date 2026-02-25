
import React from 'react';

interface ReviewDTO {
  id: number;
  maskedUsername: string;
  profileImage: string | null;
  content: string;
  averageScore: number;
  topKeywords: string;
  createdAt: string;
}

interface ReviewTabProps {
  totalCount: number;
  reviews: ReviewDTO[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  onWriteClick: () => void;
}

const ReviewTab = ({ totalCount, reviews, currentPage, onPageChange, onSortChange, currentSort, onWriteClick }: ReviewTabProps) => {
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="max-w-7xl mx-auto py-16">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-[6px] border-black pb-10">
        <div className="space-y-4">
          <span className="font-typewriter text-[10px] text-black/40 tracking-[0.6em] uppercase">Audience Archive</span>
          <h3 className="font-serif text-5xl italic tracking-tighter text-black uppercase leading-none">
            Patron <span className="bg-black text-white px-4">Ledger</span>
          </h3>
        </div>
        <div className="text-right mt-6 md:mt-0">
          <p className="font-mono text-sm font-bold text-black tracking-widest">
            TOTAL ENTRIES: <span className="text-red-800">{totalCount.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onSortChange('id,desc')} 
            className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-all ${currentSort.includes('id') ? 'text-black font-black border-b-2 border-black' : 'text-black/30 hover:text-black'}`}
          >
            Chronological
          </button>
          <button 
            onClick={() => onSortChange('averageScore,desc')} 
            className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-all ${currentSort.includes('averageScore') ? 'text-black font-black border-b-2 border-black' : 'text-black/30 hover:text-black'}`}
          >
            Critical Acclaim
          </button>
        </div>

        <button 
          onClick={onWriteClick} 
          className="group flex items-center gap-4 px-8 py-4 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <span className="font-serif italic text-lg tracking-tight">Write Review</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      {/* 3. Review List - Ticket Style */}
      <div className="space-y-10">
        {reviews.map((r, i) => (
          <div key={r.id} className="relative flex flex-col md:flex-row items-stretch border-[4px] border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-[12px_12px_0_0_#000] transition-all">
            {/* Ticket Stub (Left) */}
            <div className="w-full md:w-48 bg-[#f4f1ea]/50 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black p-8 flex flex-col items-center justify-center gap-4 shrink-0 relative">
              {/* Perforation Effect */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5F2ED] border-2 border-black hidden md:block"></div>
              
              <div className="w-20 h-20 rounded-full border-2 border-black bg-white overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                {r.profileImage && r.profileImage !== 'default' ? (
                  <img src={r.profileImage} alt="profile" className="w-full h-full object-cover grayscale" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mt-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <div className="text-center">
                <p className="font-mono text-[9px] font-bold text-black/40 uppercase tracking-tighter mb-1">Patron ID</p>
                <p className="font-typewriter text-[11px] text-black uppercase">{r.maskedUsername}</p>
              </div>
            </div>
            
            {/* Ticket Body (Right) */}
            <div className="flex-1 p-10 flex flex-col justify-between relative">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="font-typewriter text-[9px] text-black/40 uppercase tracking-widest mb-1">Score</span>
                    <span className="font-serif text-5xl font-black italic text-black leading-none">{r.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="h-12 w-px bg-black/10 mx-2"></div>
                  <div className="flex flex-col">
                    <span className="font-typewriter text-[9px] text-black/40 uppercase tracking-widest mb-2">Highlights</span>
                    <div className="flex flex-wrap gap-2">
                      {r.topKeywords.split('·').map(k => (
                        <span key={k} className="font-mono text-[9px] font-bold text-red-800 border border-red-800/20 px-2 py-0.5 uppercase">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-serif italic text-2xl text-black/80 leading-relaxed">"{r.content}"</p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-end">
                <div className="flex gap-1">
                  {[1,2,3].map(s => <div key={s} className="w-1.5 h-1.5 bg-black/10 rounded-full" />)}
                </div>
                <span className="font-mono text-[10px] text-black/20 font-bold uppercase tracking-[0.3em]">{r.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-20 gap-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-12 h-12 border-[3px] border-black font-mono text-sm font-bold transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] ${currentPage === i ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-black hover:bg-[#f4f1ea]'}`}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewTab;
