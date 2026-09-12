import React from 'react';
import { Edit3, Star, ChevronRight, Quote, User } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto py-16 font-sans">
      
      {/* 1. Header: AI 스튜디오의 세련된 라인 포인트 적용 */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-black/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[#B91C1C]"></div>
            <span className="font-mono text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.6em]">Audience Archive</span>
          </div>
          <h3 className="font-display text-6xl uppercase tracking-tighter text-[#1A1A1A] leading-none">
            Patron <span className="text-black/10">Ledger</span>
          </h3>
        </div>
        <div className="text-right mt-6 md:mt-0">
          <p className="font-mono text-[10px] font-bold text-black/40 tracking-widest uppercase">
            Total Entries cataloged: <span className="text-[#B91C1C] text-xl font-display ml-2">{totalCount.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* 2. Controls: 모던한 캡슐형 정렬 버튼 & 강렬한 레드 작성 버튼 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-8 bg-black/5 p-1 rounded-sm">
          <button 
            onClick={() => onSortChange('id,desc')} 
            className={`px-6 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm ${
              currentSort.includes('id') 
                ? 'bg-white text-[#B91C1C] shadow-sm' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Chronological
          </button>
          <button 
            onClick={() => onSortChange('averageScore,desc')} 
            className={`px-6 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm ${
              currentSort.includes('averageScore') 
                ? 'bg-white text-[#B91C1C] shadow-sm' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Critical Acclaim
          </button>
        </div>

        <button 
          onClick={onWriteClick} 
          className="group flex items-center gap-4 px-10 py-5 bg-[#B91C1C] text-white hover:bg-[#1A1A1A] transition-all shadow-xl active:scale-[0.98] rounded-sm"
        >
          <span className="font-display text-xl uppercase tracking-tight font-sans">Write Review</span>
          <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* 3. Review List: AI 스튜디오의 그림자 강조형 카드 스타일 */}
      <div className="grid grid-cols-1 gap-10">
        {reviews.map((r) => (
          <div key={r.id} className="group flex flex-col md:flex-row items-stretch bg-white border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm overflow-hidden">
            
            {/* Left Section (Profile): 아카이브 스타일의 프로필 영역 */}
            <div className="w-full md:w-56 bg-[#FDFDFD] border-b md:border-b-0 md:border-r border-black/5 p-10 flex flex-col items-center justify-center gap-6 shrink-0">
              <div className="w-24 h-24 rounded-full border border-black/5 bg-white overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500">
                {r.profileImage && r.profileImage !== 'default' ? (
                  <img src={r.profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black/5 flex items-center justify-center text-black/20">
                    <User size={40} />
                  </div>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="font-mono text-[9px] font-bold text-black/20 uppercase tracking-widest">Patron ID</p>
                <p className="font-mono text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tighter">{r.maskedUsername}</p>
              </div>
            </div>
            
            {/* Right Section (Content): 넓은 여백과 큼직한 타이포그래피 */}
            <div className="flex-1 p-12 flex flex-col justify-between relative">
              <div className="space-y-8">
                <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-bold text-black/20 uppercase tracking-widest mb-1">Score</span>
                    <span className="font-display text-5xl text-[#1A1A1A] leading-none group-hover:text-[#B91C1C] transition-colors font-sans">
                        {r.averageScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-12 w-px bg-black/5"></div>
                  <div className="flex flex-col flex-1">
                    <span className="font-mono text-[9px] font-bold text-[#B91C1C] uppercase tracking-widest mb-2">Highlights</span>
                    <div className="flex flex-wrap gap-2">
                      {/* 💡 류진님의 기존 키워드 분리 로직 유지 */}
                      {r.topKeywords.split('·').map(k => (
                        <span key={k} className="font-mono text-[9px] font-bold text-black/40 border border-black/5 px-3 py-1 uppercase bg-black/5 group-hover:border-[#B91C1C]/20 transition-colors">
                          {k.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* 💡 따옴표 데코레이션 추가 */}
                <div className="relative">
                  <Quote size={40} className="absolute -left-6 -top-6 text-black/[0.03] group-hover:text-[#B91C1C]/5 transition-colors" />
                  <p className="text-2xl text-[#1A1A1A]/70 leading-relaxed font-medium italic relative z-10">
                    "{r.content}"
                  </p>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-black/5 flex justify-between items-center">
                <div className="flex gap-2">
                  {[1,2,3].map(s => <div key={s} className="w-1.5 h-1.5 bg-[#B91C1C]/20 rounded-full" />)}
                </div>
                <span className="font-mono text-[10px] text-black/20 font-bold uppercase tracking-[0.3em]">{r.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Pagination: AI 스타일의 볼드한 사각형 버튼 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-24 gap-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-14 h-14 border border-black/5 font-display text-xl transition-all shadow-sm rounded-sm ${
                currentPage === i 
                  ? 'bg-[#1A1A1A] text-white shadow-xl scale-110 z-10' 
                  : 'bg-white text-black/40 hover:text-[#B91C1C] hover:border-[#B91C1C]'
              }`}
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