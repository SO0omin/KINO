import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../api/paymentApi';
import { CheckCircle2, XCircle, Ticket, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/*function formatDisplayBookingNo(id: number, date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const seq = String(id).padStart(6, '0');
  return `KINO-${yy}${mm}${dd}-${seq}`;
}*/

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string | null>(null);
  const reservationId = searchParams.get('reservationId');
  
  // [추가된 안전장치] API 중복 호출 방지
  const isCalled = useRef(false);

  useEffect(() => {
    const confirm = async () => {
      // 1. 이미 호출했으면 중단 (Strict Mode 대응)
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

      try {
        let lastError: unknown = null;
        let result: Awaited<ReturnType<typeof confirmPayment>> | null = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            result = await confirmPayment({
              paymentKey,
              orderId,
              amount: parseInt(amount, 10),
            });
            break;
          } catch (confirmError: any) {
            lastError = confirmError;

            const message = String(confirmError?.message ?? '');
            const isTransient =
              message.includes('timeout') ||
              message.includes('Network Error') ||
              message.includes('ERR_NETWORK') ||
              message.includes('ECONNABORTED') ||
              message.includes('최종 결제 승인에 실패했습니다');

            if (!isTransient || attempt === 2) {
              throw confirmError;
            }

            await sleep(1200);
          }
        }

        if (!result) {
          throw lastError instanceof Error ? lastError : new Error('결제 승인 확인에 실패했습니다.');
        }

        // 2. 결과 처리 (paymentId 추출)
        // result가 { paymentId: 123 } 형태라고 가정
        setPaymentId(result.paymentId);
        setReservationNumber(result.reservationNumber);

        setIsConfirming(false);
      } catch (err) {
        console.error('결제 승인 오류:', err);
        setError(err instanceof Error ? err.message : '결제 승인에 실패했습니다.');
        setIsConfirming(false);
      }
    };

    confirm();
  }, [searchParams]);

  // --- 아래부터는 피그마의 예쁜 디자인 코드 그대로 ---

  // 로딩 상태
  if (isConfirming) {
    return (
      <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#f5e6d3] border-t-[#eb4d32] mx-auto"></div>
            <Ticket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#eb4d32] w-8 h-8" />
          </div>
          <p className="text-lg text-gray-700 mt-6 font-medium">결제를 확인하는 중입니다...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf4e3]">
        <main className="max-w-[640px] mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-red-100">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-red-50 rounded-full p-6">
                  <XCircle className="w-16 h-16 text-red-500" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              결제에 실패했습니다
            </h1>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700 text-center">{error}</p>
            </div>

            <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
              결제 과정에서 문제가 발생했습니다.<br />
              다시 시도해주시거나, 문제가 계속되면 고객센터로 문의해주세요.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                홈으로
              </button>
              <button
                onClick={() =>
                  navigate(reservationId ? `/payment?reservationId=${reservationId}` : '/payment')
                }
                className="flex-1 px-6 py-4 bg-[#eb4d32] text-white rounded-lg hover:bg-[#d43d22] transition-all font-medium shadow-lg shadow-orange-200"
              >
                다시 시도하기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }


  // 성공 상태
  return (
    <div className="min-h-screen bg-[#fdf4e3]">
      <main className="max-w-[640px] mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#f5e6d3]">
          <div className="bg-gradient-to-br from-[#eb4d32] to-[#d43d22] p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative flex justify-center mb-6">
              <div className="bg-white rounded-full p-5 shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-[#eb4d32]" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-3 relative">
              예매가 완료되었습니다!
            </h1>
            <p className="text-white/90 text-sm relative">
              즐거운 관람 되시기 바랍니다
            </p>
          </div>

          <div className="p-8">
            <div className="bg-[#fdf4e3] rounded-xl p-6 mb-6 border-2 border-[#eb4d32]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Ticket className="w-6 h-6 text-[#eb4d32]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">예매번호</p>
                    <p className="text-2xl font-bold text-gray-900">{reservationNumber ?? '-'}</p>
                  </div>
                </div>
                {/* 복사 버튼 기능은 나중에 구현 (일단 UI만) */}
                <button 
                  className="text-[#eb4d32] text-sm font-medium hover:underline"
                  onClick={() => {
                    if (reservationNumber) navigator.clipboard.writeText(reservationNumber);
                  }}
                >
                  복사
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">예매 일시:</span>
                <span className="text-gray-900 font-medium">
                  {new Date().toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">결제 금액:</span>
                <span className="text-gray-900 font-medium">
                  {parseInt(searchParams.get('amount') || '0').toLocaleString()}원
                </span>
              </div>
            </div>

            {!isGuest ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-900">📧 예매 확인 메일</span>이 발송되었습니다.<br />
                  <span className="text-xs text-gray-500">
                    예매 내역은 마이페이지에서 확인 및 취소하실 수 있습니다.
                  </span>
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/mypage')}
                className="w-full px-6 py-4 bg-[#eb4d32] text-white rounded-xl hover:bg-[#d43d22] transition-all font-medium shadow-lg shadow-orange-200 flex items-center justify-center gap-2 group"
              >
                <span>예매 내역 확인하기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            예매 관련 문의사항은{' '}
            <button className="text-[#eb4d32] font-medium hover:underline">
              고객센터
            </button>
            로 연락해주세요.
          </p>
        </div>
      </main>
    </div>
  );
}
