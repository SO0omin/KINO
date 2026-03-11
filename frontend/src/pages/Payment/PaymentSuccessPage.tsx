import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../api/paymentApi';
import { Check, X, Copy, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cinemaAlert } from '../../utils/alert';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string | null>(null);
  const reservationId = searchParams.get('reservationId');
  
  // API 중복 호출 방지
  const isCalled = useRef(false);

  useEffect(() => {
    const confirm = async () => {
      if (isCalled.current) return;
      isCalled.current = true;

      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('잘못된 결제 요청입니다.');
        setIsConfirming(false);
        return;
      }
      
      const cachedResult = sessionStorage.getItem(`payment_result_${orderId}`);
      if (cachedResult) {
        const { payId, resNum } = JSON.parse(cachedResult);
        setPaymentId(payId);
        setReservationNumber(resNum);
        setIsConfirming(false);
        return; 
      }

      try {
        const result = await confirmPayment({
          paymentKey,
          orderId,
          amount: parseInt(amount),
        });

        setPaymentId(result.paymentId);
        setReservationNumber(result.reservationNumber);

        sessionStorage.setItem(`payment_result_${orderId}`, JSON.stringify({
          payId: result.paymentId,
          resNum: result.reservationNumber
        }));

        setIsConfirming(false);
      } catch (err) {
        console.error('결제 승인 오류:', err);
        setError(err instanceof Error ? err.message : '결제 승인에 실패했습니다.');
        setIsConfirming(false);
      }
    };

    confirm();
  }, [searchParams]);

  const handleCopy = () => {
    if (reservationNumber) {
      navigator.clipboard.writeText(reservationNumber);
      cinemaAlert("예매번호가 복사되었습니다.", "COPIED");
    }
  };

  // 1. 로딩 상태
  if (isConfirming) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
        <div className="w-16 h-16 border-4 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-[0.4em] animate-pulse">Confirming Payment</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-2">결제를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 공통 레이블 스타일
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-black/40";

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
            {error ? (
              <>Payment <span className="text-white/20">Failed</span></>
            ) : (
              <>Payment <span className="text-white/20">Success</span></>
            )}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            {error ? '결제 처리 중 문제가 발생했습니다' : '예매가 성공적으로 완료되었습니다'}
          </p>
        </div>
      </div>

      <main className="max-w-[600px] mx-auto px-6">
        
        {/* 2. 에러 상태 UI */}
        {error ? (
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#B91C1C]"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-[#B91C1C]" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-3xl uppercase tracking-tighter text-[#1A1A1A]">결제 실패</h2>
            </div>

            <div className="bg-black/5 border border-black/5 rounded-sm p-5 text-center mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-2">Error Message</h3>
              <p className="text-[11px] font-bold text-black/60 leading-relaxed">
                {error}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/')} className="flex-1 py-4 bg-white border border-black/10 text-[#1A1A1A] rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/5 transition-all">
                Home
              </button>
              <button onClick={() => navigate(reservationId ? `/payment?reservationId=${reservationId}` : '/payment')} className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] transition-all">
                Retry Payment
              </button>
            </div>
          </div>
        ) : (
          
          /* 3. 성공 상태 UI */
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1A1A1A]"></div>
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2 className="font-display text-4xl uppercase tracking-tighter text-[#1A1A1A]">예매 완료</h2>
            </div>

            {/* 예매번호 카드 */}
            <div className="bg-black/5 border border-black/5 rounded-sm p-6 mb-8 flex items-center justify-between group">
              <div>
                <p className={labelClass}>Reservation No.</p>
                <p className="font-display text-2xl tracking-widest text-[#B91C1C] mt-1">{reservationNumber ?? '-'}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="w-10 h-10 bg-white border border-black/10 rounded-sm flex items-center justify-center text-black/40 hover:text-[#B91C1C] hover:border-[#B91C1C] transition-all"
                title="예매번호 복사"
              >
                <Copy size={18} />
              </button>
            </div>

            {/* 결제 정보 내역 */}
            <div className="space-y-6 mb-10 border-t border-black/5 pt-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-black/40" />
                  <span className={labelClass}>Payment Date</span>
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-black/40" />
                  <span className={labelClass}>Total Amount</span>
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {parseInt(searchParams.get('amount') || '0').toLocaleString()} KRW
                </span>
              </div>
            </div>

            {/* 회원/비회원 안내 */}
            {!isGuest && (
              <div className="bg-[#1A1A1A] rounded-sm p-5 text-center mb-8">
                <p className="text-[11px] font-bold tracking-widest text-white/80 leading-relaxed">
                  가입하신 이메일로 예매 확인 메일이 발송되었습니다.<br/>
                  <span className="text-white/40 mt-1 block">예매 내역은 마이페이지에서 확인 가능합니다.</span>
                </p>
              </div>
            )}

            {/* 하단 버튼 액션 */}
            <div className="flex flex-col gap-4">
              <button onClick={() => navigate('/mypage')} className="w-full py-5 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group">
                Check Tickets
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/')} className="w-full py-5 bg-white border border-black/10 text-[#1A1A1A] rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/5 transition-all">
                Back to Home
              </button>
            </div>

          </div>
        )}
        
        <div className="mt-8 text-center pb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
            예매 관련 문의사항은 <button className="text-[#B91C1C] hover:underline ml-1">고객센터</button>로 연락해주세요.
          </p>
        </div>

      </main>
    </div>
  );
}