import React, { useState } from 'react';

interface ReviewVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (resNum: string) => void;
}

const ReviewVerifyModal = ({ isOpen, onClose, onVerifySuccess }: ReviewVerifyModalProps) => {
  const [resNum, setResNum] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
      <div className="bg-[#F5F2ED] w-full max-w-md border-[8px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,0.3)] p-10 relative">
        <h3 className="font-serif text-2xl italic font-black uppercase mb-2">Ticket Verification</h3>
        <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest mb-8">Enter your reservation number to access the archive.</p>
        
        <div className="space-y-4">
          <label htmlFor="modal-res-num" className="sr-only">예매 번호</label>
          <input 
            id="modal-res-num"
            title="Reservation Number Input"
            placeholder="KINO-XXXXXX-XXXXXX"
            value={resNum}
            onChange={(e) => setResNum(e.target.value.toUpperCase())}
            className="w-full border-4 border-black p-4 font-mono text-lg outline-none focus:bg-yellow-50 transition-colors"
          />
          <p className="font-mono text-[9px] text-black/40 text-center">* Hyphens are required.</p>
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 border-2 border-black font-mono text-xs font-bold hover:bg-black hover:text-white transition-all">CANCEL</button>
          <button 
            onClick={() => onVerifySuccess(resNum)}
            className="flex-1 py-4 bg-black text-white font-serif italic text-lg shadow-[6px_6px_0_0_#eb4d32] active:shadow-none active:translate-x-1"
          >
            VERIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewVerifyModal;