import React from 'react';

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: number;
  reservationNumber: string;
  content: string;
  setContent: (val: string) => void;
  scores: {
    scoreDirection: number;
    scoreStory: number;
    scoreVisual: number;
    scoreActor: number;
    scoreOst: number;
  };
  setScores: (newScores: any) => void;
  onSubmit: () => void;
}

const ReviewWriteModal = ({
  isOpen, onClose, movieTitle, content, setContent, scores, setScores, onSubmit
}: ReviewWriteModalProps) => {

  if (!isOpen) return null;

  const categories = [
    { key: 'scoreDirection', label: 'Direction' },
    { key: 'scoreStory', label: 'Story' },
    { key: 'scoreVisual', label: 'Visual' },
    { key: 'scoreActor', label: 'Actor' },
    { key: 'scoreOst', label: 'OST' },
  ];

  // AI 스튜디오 스타일의 스코어 셀렉터 (원본 select 기능 유지)
  const ScoreSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex flex-col items-center gap-2 font-sans">
      <span className="font-mono text-[9px] font-bold uppercase text-black/40 tracking-widest">{label}</span>
      <select 
        title={`${label} 점수 선택`}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-black/10 bg-white text-[11px] font-mono font-bold p-2 outline-none focus:border-[#B91C1C] rounded-sm shadow-sm cursor-pointer"
      >
        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm font-sans">
      <div className="w-full max-w-xl rounded-sm border border-black/5 bg-white p-12 shadow-2xl relative">
        
        {/* 1. Header: 모던 레드 포인트 헤더 */}
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px w-12 bg-[#B91C1C]"></div>
          <p className="font-mono text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.5em]">Patron Feedback</p>
        </div>
        <h3 className="font-display text-3xl uppercase tracking-tighter mb-5 text-[#1A1A1A]">
          Review <span className="text-black/10">Ledger</span>
        </h3>
        
        <div className="space-y-1">
          {/* 2. 영화 제목 정보: Anton 폰트로 강조 */}
          <div className="space-y-3">
            <label className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-black/20">Verified Feature</label>
            <div className="w-full border border-black/5 p-5 bg-[#FDFDFD] text-1xl font-display uppercase tracking-tight text-[#1A1A1A] rounded-sm shadow-sm">
              {movieTitle}
            </div>
          </div>

          {/* 3. 5가지 항목 점수 선택: 입체적인 그리드 레이아웃 */}
          <div className="grid grid-cols-5 gap-4 p-6 bg-black/5 border border-black/5 rounded-sm shadow-inner">
            {categories.map(cat => (
              <ScoreSelector 
                key={cat.key} 
                label={cat.label} 
                value={(scores as any)[cat.key]} 
                onChange={(v) => setScores({ ...scores, [cat.key]: v })}
              />
            ))}
          </div>

          {/* 4. 관람평 텍스트: 넓고 쾌적한 입력창 */}
          <div className="space-y-3">
            <label className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-black/20">Archival Commentary</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-black/10 bg-[#FDFDFD] p-6 h-40 resize-none text-lg font-medium text-[#1A1A1A] outline-none focus:border-[#B91C1C] transition-all rounded-sm shadow-inner placeholder:text-black/10" 
              placeholder="Record your cinematic impressions here..." 
            />
          </div>
        </div>

        {/* 5. Footer Buttons: 강렬한 대비의 액션 버튼 */}
        <div className="mt-5 flex gap-6">
          <button 
            className="flex-1 py-3 border border-black/10 font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 transition-all rounded-sm" 
            onClick={onClose}
          >
            BACK
          </button>
          <button 
            className="flex-1 py-3 bg-[#B91C1C] text-white font-display text-1xl uppercase tracking-tight shadow-xl hover:bg-[#1A1A1A] transition-all rounded-sm active:scale-95 shadow-[#B91C1C]/20" 
            onClick={onSubmit}
          >
            SUBMIT RECORD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteModal;