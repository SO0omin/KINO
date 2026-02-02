import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header'; // 경로가 안 맞으면 ../../ 또는 ../ 로 수정하세요
import { Footer } from '../../components/common/Footer';
import { XCircle, AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-[#fdf4e3]">
      <Header />
      
      <main className="max-w-[600px] mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
          
          {/* 상단 헤더 (빨간색) */}
          <div className="bg-red-50 p-8 text-center border-b border-red-100">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-sm">
                <XCircle className="w-12 h-12 text-red-500" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">결제에 실패했습니다</h1>
            <p className="text-gray-500 mt-2 text-sm">
              요청하신 결제가 정상적으로 처리되지 않았습니다.
            </p>
          </div>

          {/* 에러 상세 내용 */}
          <div className="p-8">
            {errorMessage && (
              <div className="bg-red-50 rounded-xl p-5 mb-8 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-bold text-sm mb-1">오류 내용</h3>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                  {errorCode && (
                    <p className="text-red-500 text-xs mt-1">Error Code: {errorCode}</p>
                  )}
                </div>
              </div>
            )}

            {/* 안내 멘트 */}
            <div className="text-center text-gray-600 text-sm mb-8 leading-relaxed">
              일시적인 오류일 수 있습니다.<br/>
              잠시 후 다시 시도해 주시거나,<br/>
              문제가 지속되면 고객센터로 문의해 주세요.
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                <Home className="w-4 h-4" />
                홈으로
              </button>
              <button
                onClick={() => navigate('/payment')} // 다시 결제 페이지로 이동
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#eb4d32] text-white rounded-xl hover:bg-[#d43d22] transition-all font-medium shadow-md shadow-orange-100"
              >
                <RotateCcw className="w-4 h-4" />
                다시 시도하기
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}