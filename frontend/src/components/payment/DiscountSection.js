import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function DiscountSection({ discountTab, setDiscountTab, isMember, coupons, couponLoading, onRedeemCoupon, onCouponSelect, onPointChange, availablePoints = 0, pointUnit = 1000, }) {
    const [pointInput, setPointInput] = useState('');
    const [activeMemberCouponId, setActiveMemberCouponId] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [redeemBusy, setRedeemBusy] = useState(false);
    const normalizePoint = (raw) => {
        const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
        // 보유 포인트 초과 방지
        const clamped = Math.min(num, availablePoints);
        // 단위 강제(예: 1000P 단위)
        const unitApplied = pointUnit > 1 ? Math.floor(clamped / pointUnit) * pointUnit : clamped;
        return unitApplied;
    };
    const handlePointInput = (val) => {
        const points = normalizePoint(val);
        setPointInput(points > 0 ? points.toLocaleString() : '');
        onPointChange?.(points);
    };
    const handleCouponClick = (memberCouponId) => {
        const newId = activeMemberCouponId === memberCouponId ? null : memberCouponId;
        setActiveMemberCouponId(newId);
        onCouponSelect?.(newId);
    };
    const handleReset = () => {
        setPointInput('');
        setActiveMemberCouponId(null);
        setCouponCode('');
        onPointChange?.(0);
        onCouponSelect?.(null);
    };
    const handleRedeem = async () => {
        const code = couponCode.trim();
        if (!code) {
            alert('쿠폰 코드를 입력해주세요.');
            return;
        }
        setRedeemBusy(true);
        try {
            await onRedeemCoupon(code);
            setCouponCode('');
        }
        catch (e) {
            alert(e?.message ?? '쿠폰 등록 실패');
        }
        finally {
            setRedeemBusy(false);
        }
    };
    return (_jsxs("section", { className: "mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-300", children: [_jsx("h2", { className: "text-xl font-bold", children: "\uD560\uC778\uC815\uBCF4" }), _jsx("button", { className: "text-sm text-gray-600 hover:text-[#eb4d32]", onClick: handleReset, children: "\uCD08\uAE30\uD654" })] }), !isMember ? (_jsx("div", { className: "bg-gray-100 rounded-lg p-10 text-center text-gray-500", children: "\uBE44\uD68C\uC6D0\uC740 \uD560\uC778 \uD61C\uD0DD\uC744 \uC774\uC6A9\uD558\uC2E4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsxs("div", { className: "bg-white rounded-lg p-6 shadow-sm border border-gray-100", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [_jsx("button", { className: `py-3 border rounded font-medium transition-all ${discountTab === 'coupon'
                                    ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]'
                                    : 'border-gray-300 text-gray-600'}`, onClick: () => setDiscountTab('coupon'), children: "\uCFE0\uD3F0" }), _jsx("button", { className: `py-3 border rounded font-medium transition-all ${discountTab === 'point'
                                    ? 'border-[#eb4d32] bg-[#fdf4e3] text-[#eb4d32]'
                                    : 'border-gray-300 text-gray-600'}`, onClick: () => setDiscountTab('point'), children: "\uD3EC\uC778\uD2B8" })] }), discountTab === 'coupon' && (_jsxs("div", { className: "animate-fadeIn space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: couponCode, onChange: (e) => setCouponCode(e.target.value), placeholder: "\uCFE0\uD3F0 \uCF54\uB4DC \uC785\uB825 (\uC608: WELCOME-2000)", className: "flex-1 py-3 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-[#eb4d32] outline-none" }), _jsx("button", { className: "px-4 py-3 bg-gray-800 text-white rounded text-sm hover:bg-black transition-colors disabled:opacity-50", onClick: handleRedeem, disabled: redeemBusy, children: redeemBusy ? '등록중' : '등록' })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "text-sm font-bold text-gray-700", children: "\uBCF4\uC720 \uCFE0\uD3F0" }), couponLoading && _jsx("p", { className: "text-xs text-gray-500", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })] }), coupons.length === 0 ? (_jsx("div", { className: "bg-gray-50 rounded p-6 text-sm text-gray-500", children: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uCFE0\uD3F0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "grid grid-cols-2 gap-3", children: coupons.map((c) => (_jsxs("button", { onClick: () => handleCouponClick(c.memberCouponId), className: `py-4 border rounded text-sm transition-all text-left px-4 ${activeMemberCouponId === c.memberCouponId
                                                ? 'border-[#eb4d32] bg-[#fdf4e3]'
                                                : 'border-gray-200 hover:border-gray-400'}`, children: [_jsx("p", { className: "font-bold", children: c.couponName }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [c.discountType === 'FIXED'
                                                            ? `${c.discountValue.toLocaleString()}원 할인`
                                                            : `${c.discountValue}% 할인`, c.minPrice > 0 ? ` (최소 ${c.minPrice.toLocaleString()}원)` : ''] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["~ ", c.expiresAt] })] }, c.memberCouponId))) }))] })] })), discountTab === 'point' && (_jsxs("div", { className: "animate-fadeIn", children: [_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("input", { type: "text", value: pointInput, onChange: (e) => handlePointInput(e.target.value), placeholder: "0", className: "flex-1 py-3 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-[#eb4d32] outline-none text-right font-mono" }), _jsx("span", { className: "text-gray-600", children: "P" }), _jsx("button", { className: "px-4 py-3 bg-gray-800 text-white rounded text-sm hover:bg-black transition-colors", onClick: () => handlePointInput(String(availablePoints)), children: "\uC804\uC561\uC0AC\uC6A9" })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-3 ml-1", children: ["\uBCF4\uC720 \uD3EC\uC778\uD2B8:", ' ', _jsx("span", { className: "text-black font-bold", children: availablePoints.toLocaleString() }), " P", pointUnit > 1 ? ` (${pointUnit.toLocaleString()}P 단위로 사용 가능)` : ''] })] })), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-100", children: _jsxs("ul", { className: "text-xs text-gray-500 space-y-1.5 leading-relaxed", children: [_jsx("li", { children: "\u2022 \uCFE0\uD3F0\uACFC \uD3EC\uC778\uD2B8\uB294 \uC911\uBCF5 \uC801\uC6A9\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4." }), _jsx("li", { children: "\u2022 \uCD5C\uC885 \uACB0\uC81C \uAE08\uC561\uC740 \uC11C\uBC84 \uACC4\uC0B0\uC774 \uAE30\uC900\uC785\uB2C8\uB2E4." }), _jsx("li", { children: "\u2022 \uACB0\uC81C \uC2E4\uD328 \uC2DC \uCFE0\uD3F0\uC740 \uC790\uB3D9\uC73C\uB85C \uBCF5\uAD6C\uB429\uB2C8\uB2E4." })] }) })] }))] }));
}
