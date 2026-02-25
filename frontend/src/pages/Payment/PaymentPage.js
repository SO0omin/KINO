import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { BookingInfo } from '../../components/payment/BookingInfo';
import { DiscountSection } from '../../components/payment/DiscountSection';
import { PaymentMethodSection } from '../../components/payment/PaymentMethodSection';
import { PaymentSummary } from '../../components/payment/PaymentSummary';
import { usePayment } from '../../hooks/usePayment';
import { preparePayment, getMyCoupons, redeemCoupon, getMyPoints, } from '../../api/paymentApi';
function normalizePriceType(pt) {
    return pt ?? 'ADULT';
}
function buildTicketsFromReservationDetail(detail) {
    return (detail.seats ?? []).map((seat) => ({
        seatId: seat.seatId,
        priceType: normalizePriceType(seat.priceType),
    }));
}
function buildTicketTypeText(seats) {
    const counts = { ADULT: 0, YOUTH: 0, SENIOR: 0, SPECIAL: 0 };
    for (const s of seats) {
        const pt = normalizePriceType(s.priceType);
        counts[pt] += 1;
    }
    const parts = [];
    if (counts.ADULT)
        parts.push(`성인 ${counts.ADULT}명`);
    if (counts.YOUTH)
        parts.push(`청소년 ${counts.YOUTH}명`);
    if (counts.SENIOR)
        parts.push(`경로 ${counts.SENIOR}명`);
    if (counts.SPECIAL)
        parts.push(`우대 ${counts.SPECIAL}명`);
    return parts.length ? parts.join(' / ') : '성인 0명';
}
export default function PaymentPage() {
    const [searchParams] = useSearchParams();
    const reservationId = parseInt(searchParams.get('reservationId') || '0', 10);
    const { isLoading, reservationDetail, fetchReservationDetail, requestPayment, updateAmount } = usePayment();
    const [discountTab, setDiscountTab] = useState('coupon');
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [usedPoints, setUsedPoints] = useState(0);
    const [coupons, setCoupons] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');
    const [serverOriginalPrice, setServerOriginalPrice] = useState(0);
    const [serverCouponDiscount, setServerCouponDiscount] = useState(0);
    const [serverUsedPoints, setServerUsedPoints] = useState(0);
    const [currentFinalAmount, setCurrentFinalAmount] = useState(0);
    // 추가: 보유 포인트
    const [availablePoints, setAvailablePoints] = useState(0);
    useEffect(() => {
        if (reservationId)
            fetchReservationDetail(reservationId);
    }, [reservationId, fetchReservationDetail]);
    // 쿠폰 목록 조회
    useEffect(() => {
        const memberId = reservationDetail?.memberId ?? null;
        if (!memberId) {
            setCoupons([]);
            setSelectedCouponId(null);
            return;
        }
        (async () => {
            setCouponLoading(true);
            try {
                const list = await getMyCoupons(memberId);
                setCoupons(list);
            }
            catch (e) {
                console.error('쿠폰 목록 조회 실패:', e);
                setCoupons([]);
            }
            finally {
                setCouponLoading(false);
            }
        })();
    }, [reservationDetail?.memberId]);
    // 추가: 보유 포인트 조회
    useEffect(() => {
        const memberId = reservationDetail?.memberId ?? null;
        if (!memberId) {
            setAvailablePoints(0);
            setUsedPoints(0); // 비회원이면 사용 포인트도 0으로 정리
            return;
        }
        (async () => {
            try {
                const p = await getMyPoints(memberId);
                const n = Number(p) || 0;
                setAvailablePoints(n);
                // 현재 입력된 usedPoints가 보유 포인트보다 크면 자동 보정
                setUsedPoints((prev) => Math.min(prev, n));
            }
            catch (e) {
                console.error('포인트 조회 실패:', e);
                setAvailablePoints(0);
                setUsedPoints(0);
            }
        })();
    }, [reservationDetail?.memberId]);
    const handleRedeemCoupon = async (code) => {
        const memberId = reservationDetail?.memberId ?? null;
        if (!memberId) {
            alert('회원만 쿠폰 등록이 가능합니다.');
            return;
        }
        setCouponLoading(true);
        try {
            await redeemCoupon(code, memberId);
            const list = await getMyCoupons(memberId);
            setCoupons(list);
        }
        catch (e) {
            alert(e?.message ?? '쿠폰 등록에 실패했습니다.');
        }
        finally {
            setCouponLoading(false);
        }
    };
    const tickets = useMemo(() => {
        if (!reservationDetail)
            return [];
        return buildTicketsFromReservationDetail(reservationDetail);
    }, [reservationDetail]);
    // 쿠폰/포인트 변경 시 prepare 재계산
    useEffect(() => {
        const recalc = async () => {
            if (!reservationDetail)
                return;
            const isMember = !!reservationDetail.memberId;
            const safeUsedPoints = isMember ? usedPoints : 0;
            const safeCouponId = isMember ? selectedCouponId : null;
            try {
                const res = await preparePayment({
                    reservationId: reservationDetail.reservationId,
                    screeningId: reservationDetail.screeningId,
                    tickets,
                    totalPrice: reservationDetail.totalAmount,
                    memberCouponId: safeCouponId,
                    usedPoints: safeUsedPoints,
                    memberId: reservationDetail.memberId ?? null,
                    guestId: reservationDetail.guestId ?? null,
                });
                setServerOriginalPrice(res.originalPrice);
                setServerCouponDiscount(res.discountAmount);
                setServerUsedPoints(res.usedPoints);
                setCurrentFinalAmount(res.finalAmount);
                updateAmount(res.finalAmount);
            }
            catch (e) {
                console.error('prepare 재계산 실패:', e);
                setServerOriginalPrice(reservationDetail.totalAmount);
                setServerCouponDiscount(0);
                setServerUsedPoints(safeUsedPoints);
                const fallback = Math.max(0, reservationDetail.totalAmount - safeUsedPoints);
                setCurrentFinalAmount(fallback);
                updateAmount(fallback);
            }
        };
        if (tickets.length > 0) {
            recalc();
        }
    }, [reservationDetail, selectedCouponId, usedPoints, tickets, updateAmount]);
    if (!reservationId) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-gray-700", children: "\uC798\uBABB\uB41C \uC811\uADFC\uC785\uB2C8\uB2E4. reservationId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." }) }));
    }
    if (!reservationDetail && isLoading) {
        return _jsx("div", { className: "min-h-screen flex items-center justify-center", children: "\uB85C\uB529 \uC911..." });
    }
    if (!reservationDetail)
        return null;
    const ticketTypeText = buildTicketTypeText(reservationDetail.seats);
    const handlePayment = async () => {
        if (!agreeTerms) {
            alert('취소/환불 정책에 동의해주세요.');
            return;
        }
        const isMember = !!reservationDetail.memberId;
        await requestPayment({
            reservationId: reservationDetail.reservationId,
            screeningId: reservationDetail.screeningId,
            tickets,
            totalPrice: currentFinalAmount,
            memberCouponId: isMember ? selectedCouponId : null,
            usedPoints: isMember ? usedPoints : 0,
            memberId: reservationDetail.memberId ?? null,
            guestId: reservationDetail.guestId ?? null,
        }, selectedPaymentMethod);
    };
    const bookingData = {
        movieTitle: reservationDetail.movieTitle,
        dateTime: reservationDetail.startTime,
        theater: `${reservationDetail.theaterName} / ${reservationDetail.screenName}`,
        ticketType: ticketTypeText,
        screeningId: reservationDetail.screeningId,
        posterUrl: reservationDetail.posterUrl,
    };
    const baseTotal = serverOriginalPrice > 0 ? serverOriginalPrice : reservationDetail.totalAmount;
    const totalDiscount = (serverCouponDiscount || 0) + (serverUsedPoints || 0);
    const paymentData = {
        reservationId: reservationId,
        adultCount: reservationDetail.seats.length,
        adultPrice: reservationDetail.seats.length ? baseTotal / reservationDetail.seats.length : 0,
        totalAmount: baseTotal,
        discountAmount: totalDiscount,
        finalAmount: currentFinalAmount,
        seats: [],
        memberId: reservationDetail.memberId || null,
        guestId: reservationDetail.guestId || null,
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#fdf4e3]", children: [_jsx(Header, {}), _jsx("main", { className: "max-w-[1200px] mx-auto px-6 pb-16 pt-8", children: _jsxs("div", { className: "flex gap-8", children: [_jsxs("div", { className: "flex-1 space-y-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "\uACB0\uC81C\uD558\uAE30" }), _jsx(BookingInfo, { bookingData: bookingData }), _jsx(DiscountSection, { discountTab: discountTab, setDiscountTab: setDiscountTab, onCouponSelect: setSelectedCouponId, onPointChange: setUsedPoints, isMember: !!reservationDetail.memberId, coupons: coupons, couponLoading: couponLoading, onRedeemCoupon: handleRedeemCoupon, availablePoints: availablePoints, pointUnit: 1000 }), _jsx(PaymentMethodSection, { selectedPaymentMethod: selectedPaymentMethod, setSelectedPaymentMethod: setSelectedPaymentMethod }), _jsx("section", { className: "bg-white rounded-lg p-6 shadow-sm", children: _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: agreeTerms, onChange: (e) => setAgreeTerms(e.target.checked), className: "w-5 h-5 accent-[#eb4d32]" }), _jsx("span", { className: "font-bold text-gray-700", children: "\uCDE8\uC18C \uBC0F \uD658\uBD88 \uADDC\uC815\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4." })] }) })] }), _jsx("div", { className: "w-[380px]", children: _jsx(PaymentSummary, { paymentData: paymentData, selectedPaymentMethod: selectedPaymentMethod, onPayment: handlePayment, isProcessing: isLoading }) })] }) }), _jsx(Footer, {})] }));
}
