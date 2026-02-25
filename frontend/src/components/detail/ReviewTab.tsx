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
    <div className="max-w-7xl mx-auto py-16 bg-white text-black font-sans">
      {/* 1. 상단 총평수 및 본 영화 등록 버튼 */}
      <div className="flex justify-between items-center mb-10 border-b border-zinc-100 pb-6">
        <h3 className="text-2xl font-bold">
          영화 제목에 대한 <span className="text-purple-700">{totalCount.toLocaleString()}</span>개의 이야기가 있어요!
        </h3>
      </div>

      {/* 2. 정렬 필터 */}
      <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
        <span>전체 {totalCount} 건</span>
        <div className="flex gap-4">
          <button onClick={() => onSortChange('id,desc')} className={currentSort.includes('id') ? 'text-black' : ''}>최신순</button>
          <span className="text-zinc-200">|</span>
          <button onClick={() => onSortChange('averageScore,desc')} className={currentSort.includes('averageScore') ? 'text-black underline underline-offset-4' : ''}>평점순</button>
        </div>
      </div>

      {/* 3. 관람평 쓰기 안내 섹션 */}
      <div className="flex items-start gap-8 p-8 bg-zinc-50/50 rounded-lg border border-zinc-100 mb-8 relative">
        <div className="w-12 h-12 rounded-full bg-[#503396] flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-purple-100">
          K
        </div>
        <div className="flex-1 pt-1">
          <p className="text-zinc-800 font-bold mb-1 leading-relaxed">
            재미있게 보셨나요? 영화의 어떤 점이 좋았는지 이야기해주세요.
          </p>
          <p className="text-zinc-400 text-xs">포인트는 관람평 최대 10편까지 지급 가능합니다.</p>
        </div>
        {/* 나중에 모달과 연결될 클릭 포인트 */}
        <button onClick={onWriteClick} className="flex items-center gap-2 text-zinc-400 hover:text-purple-600 transition-all absolute right-8 top-1/2 -translate-y-1/2">
           <span className="text-sm font-bold">관람평쓰기</span>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      {/* 4. 리뷰 리스트 */}
      <div className="divide-y divide-zinc-100 border-t border-zinc-100">
        {reviews.map((r) => (
          <div key={r.id} className="py-12 flex items-start gap-12 group">
            {/* 프로필 이미지 및 닉네임 하단 배치 */}
            <div className="flex flex-col items-center w-24 shrink-0 gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100">
                {r.profileImage && r.profileImage !== 'default' ? (
                  <img src={r.profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <span className="text-[11px] font-bold text-zinc-400 text-center leading-tight">
                {r.maskedUsername}
              </span>
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-zinc-300 uppercase">관람평</span>
                  <span className="text-4xl font-black text-[#503396] leading-none">{r.averageScore.toFixed(1)}</span>
                  <div className="text-[11px] text-purple-500 font-bold border-l pl-4 border-zinc-100 leading-tight">
                    {r.topKeywords.split('·').map(k => <div key={k}>{k}</div>)}
                  </div>
                </div>
              </div>
              <p className="text-zinc-800 text-lg leading-relaxed font-medium">{r.content}</p>
            </div>
            
            <div className="text-right">
              <span className="text-[11px] text-zinc-300 font-mono font-bold">{r.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. 동적 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-10 h-10 border text-sm font-bold transition-all ${currentPage === i ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-900'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewTab;