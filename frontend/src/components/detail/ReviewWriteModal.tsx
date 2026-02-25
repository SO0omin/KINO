import React, { useState, useEffect } from 'react';

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: number;
  onSubmit: (reviewData: any) => void;
}

const ReviewWriteModal = ({ isOpen, onClose, movieTitle, movieId, onSubmit }: ReviewWriteModalProps) => {
  // 5개 항목 점수 상태
  const [scores, setScores] = useState({
    scoreDirection: 10,
    scoreStory: 10,
    scoreVisual: 10,
    scoreActor: 10,
    scoreOst: 10,
  });
  const [content, setContent] = useState('');

  // ✨ 시크한 디테일: 모달이 열릴 때마다 입력 상태를 초기화해줍니다.
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setScores({
        scoreDirection: 10,
        scoreStory: 10,
        scoreVisual: 10,
        scoreActor: 10,
        scoreOst: 10,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { key: 'scoreDirection', label: '연출' },
    { key: 'scoreStory', label: '스토리' },
    { key: 'scoreVisual', label: '영상미' },
    { key: 'scoreActor', label: '배우' },
    { key: 'scoreOst', label: 'OST' },
  ];

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (content.trim().length < 10) {
      alert("관람평은 10자 이상 작성해주는 게 인지상정! 🕵️‍♂️");
      return;
    }

    // ✨ 백엔드 ReviewSaveRequestDTO와 필드명을 100% 일치시켜 보냅니다.
    const reviewPayload = {
      movieId: movieId,
      content: content,
      scoreDirection: scores.scoreDirection,
      scoreStory: scores.scoreStory,
      scoreVisual: scores.scoreVisual,
      scoreActor: scores.scoreActor,
      scoreOst: scores.scoreOst
    };

    onSubmit(reviewPayload); 
    // onClose는 부모(MovieDetail)의 handleReviewSubmit에서 성공 시 호출하는 게 더 안전하지만, 
    // 일단 흐름상 여기서 닫아도 무방합니다.
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
      <div className="bg-[#121212] w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,1)]">
        
        {/* 헤더 */}
        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">{movieTitle}</h2>
            <p className="text-zinc-500 text-xs font-bold mt-1 tracking-widest uppercase">Movie Review Write</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* 본문 (슬라이더 영역) */}
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-xs font-black tracking-widest uppercase italic">{cat.label}</span>
                  <span className="text-purple-500 font-black font-mono text-lg">{(scores as any)[cat.key]}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1"
                  value={(scores as any)[cat.key]}
                  onChange={(e) => handleScoreChange(cat.key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-400 transition-all"
                />
              </div>
            ))}
          </div>

          {/* 텍스트 입력 영역 */}
          <div className="space-y-3 pt-4">
            <p className="text-zinc-400 text-xs font-black tracking-widest uppercase italic">당신의 감상평</p>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="영화에 대한 한마디를 남겨주세요... (10자 이상)"
              className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-600 transition-all resize-none"
            />
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="px-10 py-8 bg-zinc-900/30 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-zinc-500 font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-95"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteModal;