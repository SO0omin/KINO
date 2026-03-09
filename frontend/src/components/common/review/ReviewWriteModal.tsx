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

  // 마이페이지 전용 스코어 셀렉터 디자인
  const ScoreSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[9px] uppercase text-black/40 tracking-tighter">{label}</span>
      <select 
        title={`${label} 점수 선택`}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-black/20 bg-white text-xs font-mono p-1 outline-none focus:border-black"
      >
        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-sm border border-black bg-white p-8 shadow-[12px_12px_0_0_#000]">
        <h3 className="font-serif italic text-3xl mb-6 uppercase">Review Ledger</h3>
        
        <div className="space-y-6">
          {/* 영화 제목 정보 */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-black/40">Verified Movie</label>
            <div className="w-full border-2 border-black/10 p-3 bg-gray-50 text-sm font-bold">{movieTitle}</div>
          </div>

          {/* 5가지 항목 점수 선택 영역 (그리드) */}
          <div className="grid grid-cols-5 gap-3 p-4 bg-[#f4f1ea]/50 border border-black/5 rounded-sm">
            {categories.map(cat => (
              <ScoreSelector 
                key={cat.key} 
                label={cat.label} 
                value={(scores as any)[cat.key]} 
                onChange={(v) => setScores({ ...scores, [cat.key]: v })}
              />
            ))}
          </div>

          {/* 관람평 텍스트 */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-black/40">Commentary</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border-2 border-black p-3 h-28 resize-none text-sm outline-none focus:bg-yellow-50" 
              placeholder="영화를 보며 느낀 감정을 기록하세요." 
            />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 py-3 border-2 border-black font-bold uppercase text-xs" onClick={onClose}>BACK</button>
          <button className="flex-1 py-3 bg-black text-white font-bold shadow-[4px_4px_0_0_#eb4d32] uppercase text-xs" onClick={onSubmit}>SUBMIT REVIEW</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteModal;