import React from 'react';

interface ReviewVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (resNum: string) => void;
  reservationNumber: string;
  setReservationNumber: (val: string) => void;
}

const ReviewVerifyModal = ({ 
  isOpen, onClose, onVerifySuccess, 
  reservationNumber, setReservationNumber
}: ReviewVerifyModalProps) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60 font-sans">
      <div className="bg-white w-full max-w-md border border-black/5 shadow-2xl p-12 relative rounded-sm">
        
        {/* 1. Security Header - AI 스튜디오 디자인 포인트 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-10 bg-[#B91C1C]"></div>
          <p className="font-mono text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.5em]">Security Check</p>
        </div>

        {/* 2. Title & Description - Anton 폰트 적용 */}
        <h3 className="font-display text-4xl uppercase tracking-tighter mb-4 text-[#1A1A1A]">Ticket Verification</h3>
        <p className="font-sans text-[11px] text-black/40 uppercase tracking-widest mb-10 leading-relaxed font-bold">
          Please enter your unique reservation number to access the archival records for this feature.
        </p>
        
        {/* 3. Input Section - 류진님의 UpperCase 로직 유지 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="modal-res-num" className="font-mono text-[9px] font-bold text-black/20 uppercase tracking-widest">
              Reservation Number
            </label>
            <input 
              id="modal-res-num"
              title="Reservation Number Input"
              placeholder="KINO-XXXXXX-XXXXXX"
              value={reservationNumber}
              // 💡 류진님의 기존 기능: 대문자 자동 변환 유지
              onChange={(e) => setReservationNumber(e.target.value.toUpperCase())}
              className="w-full border border-black/10 bg-[#FDFDFD] p-5 font-mono text-xl outline-none focus:border-[#B91C1C] transition-all rounded-sm shadow-inner text-[#1A1A1A]"
            />
          </div>
          <p className="font-mono text-[9px] text-black/20 text-center uppercase tracking-widest">
            * Hyphens are required for archival lookup.
          </p>
        </div>

        {/* 4. Action Buttons - AI 스튜디오 스타일 (Cancel / Verify) */}
        <div className="flex gap-4 mt-12">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 border border-black/10 font-mono text-[10px] font-bold text-black/40 uppercase tracking-widest hover:bg-black/5 transition-all rounded-sm"
          >
            CANCEL
          </button>
          <button 
            onClick={() => onVerifySuccess(reservationNumber)}
            className="flex-1 py-4 bg-[#B91C1C] text-white font-display text-xl uppercase tracking-tight shadow-xl hover:bg-[#1A1A1A] transition-all rounded-sm active:scale-95"
          >
            VERIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewVerifyModal;