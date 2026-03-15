import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, AlertCircle, RotateCcw } from 'lucide-react';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const reservationId = searchParams.get('reservationId');

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#B91C1C] selection:text-white pb-20">
      
      {/* Header Area */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-16 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#B91C1C]"></div>
            <p className="font-sans text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
            <div className="h-px w-12 bg-[#B91C1C]"></div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-4">
            Payment <span className="text-white/20">Failed</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            결제가 정상적으로 처리되지 않았습니다
          </p>
        </div>
      </div>

      <main className="max-w-[600px] mx-auto px-6">
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* 상단 레드 포인트 라인 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#B91C1C]"></div>
          
          <div className="flex flex-col items-center text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <X className="w-8 h-8 text-[#B91C1C]" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-3xl uppercase tracking-tighter text-[#1A1A1A]">결제 실패</h2>
          </div>

          {/* 에러 상세 내용 박스 */}
          <div className="bg-black/5 border border-black/5 rounded-sm p-6 text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertCircle size={16} className="text-[#B91C1C]" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C]">Error Details</h3>
            </div>
            <p className="text-[12px] font-bold text-black/60 leading-relaxed whitespace-pre-line">
              {errorMessage || "사용자가 결제를 취소하셨거나\n알 수 없는 오류가 발생했습니다."}
            </p>
            {errorCode && (
              <p className="text-[10px] font-mono tracking-widest text-black/40 mt-3 bg-white/50 inline-block px-3 py-1 rounded-sm">
                CODE: {errorCode}
              </p>
            )}
          </div>

          {/* 안내 멘트 */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-widest text-black/40 leading-relaxed">
              일시적인 오류일 수 있습니다.<br/>잠시 후 다시 시도해 주시거나 문제가 지속되면 고객센터로 문의해 주세요.
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 bg-white border border-black/10 text-[#1A1A1A] rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/5 transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate(reservationId ? `/payment?reservationId=${reservationId}` : '/payment')}
              className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Retry Payment
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center pb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
            예매 관련 문의사항은 <button className="text-[#B91C1C] hover:underline ml-1">고객센터</button>로 연락해주세요.
          </p>
        </div>
      </main>
    </div>
  );
}