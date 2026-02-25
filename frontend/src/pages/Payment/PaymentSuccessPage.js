import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../api/paymentApi';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { CheckCircle2, XCircle, Ticket, Clock, CreditCard, ArrowRight } from 'lucide-react';
export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isConfirming, setIsConfirming] = useState(true);
    const [error, setError] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const reservationId = searchParams.get('reservationId');
    // [추가된 안전장치] API 중복 호출 방지
    const isCalled = useRef(false);
    useEffect(() => {
        const confirm = async () => {
            // 1. 이미 호출했으면 중단 (Strict Mode 대응)
            if (isCalled.current)
                return;
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
                const result = await confirmPayment({
                    paymentKey,
                    orderId,
                    amount: parseInt(amount),
                });
                // 2. 결과 처리 (paymentId 추출)
                // result가 { paymentId: 123 } 형태라고 가정
                setPaymentId(result.paymentId);
                setIsConfirming(false);
            }
            catch (err) {
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
        return (_jsx("div", { className: "min-h-screen bg-[#fdf4e3] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "animate-spin rounded-full h-20 w-20 border-4 border-[#f5e6d3] border-t-[#eb4d32] mx-auto" }), _jsx(Ticket, { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#eb4d32] w-8 h-8" })] }), _jsx("p", { className: "text-lg text-gray-700 mt-6 font-medium", children: "\uACB0\uC81C\uB97C \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4..." }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694" })] }) }));
    }
    // 에러 상태
    if (error) {
        return (_jsxs("div", { className: "min-h-screen bg-[#fdf4e3]", children: [_jsx(Header, {}), _jsx("main", { className: "max-w-[640px] mx-auto px-6 py-16", children: _jsxs("div", { className: "bg-white rounded-2xl p-10 shadow-lg border-2 border-red-100", children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50" }), _jsx("div", { className: "relative bg-red-50 rounded-full p-6", children: _jsx(XCircle, { className: "w-16 h-16 text-red-500", strokeWidth: 2 }) })] }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900 text-center mb-4", children: "\uACB0\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4" }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-8", children: _jsx("p", { className: "text-red-700 text-center", children: error }) }), _jsxs("p", { className: "text-gray-600 text-center mb-8 text-sm leading-relaxed", children: ["\uACB0\uC81C \uACFC\uC815\uC5D0\uC11C \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.", _jsx("br", {}), "\uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC2DC\uAC70\uB098, \uBB38\uC81C\uAC00 \uACC4\uC18D\uB418\uBA74 \uACE0\uAC1D\uC13C\uD130\uB85C \uBB38\uC758\uD574\uC8FC\uC138\uC694."] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate('/'), className: "flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium", children: "\uD648\uC73C\uB85C" }), _jsx("button", { onClick: () => navigate(reservationId ? `/payment?reservationId=${reservationId}` : '/payment'), className: "flex-1 px-6 py-4 bg-[#eb4d32] text-white rounded-lg hover:bg-[#d43d22] transition-all font-medium shadow-lg shadow-orange-200", children: "\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAE30" })] })] }) }), _jsx(Footer, {})] }));
    }
    // 성공 상태
    return (_jsxs("div", { className: "min-h-screen bg-[#fdf4e3]", children: [_jsx(Header, {}), _jsxs("main", { className: "max-w-[640px] mx-auto px-6 py-16", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#f5e6d3]", children: [_jsxs("div", { className: "bg-gradient-to-br from-[#eb4d32] to-[#d43d22] p-10 text-white text-center relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" }), _jsx("div", { className: "absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" }), _jsx("div", { className: "relative flex justify-center mb-6", children: _jsx("div", { className: "bg-white rounded-full p-5 shadow-2xl", children: _jsx(CheckCircle2, { className: "w-16 h-16 text-[#eb4d32]", strokeWidth: 2.5 }) }) }), _jsx("h1", { className: "text-3xl font-bold mb-3 relative", children: "\uC608\uB9E4\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!" }), _jsx("p", { className: "text-white/90 text-sm relative", children: "\uC990\uAC70\uC6B4 \uAD00\uB78C \uB418\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4" })] }), _jsxs("div", { className: "p-8", children: [_jsx("div", { className: "bg-[#fdf4e3] rounded-xl p-6 mb-6 border-2 border-[#eb4d32]/20", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-white rounded-lg p-3 shadow-sm", children: _jsx(Ticket, { className: "w-6 h-6 text-[#eb4d32]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "\uC608\uB9E4\uBC88\uD638" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["#", paymentId] })] })] }), _jsx("button", { className: "text-[#eb4d32] text-sm font-medium hover:underline", onClick: () => {
                                                        if (paymentId)
                                                            navigator.clipboard.writeText(paymentId.toString());
                                                    }, children: "\uBCF5\uC0AC" })] }) }), _jsxs("div", { className: "space-y-3 mb-8", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Clock, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "\uC608\uB9E4 \uC77C\uC2DC:" }), _jsx("span", { className: "text-gray-900 font-medium", children: new Date().toLocaleString('ko-KR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }) })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "\uACB0\uC81C \uAE08\uC561:" }), _jsxs("span", { className: "text-gray-900 font-medium", children: [parseInt(searchParams.get('amount') || '0').toLocaleString(), "\uC6D0"] })] })] }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200", children: _jsxs("p", { className: "text-sm text-gray-600 leading-relaxed", children: [_jsx("span", { className: "font-medium text-gray-900", children: "\uD83D\uDCE7 \uC608\uB9E4 \uD655\uC778 \uBA54\uC77C" }), "\uC774 \uBC1C\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", _jsx("br", {}), _jsx("span", { className: "text-xs text-gray-500", children: "\uC608\uB9E4 \uB0B4\uC5ED\uC740 \uB9C8\uC774\uD398\uC774\uC9C0\uC5D0\uC11C \uD655\uC778 \uBC0F \uCDE8\uC18C\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: () => navigate('/my-page'), className: "w-full px-6 py-4 bg-[#eb4d32] text-white rounded-xl hover:bg-[#d43d22] transition-all font-medium shadow-lg shadow-orange-200 flex items-center justify-center gap-2 group", children: [_jsx("span", { children: "\uC608\uB9E4 \uB0B4\uC5ED \uD655\uC778\uD558\uAE30" }), _jsx(ArrowRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })] }), _jsx("button", { onClick: () => navigate('/'), className: "w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium", children: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30" })] })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["\uC608\uB9E4 \uAD00\uB828 \uBB38\uC758\uC0AC\uD56D\uC740", ' ', _jsx("button", { className: "text-[#eb4d32] font-medium hover:underline", children: "\uACE0\uAC1D\uC13C\uD130" }), "\uB85C \uC5F0\uB77D\uD574\uC8FC\uC138\uC694."] }) })] }), _jsx(Footer, {})] }));
}
