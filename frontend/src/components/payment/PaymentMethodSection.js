import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus } from 'lucide-react';
export function PaymentMethodSection({ selectedPaymentMethod, setSelectedPaymentMethod }) {
    const paymentMethods = [
        { label: '카드결제', type: 'CARD' },
        { label: '실시간 계좌이체', type: 'TRANSFER' },
        { label: '가상계좌', type: 'VIRTUAL_ACCOUNT' },
        { label: '휴대폰 결제', type: 'MOBILE_PHONE' }
    ];
    return (_jsxs("section", { className: "mb-8", children: [_jsx("h2", { className: "text-xl mb-4 pb-3 border-b-2 border-gray-300", children: "\uACB0\uC81C\uC218\uB2E8" }), _jsxs("div", { className: "bg-white rounded-lg p-8", children: [_jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[200px]", children: [_jsx(Plus, { size: 48, className: "text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500 mb-1", children: "\uC790\uC8FC \uC0AC\uC6A9\uD558\uB294 \uCE74\uB4DC \uB4F1\uB85D\uD558\uACE0" }), _jsx("p", { className: "text-gray-500", children: "\uB354\uC6B1 \uBE60\uB974\uAC8C \uACB0\uC81C\uD558\uC138\uC694!" })] }), _jsx("div", { className: "mt-6 flex gap-3 flex-wrap", children: paymentMethods.map((method) => (_jsx("button", { className: `px-6 py-2 rounded transition-colors ${selectedPaymentMethod === method.type
                                ? 'bg-[#eb4d32] text-white'
                                : 'border border-gray-300 hover:border-[#eb4d32] hover:bg-[#fdf4e3]'}`, onClick: () => setSelectedPaymentMethod(method.type), children: method.label }, method.type))) })] })] }));
}
