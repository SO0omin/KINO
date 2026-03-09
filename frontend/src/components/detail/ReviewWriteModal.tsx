
import React, { useState, useEffect } from 'react';

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: number;
  reservationNumber: string;
  onSubmit: (reviewData: any) => void;
}

const ReviewWriteModal = ({ isOpen, onClose, movieTitle, movieId, reservationNumber, onSubmit }: ReviewWriteModalProps) => {
  const [scores, setScores] = useState({
    scoreDirection: 10,
    scoreStory: 10,
    scoreVisual: 10,
    scoreActor: 10,
    scoreOst: 10,
  });
  const [content, setContent] = useState('');

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
    { key: 'scoreDirection', label: 'Direction' },
    { key: 'scoreStory', label: 'Story' },
    { key: 'scoreVisual', label: 'Visuals' },
    { key: 'scoreActor', label: 'Acting' },
    { key: 'scoreOst', label: 'Music' },
  ];

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (content.trim().length < 10) {
      alert("Please provide at least 10 characters for your testimonial.");
      return;
    }
    const reviewPayload = {
      movieId: movieId,
      reservationNumber: reservationNumber,
      content: content,
      scoreDirection: scores.scoreDirection,
      scoreStory: scores.scoreStory,
      scoreVisual: scores.scoreVisual,
      scoreActor: scores.scoreActor,
      scoreOst: scores.scoreOst
    };
    onSubmit(reviewPayload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60 animate-in fade-in duration-300">
      <div className="bg-[#F5F2ED] w-full max-w-2xl border-[8px] border-black shadow-[30px_30px_0_0_rgba(0,0,0,0.3)] overflow-hidden relative paper-texture">
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-black/10"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-black/10"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-black/10"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-black/10"></div>

        {/* Header */}
        <div className="px-12 py-10 border-b-[4px] border-black flex justify-between items-center bg-white">
          <div className="space-y-1">
            <span className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.5em]">Official Submission</span>
            <h2 className="font-serif text-3xl italic tracking-tighter text-black uppercase leading-none">{movieTitle}</h2>
          </div>
          <button onClick={onClose} className="w-12 h-12 border-2 border-black flex items-center justify-center text-2xl hover:bg-black hover:text-white transition-all">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-12 space-y-12">
          {/* Scoring Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-widest">{cat.label}</span>
                  <span className="font-serif text-2xl italic text-black leading-none">{(scores as any)[cat.key]}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1"
                  value={(scores as any)[cat.key]}
                  onChange={(e) => handleScoreChange(cat.key, parseInt(e.target.value))}
                  className="w-full h-2 bg-black/10 appearance-none cursor-pointer accent-black hover:accent-red-800 transition-all"
                />
              </div>
            ))}
          </div>

          {/* Testimonial Area */}
          <div className="space-y-4">
            <label className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-widest">Your Testimonial</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your thoughts for the archive... (Min. 10 characters)"
              className="w-full h-40 bg-white border-2 border-black p-6 font-serif italic text-xl text-black placeholder:text-black/10 focus:outline-none focus:bg-[#f4f1ea]/30 transition-all resize-none shadow-[6px_6px_0_0_rgba(0,0,0,0.05)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-10 bg-white border-t-[4px] border-black flex flex-col sm:flex-row gap-6">
          <button 
            onClick={onClose}
            className="flex-1 py-5 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 hover:text-black transition-all"
          >
            Discard Draft
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-5 bg-black text-white font-serif italic text-xl tracking-tight hover:bg-red-900 transition-all shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Submit to Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteModal;
