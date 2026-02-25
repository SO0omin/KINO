import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Search } from "lucide-react";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { cancelReservation, getMyCoupons, getMyMembershipCards, getMyPageSummary, getMyReservations, getMyVouchers, redeemCoupon, registerMembershipCard, registerVoucher, } from "../api/myPageApi";
const PATH_TO_KEY = {
    "/my-page": "dashboard",
    "/my-page/reservations": "reservations",
    "/my-page/vouchers": "vouchers-movie",
    "/my-page/vouchers/movie": "vouchers-movie",
    "/my-page/vouchers/store": "vouchers-store",
    "/my-page/coupons": "coupons",
    "/my-page/points": "points",
    "/my-page/movie-story": "movie-story",
    "/my-page/events": "events",
    "/my-page/inquiries": "inquiries",
    "/my-page/payments": "payments",
    "/my-page/cards": "cards",
};
const MENU_CONFIG = [
    { label: "예매/구매내역", key: "reservations", path: "/my-page/reservations" },
    {
        label: "영화/스토어 관람권",
        key: "vouchers",
        path: "/my-page/vouchers/movie",
        children: [
            { label: "영화관람권", path: "/my-page/vouchers/movie" },
            { label: "스토어 교환권", path: "/my-page/vouchers/store" },
        ],
    },
    { label: "메가박스/제휴쿠폰", key: "coupons", path: "/my-page/coupons" },
    {
        label: "멤버십 포인트",
        key: "points",
        path: "/my-page/points",
        children: [
            { label: "포인트 이용내역", path: "/my-page/points" },
            { label: "멤버십 카드관리", path: "/my-page/cards" },
        ],
    },
    { label: "나의 무비스토리", key: "movie-story", path: "/my-page/movie-story" },
    { label: "나의 이벤트 응모내역", key: "events", path: "/my-page/events" },
    { label: "나의 문의내역", key: "inquiries", path: "/my-page/inquiries" },
    { label: "중앙페이 결제수단 관리", key: "payments", path: "/my-page/payments" },
    { label: "자주쓰는 카드 관리", key: "cards", path: "/my-page/cards" },
];
function formatDateTime(value) {
    // Some backends return non-ISO datetime (e.g. "2026-04-27 03:39:45.000000").
    // Normalize and guard to avoid runtime crash on invalid date parsing.
    const normalized = value?.includes(" ") ? value.replace(" ", "T") : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function formatMoney(value) {
    return `${value.toLocaleString()}원`;
}
function formatYmd(value) {
    const d = new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function formatDateDot(value) {
    if (!value)
        return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "-";
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
function shiftDays(base, days) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
}
function toMonthKey(value) {
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
}
function monthLabel(monthKey) {
    const [year, month] = monthKey.split("-");
    return `${year}년 ${Number(month)}월`;
}
function splitReservations(items) {
    const active = items.filter((item) => item.paymentStatus !== "CANCELLED");
    const cancelled = items.filter((item) => item.paymentStatus === "CANCELLED");
    return { active, cancelled };
}
function breadcrumbLabels(pageKey) {
    if (pageKey === "dashboard")
        return ["나의 메가박스"];
    const byPage = {
        dashboard: ["나의 메가박스"],
        reservations: ["나의 메가박스", "예매/구매내역", "예매내역"],
        "vouchers-movie": ["나의 메가박스", "영화/스토어 관람권", "영화관람권"],
        "vouchers-store": ["나의 메가박스", "영화/스토어 관람권", "스토어 교환권"],
        coupons: ["나의 메가박스", "메가박스/제휴쿠폰", "메가박스 쿠폰"],
        points: ["나의 메가박스", "멤버십 포인트", "포인트 이용내역"],
        "movie-story": ["나의 메가박스", "나의 무비스토리", "무비타임라인"],
        events: ["나의 메가박스", "나의 이벤트 응모내역"],
        inquiries: ["나의 메가박스", "나의 문의내역", "1:1 문의내역"],
        payments: ["나의 메가박스", "중앙페이 결제수단 관리"],
        cards: ["나의 메가박스", "멤버십 포인트", "멤버십 카드관리"],
    };
    return byPage[pageKey];
}
function EmptyLine({ message }) {
    return _jsx("div", { className: "py-10 text-center text-base text-gray-300", children: message });
}
export default function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const memberId = useMemo(() => {
        const q = new URLSearchParams(location.search).get("memberId");
        return Number(q || 1);
    }, [location.search]);
    const pageKey = PATH_TO_KEY[location.pathname] ?? "dashboard";
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [isCancelling, setIsCancelling] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [reservationTab, setReservationTab] = useState("reservation");
    const [historyType, setHistoryType] = useState("current");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [appliedHistoryType, setAppliedHistoryType] = useState("current");
    const [appliedMonth, setAppliedMonth] = useState("");
    const today = useMemo(() => new Date(), []);
    const [purchaseSelectType, setPurchaseSelectType] = useState("all");
    const [purchaseStatusType, setPurchaseStatusType] = useState("all");
    const [purchaseRange, setPurchaseRange] = useState("month1");
    const [purchaseFrom, setPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
    const [purchaseTo, setPurchaseTo] = useState(formatYmd(today.toISOString()));
    const [appliedPurchaseSelectType, setAppliedPurchaseSelectType] = useState("all");
    const [appliedPurchaseStatusType, setAppliedPurchaseStatusType] = useState("all");
    const [appliedPurchaseFrom, setAppliedPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
    const [appliedPurchaseTo, setAppliedPurchaseTo] = useState(formatYmd(today.toISOString()));
    const [pointRange, setPointRange] = useState("week");
    const [pointFrom, setPointFrom] = useState(formatYmd(shiftDays(today, -7).toISOString()));
    const [pointTo, setPointTo] = useState(formatYmd(today.toISOString()));
    const [voucherStatus, setVoucherStatus] = useState("available");
    const [showVoucherRegisterModal, setShowVoucherRegisterModal] = useState(false);
    const [voucherRegisterCode, setVoucherRegisterCode] = useState("");
    const [voucherRegisterError, setVoucherRegisterError] = useState("");
    const [voucherItems, setVoucherItems] = useState([]);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherRegistering, setVoucherRegistering] = useState(false);
    const [couponTab, setCouponTab] = useState("megabox");
    const [couponKindFilter, setCouponKindFilter] = useState("전체");
    const [couponSourceFilter, setCouponSourceFilter] = useState("전체");
    const [couponStatusFilter, setCouponStatusFilter] = useState("available");
    const [couponHiddenOnly, setCouponHiddenOnly] = useState(false);
    const [couponItems, setCouponItems] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showCouponRegisterModal, setShowCouponRegisterModal] = useState(false);
    const [couponRegisterCode, setCouponRegisterCode] = useState("");
    const [couponRegistering, setCouponRegistering] = useState(false);
    const [couponRegisterError, setCouponRegisterError] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [membershipCards, setMembershipCards] = useState([]);
    const [membershipCardLoading, setMembershipCardLoading] = useState(false);
    const [showCardRegisterModal, setShowCardRegisterModal] = useState(false);
    const [cardNumberInput, setCardNumberInput] = useState("");
    const [cardCvcInput, setCardCvcInput] = useState("");
    const [cardRegistering, setCardRegistering] = useState(false);
    const [cardRegisterError, setCardRegisterError] = useState("");
    const load = async () => {
        setLoading(true);
        try {
            const [summaryData, reservationData] = await Promise.all([
                getMyPageSummary(memberId),
                getMyReservations(memberId),
            ]);
            setSummary(summaryData);
            setReservations(reservationData);
        }
        catch (error) {
            alert(error?.message ?? "마이페이지 데이터를 불러오지 못했습니다.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, [memberId]);
    const handleCancel = async (reservationId, reason) => {
        setIsCancelling(reservationId);
        try {
            await cancelReservation(memberId, reservationId, reason.trim() || "사용자 요청 취소");
            await load();
            setShowCancelModal(false);
            setCancelTargetId(null);
            setCancelReason("");
            alert("환불(취소) 처리가 완료되었습니다.");
        }
        catch (error) {
            alert(error?.message ?? "환불 처리 중 오류가 발생했습니다.");
        }
        finally {
            setIsCancelling(null);
        }
    };
    const moveMenu = (path) => {
        navigate(`${path}${location.search || ""}`);
    };
    const openCancelModal = (reservationId) => {
        setCancelTargetId(reservationId);
        setCancelReason("");
        setShowCancelModal(true);
    };
    const openVoucherRegisterModal = () => {
        setVoucherRegisterCode("");
        setVoucherRegisterError("");
        setShowVoucherRegisterModal(true);
    };
    const closeVoucherRegisterModal = () => {
        setShowVoucherRegisterModal(false);
        setVoucherRegisterCode("");
        setVoucherRegisterError("");
    };
    const handleVoucherRegister = () => {
        const isMovieVoucher = pageKey === "vouchers-movie";
        const digits = voucherRegisterCode.replace(/\D/g, "");
        const valid = isMovieVoucher
            ? digits.length === 12 || digits.length === 16
            : digits.length === 16;
        if (!valid) {
            setVoucherRegisterError(isMovieVoucher
                ? "영화관람권 번호는 12자리 또는 16자리 숫자만 가능합니다."
                : "스토어 교환권 번호는 16자리 숫자만 가능합니다.");
            return;
        }
        setVoucherRegisterError("");
        setVoucherRegistering(true);
        registerVoucher({
            memberId,
            voucherType: isMovieVoucher ? "MOVIE" : "STORE",
            code: digits,
        })
            .then(async (response) => {
            await loadVouchers();
            alert(response.message || "등록이 완료되었습니다.");
            closeVoucherRegisterModal();
        })
            .catch((error) => {
            setVoucherRegisterError(error?.message ?? "등록 처리 중 오류가 발생했습니다.");
        })
            .finally(() => {
            setVoucherRegistering(false);
        });
    };
    const mapVoucherStatusToApi = (status) => {
        if (status === "available")
            return "AVAILABLE";
        if (status === "used")
            return "USED";
        return "EXPIRED";
    };
    const mapVoucherStatusLabel = (status, isMovieVoucher) => {
        if (status === "USED")
            return isMovieVoucher ? "사용완료" : "교환완료";
        if (status === "EXPIRED")
            return "기간만료";
        return "사용가능";
    };
    const loadVouchers = async () => {
        const isVoucherPage = pageKey === "vouchers-movie" || pageKey === "vouchers-store";
        if (!isVoucherPage)
            return;
        setVoucherLoading(true);
        try {
            const isMovieVoucher = pageKey === "vouchers-movie";
            const rows = await getMyVouchers(memberId, isMovieVoucher ? "MOVIE" : "STORE", mapVoucherStatusToApi(voucherStatus));
            setVoucherItems(rows);
        }
        catch (error) {
            alert(error?.message ?? "관람권/교환권 정보를 불러오지 못했습니다.");
            setVoucherItems([]);
        }
        finally {
            setVoucherLoading(false);
        }
    };
    useEffect(() => {
        if (pageKey !== "vouchers-movie" && pageKey !== "vouchers-store")
            return;
        loadVouchers();
    }, [pageKey, memberId, voucherStatus]);
    const mapCouponStatusLabel = (status) => {
        if (status === "USED")
            return "사용완료";
        if (status === "EXPIRED")
            return "기간만료";
        return "사용가능";
    };
    const normalizeCouponStatus = (status) => {
        if (status === "USED")
            return "used";
        if (status === "EXPIRED")
            return "expired";
        return "available";
    };
    const loadCoupons = async () => {
        if (pageKey !== "coupons")
            return;
        setCouponLoading(true);
        try {
            const rows = await getMyCoupons(memberId);
            setCouponItems(rows);
        }
        catch (error) {
            alert(error?.message ?? "쿠폰 목록을 불러오지 못했습니다.");
            setCouponItems([]);
        }
        finally {
            setCouponLoading(false);
        }
    };
    useEffect(() => {
        if (pageKey !== "coupons")
            return;
        loadCoupons();
    }, [pageKey, memberId]);
    const filteredCoupons = useMemo(() => {
        return couponItems.filter((item) => {
            const byTab = couponTab === "megabox"
                ? item.sourceType !== "PARTNER"
                : item.sourceType === "PARTNER";
            const byKind = couponKindFilter === "전체"
                ? true
                : item.couponKind === couponKindFilter;
            const byStatus = normalizeCouponStatus(item.status) === couponStatusFilter;
            const bySource = couponSourceFilter === "전체"
                ? true
                : couponSourceFilter === "할인쿠폰"
                    ? item.discountType === "FIXED" || item.discountType === "RATE"
                    : couponSourceFilter === "VIP쿠폰"
                        ? item.couponName.includes("VIP")
                        : item.couponName.includes("패스");
            const byHidden = couponHiddenOnly ? normalizeCouponStatus(item.status) !== "available" : true;
            return byTab && byKind && byStatus && bySource && byHidden;
        });
    }, [couponItems, couponTab, couponKindFilter, couponStatusFilter, couponSourceFilter, couponHiddenOnly]);
    const openCouponRegisterModal = () => {
        setCouponRegisterCode("");
        setCouponRegisterError("");
        setShowCouponRegisterModal(true);
    };
    const closeCouponRegisterModal = () => {
        setShowCouponRegisterModal(false);
        setCouponRegisterCode("");
        setCouponRegisterError("");
    };
    const openCouponInfoModal = (coupon) => {
        setSelectedCoupon(coupon);
    };
    const closeCouponInfoModal = () => {
        setSelectedCoupon(null);
    };
    const handleCouponRegister = async () => {
        if (!couponRegisterCode.trim()) {
            setCouponRegisterError("쿠폰 번호를 입력해 주세요.");
            return;
        }
        setCouponRegistering(true);
        setCouponRegisterError("");
        try {
            await redeemCoupon(memberId, couponRegisterCode);
            await loadCoupons();
            closeCouponRegisterModal();
            alert("할인쿠폰 등록이 완료되었습니다.");
        }
        catch (error) {
            setCouponRegisterError(error?.message ?? "쿠폰 등록에 실패했습니다.");
        }
        finally {
            setCouponRegistering(false);
        }
    };
    const loadMembershipCards = async () => {
        if (pageKey !== "cards")
            return;
        setMembershipCardLoading(true);
        try {
            const rows = await getMyMembershipCards(memberId);
            setMembershipCards(rows);
        }
        catch (error) {
            alert(error?.message ?? "멤버십 카드 목록을 불러오지 못했습니다.");
            setMembershipCards([]);
        }
        finally {
            setMembershipCardLoading(false);
        }
    };
    useEffect(() => {
        if (pageKey !== "cards")
            return;
        loadMembershipCards();
    }, [pageKey, memberId]);
    const openCardRegisterModal = () => {
        setCardNumberInput("");
        setCardCvcInput("");
        setCardRegisterError("");
        setShowCardRegisterModal(true);
    };
    const closeCardRegisterModal = () => {
        setShowCardRegisterModal(false);
        setCardNumberInput("");
        setCardCvcInput("");
        setCardRegisterError("");
    };
    const handleMembershipCardRegister = async () => {
        const cardNumber = cardNumberInput.replace(/\D/g, "");
        const cvc = cardCvcInput.replace(/\D/g, "");
        if (cardNumber.length < 12 || cardNumber.length > 19) {
            setCardRegisterError("카드번호는 12~19자리 숫자만 가능합니다.");
            return;
        }
        if (cvc.length < 3 || cvc.length > 4) {
            setCardRegisterError("CVC 번호는 3~4자리 숫자만 가능합니다.");
            return;
        }
        setCardRegistering(true);
        setCardRegisterError("");
        try {
            const response = await registerMembershipCard({
                memberId,
                cardNumber,
                cvc,
            });
            await loadMembershipCards();
            closeCardRegisterModal();
            alert(response.message || "멤버십 카드가 등록되었습니다.");
        }
        catch (error) {
            setCardRegisterError(error?.message ?? "멤버십 카드 등록에 실패했습니다.");
        }
        finally {
            setCardRegistering(false);
        }
    };
    const formatCouponCodeForModal = (code) => {
        const cleaned = (code ?? "").replace(/[^0-9A-Za-z]/g, "");
        if (cleaned.length < 8)
            return code || "-";
        return cleaned.match(/.{1,4}/g)?.join("-") ?? cleaned;
    };
    const { active: activeReservations, cancelled: cancelledReservations } = splitReservations(reservations);
    const crumbs = breadcrumbLabels(pageKey);
    const monthOptions = useMemo(() => {
        const base = historyType === "past" ? reservations : activeReservations;
        const keys = Array.from(new Set(base.map((item) => toMonthKey(item.startTime))));
        keys.sort((a, b) => b.localeCompare(a));
        return keys;
    }, [historyType, reservations, activeReservations]);
    useEffect(() => {
        if (monthOptions.length === 0) {
            setSelectedMonth("");
            setAppliedMonth("");
            return;
        }
        const fallback = monthOptions[0];
        if (!selectedMonth)
            setSelectedMonth(fallback);
        if (!appliedMonth)
            setAppliedMonth(fallback);
    }, [monthOptions, selectedMonth, appliedMonth]);
    const visibleReservations = useMemo(() => {
        const now = Date.now();
        return activeReservations.filter((item) => {
            const start = new Date(item.startTime).getTime();
            const historyMatched = appliedHistoryType === "current" ? start >= now : start < now;
            const monthMatched = appliedHistoryType === "current"
                ? true
                : (!appliedMonth || toMonthKey(item.startTime) === appliedMonth);
            return historyMatched && monthMatched;
        });
    }, [activeReservations, appliedHistoryType, appliedMonth]);
    const purchaseRows = useMemo(() => {
        const fromTime = new Date(`${appliedPurchaseFrom}T00:00:00`).getTime();
        const toTime = new Date(`${appliedPurchaseTo}T23:59:59`).getTime();
        return reservations
            .map((item) => {
            const paymentDate = new Date(item.startTime);
            const isCancelled = item.paymentStatus === "CANCELLED" || item.reservationStatus === "CANCELED";
            return {
                id: item.reservationId,
                paymentDate,
                category: "영화예매",
                productName: item.movieTitle,
                amount: item.finalAmount,
                statusLabel: isCancelled ? "취소" : "결제완료",
                isCancelled,
            };
        })
            .filter((row) => {
            const dateMatched = row.paymentDate.getTime() >= fromTime && row.paymentDate.getTime() <= toTime;
            const selectMatched = appliedPurchaseSelectType === "all" ? true : row.category === "영화예매";
            const statusMatched = appliedPurchaseStatusType === "all"
                ? true
                : appliedPurchaseStatusType === "purchase"
                    ? !row.isCancelled
                    : row.isCancelled;
            return dateMatched && selectMatched && statusMatched;
        })
            .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
    }, [
        reservations,
        appliedPurchaseSelectType,
        appliedPurchaseStatusType,
        appliedPurchaseFrom,
        appliedPurchaseTo,
    ]);
    const applyPurchaseRange = (range) => {
        setPurchaseRange(range);
        const to = new Date();
        const from = new Date(to);
        if (range === "week")
            from.setDate(to.getDate() - 7);
        if (range === "month1")
            from.setMonth(to.getMonth() - 1);
        if (range === "month3")
            from.setMonth(to.getMonth() - 3);
        if (range === "month6")
            from.setMonth(to.getMonth() - 6);
        setPurchaseFrom(formatYmd(from.toISOString()));
        setPurchaseTo(formatYmd(to.toISOString()));
    };
    const applyPointRange = (range) => {
        setPointRange(range);
        const to = new Date();
        const from = new Date(to);
        if (range === "week")
            from.setDate(to.getDate() - 7);
        if (range === "month1")
            from.setMonth(to.getMonth() - 1);
        if (range === "month3")
            from.setMonth(to.getMonth() - 3);
        if (range === "month6")
            from.setMonth(to.getMonth() - 6);
        setPointFrom(formatYmd(from.toISOString()));
        setPointTo(formatYmd(to.toISOString()));
    };
    const renderDashboard = () => {
        const cardClass = "rounded-sm border border-gray-200 bg-white p-5";
        return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "overflow-hidden rounded-md border border-[#000000] bg-[#000000] text-[#ffffff]", children: [_jsx("div", { className: "bg-[#000000] px-8 py-9", children: _jsxs("div", { className: "flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "flex h-24 w-24 items-center justify-center rounded-3xl bg-[#eb4d32] text-2xl font-bold", children: "W" }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold leading-none", children: "\uC548\uB155\uD558\uC138\uC694!" }), _jsxs("p", { className: "mt-2 text-3xl font-semibold leading-none", children: [(summary?.availablePoints ?? 0).toLocaleString(), " P"] }), _jsxs("p", { className: "mt-3 text-base font-semibold", children: [summary?.memberName ?? "회원", "\uB2D8"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm", children: ["\uD604\uC7AC\uB4F1\uAE09 ", _jsx("span", { className: "font-semibold text-[#eb4d32]", children: "WELCOME" })] }), _jsx("div", { className: "mt-3 inline-block rounded bg-[#eb4d32] px-4 py-1 text-sm font-semibold text-[#ffffff]", children: "\uB2E4\uC74C Friends \uB4F1\uAE09\uAE4C\uC9C0 6,000 P \uB0A8\uC558\uC5B4\uC694!" }), _jsx("div", { className: "mt-4 flex items-center justify-end gap-5 text-sm", children: ["Welcome", "Friends", "VIP", "VVIP", "MVIP"].map((label, index) => (_jsxs("div", { className: "flex items-center gap-2 text-white/85", children: [_jsx("span", { className: `h-3 w-3 rounded-full ${index === 0 ? "bg-[#eb4d32]" : "bg-[#ffffff]"}` }), _jsx("span", { children: label })] }, label))) })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 gap-0 border-t border-[#000000] bg-[#ffffff] text-[#000000] lg:grid-cols-4", children: [_jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]", children: [_jsx("span", { children: "\uD3EC\uC778\uD2B8 \uC774\uC6A9\uB0B4\uC5ED" }), _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" })] }), _jsxs("p", { className: "text-sm", children: ["\uC801\uB9BD\uC608\uC815 ", _jsx("span", { className: "float-right font-semibold", children: "0 P" })] }), _jsxs("p", { className: "mt-2 text-sm", children: ["\uB2F9\uC6D4\uC18C\uBA78\uC608\uC815 ", _jsx("span", { className: "float-right font-semibold", children: "0 P" })] })] }), _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]", children: [_jsx("span", { children: "\uC120\uD638\uD558\uB294 \uADF9\uC7A5" }), _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" })] }), _jsx("p", { className: "text-[#eb4d32]", children: "\uC120\uD638\uADF9\uC7A5" }), _jsx("p", { children: "\uC744 \uC124\uC815\uD558\uC138\uC694." })] }), _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]", children: [_jsx("span", { children: "\uAD00\uB78C\uAD8C/\uCFE0\uD3F0" }), _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" })] }), _jsxs("p", { className: "text-sm", children: ["\uC601\uD654\uAD00\uB78C\uAD8C ", _jsx("span", { className: "float-right font-semibold", children: "0 \uB9E4" })] }), _jsxs("p", { className: "mt-2 text-sm", children: ["\uC2A4\uD1A0\uC5B4\uAD50\uD658\uAD8C ", _jsx("span", { className: "float-right font-semibold", children: "0 \uB9E4" })] }), _jsxs("p", { className: "mt-2 text-sm", children: ["\uD560\uC778/\uC81C\uD734\uCFE0\uD3F0 ", _jsxs("span", { className: "float-right font-semibold", children: [summary?.availableCouponCount ?? 0, " \uB9E4"] })] })] }), _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]", children: [_jsx("span", { children: "\uD074\uB7FD \uBA64\uBC84\uC2ED" }), _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" })] }), _jsx("p", { children: "\uD2B9\uBCC4\uD55C \uBA64\uBC84\uC2ED \uD61C\uD0DD\uC744 \uB9CC\uB098\uBCF4\uC138\uC694!" })] })] })] }), _jsxs("section", { className: "mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: cardClass, children: [_jsxs("div", { className: "mb-5 flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-semibold text-[#eb4d32]", children: "\uB098\uC758 \uBB34\uBE44\uC2A4\uD1A0\uB9AC" }), _jsx("button", { className: "rounded border border-gray-300 px-4 py-1 text-sm", children: "\uBCF8 \uC601\uD654 \uB4F1\uB85D" })] }), _jsxs("div", { className: "grid grid-cols-3 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-3xl font-semibold text-[#eb4d32]", children: summary?.paidReservationCount ?? 0 }), _jsx("p", { className: "text-sm", children: "\uBCF8 \uC601\uD654" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-semibold text-[#eb4d32]", children: summary?.reviewCount ?? 0 }), _jsx("p", { className: "text-sm", children: "\uAD00\uB78C\uD3C9" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-semibold text-[#eb4d32]", children: summary?.likedMovieCount ?? 0 }), _jsx("p", { className: "text-sm", children: "\uBCF4\uACE0\uC2F6\uC5B4" })] })] })] }), _jsxs("div", { className: cardClass, children: [_jsxs("div", { className: "mb-5 flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-semibold text-[#eb4d32]", children: "\uC120\uD638\uAD00\uB78C\uC815\uBCF4" }), _jsx("button", { className: "rounded border border-gray-300 px-4 py-1 text-sm", children: "\uC124\uC815" })] }), _jsxs("div", { className: "space-y-4 text-base text-[#eb4d32]", children: [_jsx("p", { children: "\u00B7 \uB0B4 \uC120\uD638\uC7A5\uB974" }), _jsx("p", { children: "\u00B7 \uB0B4 \uC120\uD638\uC2DC\uAC04" })] })] })] }), _jsxs("section", { className: "mt-7 rounded-sm border border-gray-200 bg-white p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between border-b border-gray-300 pb-3", children: [_jsx("h3", { className: "text-2xl font-semibold text-[#eb4d32]", children: "\uB098\uC758 \uC608\uB9E4\uB0B4\uC5ED" }), _jsxs("button", { className: "flex items-center gap-1 text-base text-gray-600", onClick: () => moveMenu("/my-page/reservations"), children: ["\uB354\uBCF4\uAE30 ", _jsx(ChevronRight, { className: "h-5 w-5" })] })] }), activeReservations.length === 0 ? _jsx(EmptyLine, { message: "\uC608\uB9E4 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }) : (_jsx("div", { className: "divide-y", children: activeReservations.slice(0, 2).map((item) => (_jsxs("div", { className: "flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold", children: item.movieTitle }), _jsxs("p", { className: "text-sm text-gray-600", children: [item.theaterName, " \u00B7 ", formatDateTime(item.startTime), " \u00B7 \uC88C\uC11D ", item.seatNames.join(", ") || "-"] })] }), _jsx("p", { className: "font-semibold", children: formatMoney(item.finalAmount) })] }, item.reservationId))) }))] }), _jsxs("section", { className: "mt-7 rounded-sm border border-gray-200 bg-white p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between border-b border-gray-300 pb-3", children: [_jsx("h3", { className: "text-2xl font-semibold text-[#eb4d32]", children: "\uB098\uC758 \uAD6C\uB9E4\uB0B4\uC5ED" }), _jsxs("button", { className: "flex items-center gap-1 text-base text-gray-600", children: ["\uB354\uBCF4\uAE30 ", _jsx(ChevronRight, { className: "h-5 w-5" })] })] }), _jsx(EmptyLine, { message: "\uAD6C\uB9E4\uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] }), _jsxs("section", { className: "mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-sm border border-gray-200 bg-white p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between border-b border-gray-300 pb-3", children: [_jsx("h3", { className: "text-2xl font-semibold text-[#eb4d32]", children: "\uCC38\uC5EC\uC774\uBCA4\uD2B8" }), _jsxs("button", { className: "flex items-center gap-1 text-base text-gray-600", onClick: () => moveMenu("/my-page/events"), children: ["\uB354\uBCF4\uAE30 ", _jsx(ChevronRight, { className: "h-5 w-5" })] })] }), _jsx(EmptyLine, { message: "\uCC38\uC5EC\uD55C \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })] }), _jsxs("div", { className: "rounded-sm border border-gray-200 bg-white p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between border-b border-gray-300 pb-3", children: [_jsx("h3", { className: "text-2xl font-semibold text-[#eb4d32]", children: "\uBB38\uC758\uB0B4\uC5ED" }), _jsxs("button", { className: "flex items-center gap-1 text-base text-gray-600", onClick: () => moveMenu("/my-page/inquiries"), children: ["\uB354\uBCF4\uAE30 ", _jsx(ChevronRight, { className: "h-5 w-5" })] })] }), _jsx(EmptyLine, { message: "\uBB38\uC758\uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })] })] }));
    };
    const renderReservations = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uC608\uB9E4/\uAD6C\uB9E4 \uB0B4\uC5ED" }), _jsxs("div", { className: "mt-5 flex border-b border-gray-300", children: [_jsx("button", { className: `w-40 border border-b-0 px-4 py-2 ${reservationTab === "reservation" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`, onClick: () => setReservationTab("reservation"), children: "\uC608\uB9E4" }), _jsx("button", { className: `w-40 border border-b-0 px-4 py-2 ${reservationTab === "purchase" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`, onClick: () => setReservationTab("purchase"), children: "\uAD6C\uB9E4" })] }), reservationTab === "reservation" ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-5 rounded-sm bg-[#ffffff] p-5", children: _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm", children: [_jsx("span", { className: "font-semibold", children: "\uAD6C\uBD84" }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: historyType === "current", onChange: () => setHistoryType("current") }), "\uC608\uB9E4\uB0B4\uC5ED"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: historyType === "past", onChange: () => setHistoryType("past") }), "\uC9C0\uB09C\uB0B4\uC5ED"] }), _jsx("select", { className: "rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400", value: selectedMonth, onChange: (e) => setSelectedMonth(e.target.value), disabled: historyType === "current", children: monthOptions.length === 0 ? (_jsx("option", { value: "", children: "\uC6D4 \uB370\uC774\uD130 \uC5C6\uC74C" })) : (monthOptions.map((month) => (_jsx("option", { value: month, children: monthLabel(month) }, month)))) }), _jsxs("button", { className: "flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm", onClick: () => {
                                        setAppliedHistoryType(historyType);
                                        setAppliedMonth(historyType === "current" ? "" : selectedMonth);
                                    }, children: [_jsx(Search, { className: "h-4 w-4" }), " \uC870\uD68C"] })] }) }), _jsx("div", { className: "mt-6 rounded-sm border border-gray-200 bg-white", children: loading ? (_jsx("div", { className: "py-12 text-center text-gray-500", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : visibleReservations.length === 0 ? (_jsx("div", { className: "py-12 text-center text-gray-500", children: "\uC608\uB9E4 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "divide-y divide-gray-200", children: visibleReservations.map((item) => (_jsxs("div", { className: "flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold", children: item.movieTitle }), _jsxs("p", { className: "text-sm text-gray-600", children: [item.theaterName, " / ", item.screenName] }), _jsx("p", { className: "text-sm text-gray-600", children: formatDateTime(item.startTime) }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\uC88C\uC11D: ", item.seatNames.join(", ") || "-"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: formatMoney(item.finalAmount) }), item.cancellable ? (_jsx("button", { className: "mt-2 rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]", disabled: isCancelling === item.reservationId, onClick: () => openCancelModal(item.reservationId), children: isCancelling === item.reservationId ? "처리 중..." : "환불하기" })) : (_jsx("span", { className: "mt-2 inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-500", children: "\uD658\uBD88 \uBD88\uAC00" }))] })] }, item.reservationId))) })) })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-5 rounded-sm bg-[#ffffff] p-5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm", children: [_jsx("span", { className: "mr-2 font-semibold text-[#000000]", children: "\uAD6C\uBD84" }), _jsxs("select", { className: "rounded border border-gray-200 bg-[#ffffff] px-3 py-1.5 text-sm text-[#000000]", value: purchaseSelectType, onChange: (e) => setPurchaseSelectType(e.target.value), children: [_jsx("option", { value: "all", children: "\uC804\uCCB4" }), _jsx("option", { value: "movie", children: "\uC601\uD654\uC608\uB9E4" })] }), _jsxs("label", { className: "flex items-center gap-1.5 text-[#000000]", children: [_jsx("input", { type: "radio", checked: purchaseStatusType === "all", onChange: () => setPurchaseStatusType("all") }), "\uC804\uCCB4"] }), _jsxs("label", { className: "flex items-center gap-1.5 text-[#000000]", children: [_jsx("input", { type: "radio", checked: purchaseStatusType === "purchase", onChange: () => setPurchaseStatusType("purchase") }), "\uAD6C\uB9E4\uB0B4\uC5ED"] }), _jsxs("label", { className: "flex items-center gap-1.5 text-[#000000]", children: [_jsx("input", { type: "radio", checked: purchaseStatusType === "cancel", onChange: () => setPurchaseStatusType("cancel") }), "\uCDE8\uC18C\uB0B4\uC5ED"] })] }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2 text-sm", children: [_jsx("span", { className: "mr-2 font-semibold text-[#000000]", children: "\uC870\uD68C\uAE30\uAC04" }), _jsx("button", { className: `rounded border border-gray-200 px-3 py-1 ${purchaseRange === "week" ? "text-[#eb4d32]" : "text-[#000000]"}`, onClick: () => applyPurchaseRange("week"), children: "1\uC8FC\uC77C" }), _jsx("button", { className: `rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month1" ? "text-[#eb4d32]" : "text-[#000000]"}`, onClick: () => applyPurchaseRange("month1"), children: "1\uAC1C\uC6D4" }), _jsx("button", { className: `rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month3" ? "text-[#eb4d32]" : "text-[#000000]"}`, onClick: () => applyPurchaseRange("month3"), children: "3\uAC1C\uC6D4" }), _jsx("button", { className: `rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month6" ? "text-[#eb4d32]" : "text-[#000000]"}`, onClick: () => applyPurchaseRange("month6"), children: "6\uAC1C\uC6D4" }), _jsx("input", { type: "date", className: "rounded border border-gray-200 bg-[#ffffff] px-3 py-1", value: purchaseFrom, onChange: (e) => setPurchaseFrom(e.target.value) }), _jsx("span", { className: "text-[#000000]", children: "~" }), _jsx("input", { type: "date", className: "rounded border border-gray-200 bg-[#ffffff] px-3 py-1", value: purchaseTo, onChange: (e) => setPurchaseTo(e.target.value) }), _jsxs("button", { className: "flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-3 py-1 text-[#000000]", onClick: () => {
                                            setAppliedPurchaseSelectType(purchaseSelectType);
                                            setAppliedPurchaseStatusType(purchaseStatusType);
                                            setAppliedPurchaseFrom(purchaseFrom);
                                            setAppliedPurchaseTo(purchaseTo);
                                        }, children: [_jsx(Search, { className: "h-4 w-4" }), " \uC870\uD68C"] })] })] }), _jsx("div", { className: "mt-6 rounded-sm bg-[#ffffff]", children: _jsxs("div", { className: "p-5", children: [_jsxs("p", { className: "text-base font-semibold text-[#000000]", children: ["\uC804\uCCB4 ", purchaseRows.length, "\uAC74"] }), _jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "grid grid-cols-5 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]", children: [_jsx("span", { children: "\uACB0\uC81C\uC77C\uC2DC" }), _jsx("span", { children: "\uAD6C\uBD84" }), _jsx("span", { children: "\uC0C1\uD488\uBA85" }), _jsx("span", { children: "\uACB0\uC81C\uAE08\uC561" }), _jsx("span", { children: "\uC0C1\uD0DC" })] }), purchaseRows.length === 0 ? (_jsx("div", { className: "border-b border-gray-200 py-10 text-center text-[#000000]", children: "\uACB0\uC81C\uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (purchaseRows.map((row) => (_jsxs("div", { className: "grid grid-cols-5 border-b border-gray-200 px-4 py-3 text-center text-sm text-[#000000]", children: [_jsx("span", { children: formatDateTime(row.paymentDate.toISOString()) }), _jsx("span", { children: row.category }), _jsx("span", { children: row.productName }), _jsx("span", { children: formatMoney(row.amount) }), _jsx("span", { className: row.isCancelled ? "text-[#eb4d32]" : "text-[#000000]", children: row.statusLabel })] }, row.id))))] })] }) }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm bg-[#ffffff]", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#000000]", children: [_jsx("span", { children: "\uC774\uC6A9\uC548\uB0B4" }), _jsx("span", { children: "\u2303" })] }), _jsxs("div", { className: "p-4 text-sm leading-7 text-[#000000]", children: [_jsx("p", { className: "font-semibold", children: "[\uC2A4\uD1A0\uC5B4 \uAD6C\uB9E4/\uCDE8\uC18C \uC548\uB0B4]" }), _jsx("p", { children: "\u00B7 \uC2A4\uD1A0\uC5B4 \uC0C1\uD488\uC740 \uAD6C\uB9E4 \uD6C4 \uCDE8\uC18C\uAC00\uB2A5\uAE30\uAC04 \uB0B4 100% \uD658\uBD88\uC774 \uAC00\uB2A5\uD558\uBA70, \uBD80\uBD84\uD658\uBD88\uC740 \uBD88\uAC00 \uD569\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 (ex. 3\uAC1C\uC758 \uCFE0\uD3F0 \uD569 \uBC88\uC5D0 \uAD6C\uB9E4\uD558\uC2E0 \uACBD\uC6B0, 3\uAC1C \uBAA8\uB450 \uCDE8\uC18C\uB9CC \uAC00\uB2A5\uD558\uBA70 \uADF8 \uC911 \uC0AC\uC6A9\uD558\uC2E0 \uCFE0\uD3F0\uC774 \uC788\uB294 \uACBD\uC6B0 \uD658\uBD88\uC774 \uBD88\uAC00\uD569\uB2C8\uB2E4)" }), _jsx("p", { children: "\u00B7 \uC2A4\uD1A0\uC5B4 \uAD50\uD658\uAD8C\uC740 MMS\uB85C \uCD5C\uB300 1\uD68C \uC7AC\uC804\uC1A1 \uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { className: "mt-3 font-semibold", children: "[\uBAA8\uBC14\uC77C\uC624\uB354 \uAD6C\uB9E4/\uCDE8\uC18C \uC548\uB0B4]" }), _jsx("p", { children: "\u00B7 \uBAA8\uBC14\uC77C\uC624\uB354\uB294 \uBAA8\uBC14\uC77C\uC571\uC744 \uD1B5\uD574 \uC774\uC6A9\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uBAA8\uBC14\uC77C\uC624\uB354\uB294 \uAD6C\uB9E4 \uD6C4 \uC989\uC2DC \uC870\uB9AC\uB418\uB294 \uC0C1\uD488\uC73C\uB85C \uCDE8\uC18C\uAC00 \uBD88\uAC00\uD569\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uADF9\uC7A5 \uB9E4\uC810\uC5D0\uC11C \uC8FC\uBB38\uBC88\uD638\uAC00 \uD638\uCD9C\uB418\uBA74 \uC0C1\uD488\uC744 \uC218\uB839\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uADF9\uC7A5 \uC0C1\uD669\uC5D0 \uB530\uB77C \uC0C1\uD488\uC900\uBE44\uC2DC\uAC04\uC774 \uB2E4\uC18C \uAE38\uC5B4\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })] })] })] })), reservationTab === "reservation" ? (_jsxs("div", { className: "mt-10", children: [_jsx("h2", { className: "text-2xl font-semibold text-[#eb4d32]", children: "\uC608\uB9E4\uCDE8\uC18C\uB0B4\uC5ED" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "\u00B7 \uC0C1\uC601\uC77C \uAE30\uC900 7\uC77C\uAC04 \uCDE8\uC18C\uB0B4\uC5ED\uC744 \uD655\uC778\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs("div", { className: "mt-4 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uCDE8\uC18C\uC77C\uC2DC" }), _jsx("span", { children: "\uC601\uD654\uBA85" }), _jsx("span", { children: "\uADF9\uC7A5" }), _jsx("span", { children: "\uC0C1\uC601\uC77C\uC2DC" }), _jsx("span", { children: "\uCDE8\uC18C\uAE08\uC561" })] }), cancelledReservations.length === 0 ? (_jsx("div", { className: "py-6 text-center text-gray-500", children: "\uCDE8\uC18C\uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (cancelledReservations.map((item) => (_jsxs("div", { className: "grid grid-cols-5 border-t border-gray-200 px-4 py-3 text-center text-sm", children: [_jsx("span", { children: formatDateTime(item.startTime) }), _jsx("span", { children: item.movieTitle }), _jsx("span", { children: item.theaterName }), _jsx("span", { children: formatDateTime(item.startTime) }), _jsx("span", { children: formatMoney(item.finalAmount) })] }, item.reservationId))))] })] })) : null, reservationTab === "reservation" ? (_jsx("div", { className: "mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3", children: "\uC774\uC6A9\uC548\uB0B4" })) : null] }));
    const renderVouchers = () => {
        const isMovieVoucher = pageKey === "vouchers-movie";
        const statusOptions = isMovieVoucher
            ? [
                { value: "available", label: "사용가능" },
                { value: "used", label: "사용완료" },
                { value: "expired", label: "기간만료" },
            ]
            : [
                { value: "available", label: "사용가능" },
                { value: "used", label: "교환완료" },
                { value: "expired", label: "기간만료" },
            ];
        return (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: isMovieVoucher ? "영화관람권" : "스토어 교환권" }), _jsxs("div", { className: "mt-5 flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("p", { className: "mt-2 text-sm text-[#000000]", children: ["\u00B7 \uBCF4\uC720\uD558\uC2E0 ", isMovieVoucher ? "영화관람권/예매권" : "스토어 교환권", " \uB0B4\uC5ED\uC785\uB2C8\uB2E4."] }), _jsxs("p", { className: "text-sm text-[#000000]", children: ["\u00B7 ", isMovieVoucher ? "소지하신 지류(종이)관람권은 등록 후 이용하실 수 있습니다." : "소지하신 스토어교환권은 등록 후 이용하실 수 있습니다."] })] }), _jsx("button", { className: "rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]", onClick: openVoucherRegisterModal, children: isMovieVoucher ? "관람권등록" : "스토어 교환권 등록" })] }), _jsxs("div", { className: "mt-7 flex items-center justify-between", children: [_jsx("p", { className: "text-lg font-semibold text-[#000000]", children: isMovieVoucher ? (_jsxs(_Fragment, { children: ["\uCD1D ", _jsx("span", { className: "text-[#eb4d32]", children: voucherItems.length }), "\uB9E4"] })) : (_jsxs(_Fragment, { children: ["\uC804\uCCB4 ", _jsx("span", { className: "text-[#eb4d32]", children: voucherItems.length }), "\uAC74"] })) }), _jsx("select", { className: "rounded border border-gray-200 bg-[#ffffff] px-4 py-2 text-sm text-[#000000]", value: voucherStatus, onChange: (e) => setVoucherStatus(e.target.value), children: statusOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsx("div", { className: "mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]", children: isMovieVoucher ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-3 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]", children: [_jsx("span", { children: "\uAD00\uB78C\uAD8C\uBA85" }), _jsx("span", { children: "\uC720\uD6A8\uAE30\uAC04" }), _jsx("span", { children: "\uC0AC\uC6A9\uC0C1\uD0DC" })] }), voucherLoading ? (_jsx("div", { className: "py-8 text-center text-[#000000]", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : voucherItems.length === 0 ? (_jsx("div", { className: "py-8 text-center text-[#000000]", children: "\uC870\uD68C\uB41C \uAD00\uB78C\uAD8C \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (voucherItems.map((item) => (_jsxs("div", { className: "grid grid-cols-3 border-t border-gray-200 px-4 py-3 text-center text-sm text-[#000000]", children: [_jsx("span", { children: item.name }), _jsx("span", { children: item.validUntil ? formatDateTime(item.validUntil) : "-" }), _jsx("span", { children: mapVoucherStatusLabel(item.status, true) })] }, item.voucherId))))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-4 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]", children: [_jsx("span", { children: "\uAD6C\uBD84" }), _jsx("span", { children: "\uAD50\uD658\uAD8C\uBA85" }), _jsx("span", { children: "\uC720\uD6A8\uAE30\uAC04" }), _jsx("span", { children: "\uC0AC\uC6A9\uC0C1\uD0DC" })] }), voucherLoading ? (_jsx("div", { className: "py-8 text-center text-[#000000]", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : voucherItems.length === 0 ? (_jsx("div", { className: "py-8 text-center text-[#000000]", children: "\uB4F1\uB85D\uB41C \uAD50\uD658\uAD8C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (voucherItems.map((item) => (_jsxs("div", { className: "grid grid-cols-4 border-t border-gray-200 px-4 py-3 text-center text-sm text-[#000000]", children: [_jsx("span", { children: "\uAD50\uD658\uAD8C" }), _jsx("span", { children: item.name }), _jsx("span", { children: item.validUntil ? formatDateTime(item.validUntil) : "-" }), _jsx("span", { children: mapVoucherStatusLabel(item.status, false) })] }, item.voucherId))))] })) }), _jsx("div", { className: "mt-8 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]", children: _jsxs("div", { className: "flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#000000]", children: [_jsx("span", { children: "\uC774\uC6A9\uC548\uB0B4" }), _jsx("span", { className: "text-gray-400", children: "\u2304" })] }) })] }));
    };
    const renderCoupons = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uBA54\uAC00\uBC15\uC2A4/\uC81C\uD734\uCFE0\uD3F0" }), _jsxs("div", { className: "mt-5 flex border-b border-gray-200", children: [_jsx("button", { className: `w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "megabox" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`, onClick: () => setCouponTab("megabox"), children: "\uBA54\uAC00\uBC15\uC2A4 \uCFE0\uD3F0" }), _jsx("button", { className: `w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "partner" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`, onClick: () => setCouponTab("partner"), children: "\uC81C\uD734 \uCFE0\uD3F0" })] }), couponTab === "partner" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-5", children: [_jsx("p", { className: "text-sm text-[#000000]", children: "\u00B7 \uC81C\uD734\uCFE0\uD3F0 \uB0B4\uC5ED\uC785\uB2C8\uB2E4." }), _jsx("p", { className: "text-sm text-[#000000]", children: "\u00B7 \uAC01 \uCFE0\uD3F0 \uBCC4 \uC0AC\uC6A9 \uBC29\uBC95\uC774 \uB2E4\uB974\uB2C8 \uC0AC\uC6A9 \uC804 \uC0C1\uC138 \uCFE0\uD3F0\uC815\uBCF4\uB97C \uD655\uC778\uBC14\uB78D\uB2C8\uB2E4." })] }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]", children: [_jsxs("div", { className: "grid grid-cols-2 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uCFE0\uD3F0\uBA85" }), _jsx("span", { children: "\uBC1C\uAE09\uC77C\uC790" })] }), couponLoading ? (_jsx("div", { className: "py-10 text-center text-sm text-gray-500", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : couponItems.filter((item) => item.sourceType === "PARTNER").length === 0 ? (_jsx("div", { className: "py-10 text-center text-sm text-gray-500", children: "\uCFE0\uD3F0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (couponItems
                                .filter((item) => item.sourceType === "PARTNER")
                                .map((item) => (_jsxs("div", { className: "grid grid-cols-2 items-center border-t border-gray-200 px-4 py-4 text-center text-sm text-[#000000]", children: [_jsx("span", { children: item.couponName }), _jsx("span", { children: item.issuedAt ? formatDateTime(item.issuedAt) : "-" })] }, item.memberCouponId))))] }), _jsx("div", { className: "mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3", children: "\uC774\uC6A9\uC548\uB0B4" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-5 flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-[#000000]", children: "\u00B7 \uBCF4\uC720\uD558\uC2E0 \uCFE0\uD3F0 \uB0B4\uC5ED\uC785\uB2C8\uB2E4." }), _jsx("p", { className: "text-sm text-[#000000]", children: "\u00B7 \uAC01 \uCFE0\uD3F0 \uBCC4 \uC0AC\uC6A9 \uBC29\uBC95\uC774 \uB2E4\uB974\uB2C8 \uC0AC\uC6A9 \uC804 \uC0C1\uC138 \uCFE0\uD3F0\uC815\uBCF4\uB97C \uD655\uC778\uBC14\uB78D\uB2C8\uB2E4." })] }), _jsx("button", { className: "rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]", onClick: openCouponRegisterModal, children: "\uD560\uC778\uCFE0\uD3F0 \uB4F1\uB85D" })] }), _jsxs("div", { className: "mt-5 rounded-sm bg-[#ffffff] p-5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm", children: [_jsx("span", { className: "font-semibold text-[#000000]", children: "\uC720\uD615" }), ["전체", "매표", "매점", "포인트", "포토카드", "기타"].map((type) => (_jsx("button", { className: `rounded border px-4 py-2 ${couponKindFilter === type ? "border-[#eb4d32] text-[#eb4d32]" : "border-gray-200 text-[#000000]"}`, onClick: () => setCouponKindFilter(type), children: type }, type))), _jsx("span", { className: "ml-4 font-semibold text-[#000000]", children: "\uAD6C\uBD84" }), _jsxs("select", { className: "rounded border border-gray-200 bg-[#ffffff] px-3 py-2", value: couponSourceFilter, onChange: (e) => setCouponSourceFilter(e.target.value), children: [_jsx("option", { children: "\uC804\uCCB4" }), _jsx("option", { children: "\uD560\uC778\uCFE0\uD3F0" }), _jsx("option", { children: "VIP\uCFE0\uD3F0" }), _jsx("option", { children: "\uCFE0\uD3F0\uD328\uC2A4" })] }), _jsxs("button", { className: "flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-4 py-2", children: [_jsx(Search, { className: "h-4 w-4" }), " \uC870\uD68C"] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-3 text-base", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: couponStatusFilter === "available", onChange: () => setCouponStatusFilter("available") }), "\uC0AC\uC6A9\uAC00\uB2A5"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: couponStatusFilter === "used", onChange: () => setCouponStatusFilter("used") }), "\uC0AC\uC6A9\uC644\uB8CC"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: couponStatusFilter === "expired", onChange: () => setCouponStatusFilter("expired") }), "\uAE30\uAC04\uB9CC\uB8CC"] })] }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: couponHiddenOnly, onChange: (e) => setCouponHiddenOnly(e.target.checked) }), "\uC228\uAE34\uCFE0\uD3F0"] })] })] }), _jsx("div", { className: "mt-7 flex items-center justify-between", children: _jsxs("p", { className: "text-lg font-semibold text-[#000000]", children: ["\uCD1D ", _jsx("span", { className: "text-[#eb4d32]", children: filteredCoupons.length }), "\uB9E4"] }) }), _jsxs("div", { className: "mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]", children: [_jsxs("div", { className: "grid grid-cols-5 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uAD6C\uBD84" }), _jsx("span", { children: "\uCFE0\uD3F0\uBA85" }), _jsx("span", { children: "\uC720\uD6A8\uAE30\uAC04" }), _jsx("span", { children: "\uC0AC\uC6A9\uC0C1\uD0DC" }), _jsx("span", { children: "\uC561\uC158" })] }), couponLoading ? (_jsx("div", { className: "py-10 text-center text-sm text-gray-500", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : filteredCoupons.length === 0 ? (_jsx("div", { className: "py-10 text-center text-sm text-gray-500", children: "\uC870\uD68C\uB41C \uCFE0\uD3F0 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (filteredCoupons.map((item) => (_jsxs("div", { className: "grid grid-cols-5 items-center border-t border-gray-200 px-4 py-4 text-center text-sm", children: [_jsx("span", { children: item.couponKind || "기타" }), _jsxs("div", { children: [_jsx("p", { children: item.couponName }), _jsx("p", { className: "text-gray-500", children: item.couponCode })] }), _jsx("span", { children: item.expiresAt ? formatDateTime(item.expiresAt) : "-" }), _jsx("span", { children: mapCouponStatusLabel(item.status) }), _jsx("button", { className: "mx-auto rounded border border-gray-200 px-3 py-1 text-sm", onClick: () => openCouponInfoModal(item), children: "\uCFE0\uD3F0\uC815\uBCF4" })] }, item.memberCouponId))))] }), _jsx("div", { className: "mt-6 flex items-center justify-center", children: _jsx("button", { className: "rounded bg-[#eb4d32] px-4 py-2 text-sm text-[#ffffff]", children: "1" }) }), _jsx("div", { className: "mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3", children: "\uC774\uC6A9\uC548\uB0B4" })] }))] }));
    const renderPoints = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uD3EC\uC778\uD2B8 \uC774\uC6A9\uB0B4\uC5ED" }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between border-b bg-[#ffffff] px-5 py-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uB098\uC758 \uD3EC\uC778\uD2B8 \uC815\uBCF4" }), _jsx("button", { className: "rounded border border-gray-300 bg-white px-4 py-2 text-sm", children: "\uD3EC\uC778\uD2B8 \uBE44\uBC00\uBC88\uD638 \uC124\uC815" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2", children: [_jsxs("div", { className: "bg-[#000000] p-6 text-white", children: [_jsx("h3", { className: "text-center text-3xl font-semibold", children: "\uC0AC\uC6A9\uAC00\uB2A5 \uD3EC\uC778\uD2B8" }), _jsxs("p", { className: "mt-3 text-center text-5xl font-bold text-[#eb4d32]", children: [(summary?.availablePoints ?? 0).toLocaleString(), " P"] }), _jsxs("div", { className: "mt-5 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700", children: [_jsx("span", { children: "\u00B7 \uC801\uB9BD\uC608\uC815" }), _jsx("span", { children: "0 P" })] }), _jsxs("div", { className: "flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700", children: [_jsx("span", { children: "\u00B7 \uB2F9\uC6D4\uC18C\uBA78\uC608\uC815" }), _jsx("span", { children: "0 P" })] })] })] }), _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-center text-xl font-semibold text-gray-700", children: "VIP \uC120\uC815 \uB204\uC801 \uD3EC\uC778\uD2B8 \uD604\uD669" }), _jsx("div", { className: "mt-4 rounded bg-[#ffffff] py-2 text-center text-base font-semibold", children: "\uD3EC\uC778\uD2B8" }), _jsxs("div", { className: "mt-4 space-y-2 text-sm text-gray-700", children: [_jsxs("p", { children: ["\u00B7 \uB9E4\uD45C ", _jsx("span", { className: "float-right", children: "0" })] }), _jsxs("p", { children: ["\u00B7 \uB9E4\uC810 ", _jsx("span", { className: "float-right", children: "0" })] }), _jsxs("p", { children: ["\u00B7 \uC774\uBCA4\uD2B8(VIP\uB4F1\uAE09\uB300\uC0C1) ", _jsx("span", { className: "float-right", children: "0" })] })] }), _jsxs("p", { className: "mt-8 text-right text-3xl font-semibold text-[#eb4d32]", children: [(summary?.availablePoints ?? 0).toLocaleString(), " P"] })] })] })] }), _jsx("h2", { className: "mt-9 text-3xl font-semibold text-[#eb4d32]", children: "\uC774\uC6A9\uB0B4\uC5ED \uC870\uD68C" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "\u00B7 \uD558\uB2E8 \uB0B4\uC5ED\uC740 \uC0C1\uC601\uC77C \uBC0F \uAD6C\uB9E4\uC77C \uAE30\uC900\uC774\uBA70, \uD574\uB2F9\uC77C \uC775\uC77C(+1)\uC5D0 \uC0AC\uC6A9 \uAC00\uB2A5 \uD3EC\uC778\uD2B8\uB85C \uC804\uD658\uB429\uB2C8\uB2E4." }), _jsx("p", { className: "text-sm text-gray-600", children: "\u00B7 \uC801\uB9BD \uC608\uC815 \uD3EC\uC778\uD2B8\uB294 \uC0AC\uC6A9 \uAC00\uB2A5\uD3EC\uC778\uD2B8\uC5D0 \uD3EC\uD568\uB418\uC9C0 \uC54A\uC73C\uBA70, \uD658\uBD88 \uB610\uB294 \uAC70\uB798 \uCDE8\uC18C\uAC00 \uB420 \uACBD\uC6B0 \uB0B4\uC5ED\uC5D0\uC11C \uC0AD\uC81C\uB429\uB2C8\uB2E4." }), _jsx("div", { className: "mt-5 rounded-sm bg-[#ffffff] p-5", children: _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm md:flex-nowrap", children: [_jsx("span", { className: "font-semibold", children: "\uC870\uD68C\uAE30\uAC04" }), _jsx("button", { className: `rounded border px-4 py-2 ${pointRange === 'week' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`, onClick: () => applyPointRange('week'), children: "1\uC8FC\uC77C" }), _jsx("button", { className: `rounded border px-4 py-2 ${pointRange === 'month1' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`, onClick: () => applyPointRange('month1'), children: "1\uAC1C\uC6D4" }), _jsx("button", { className: `rounded border px-4 py-2 ${pointRange === 'month3' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`, onClick: () => applyPointRange('month3'), children: "3\uAC1C\uC6D4" }), _jsx("button", { className: `rounded border px-4 py-2 ${pointRange === 'month6' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`, onClick: () => applyPointRange('month6'), children: "6\uAC1C\uC6D4" }), _jsx("input", { className: "w-[170px] rounded border border-gray-300 px-3 py-2", type: "date", value: pointFrom, onChange: (e) => setPointFrom(e.target.value) }), _jsx("span", { children: "~" }), _jsx("input", { className: "w-[170px] rounded border border-gray-300 px-3 py-2", type: "date", value: pointTo, onChange: (e) => setPointTo(e.target.value) }), _jsxs("button", { className: "flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 whitespace-nowrap", children: [_jsx(Search, { className: "h-4 w-4" }), " \uC870\uD68C"] })] }) }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uC77C\uC790" }), _jsx("span", { children: "\uAD6C\uBD84" }), _jsx("span", { children: "\uB0B4\uC6A9" }), _jsx("span", { children: "\uC9C0\uC810" }), _jsx("span", { children: "\uD3EC\uC778\uD2B8" })] }), _jsx("div", { className: "py-8 text-center text-gray-500", children: "\uC870\uD68C\uB41C \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" })] })] }));
    const renderCards = () => (_jsxs("section", { children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uBA64\uBC84\uC2ED \uCE74\uB4DC\uAD00\uB9AC" }), _jsx("p", { className: "mt-5 text-sm text-gray-600", children: "\u00B7 \uBA54\uAC00\uBC15\uC2A4 \uACC4\uC815\uC5D0 \uB4F1\uB85D\uB41C \uBA64\uBC84\uC2ED \uCE74\uB4DC\uB97C \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })] }), _jsx("button", { className: "rounded border border-[#eb4d32] px-5 py-3 text-sm text-[#eb4d32]", onClick: openCardRegisterModal, children: "\uBA64\uBC84\uC2ED \uCE74\uB4DC \uB4F1\uB85D" })] }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uAD6C\uBD84" }), _jsx("span", { children: "\uCE74\uB4DC\uBC88\uD638" }), _jsx("span", { children: "\uCE74\uB4DC\uBA85" }), _jsx("span", { children: "\uBC1C\uAE09\uCC98" }), _jsx("span", { children: "\uBC1C\uAE09\uC77C" })] }), membershipCardLoading ? (_jsx("div", { className: "border-t px-4 py-8 text-center text-sm text-gray-500", children: "\uBD88\uB7EC\uC624\uB294 \uC911..." })) : membershipCards.length === 0 ? (_jsx("div", { className: "border-t px-4 py-8 text-center text-sm text-gray-500", children: "\uB4F1\uB85D\uB41C \uBA64\uBC84\uC2ED \uCE74\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (membershipCards.map((card) => (_jsxs("div", { className: "grid grid-cols-5 border-t border-gray-200 px-4 py-4 text-center text-sm", children: [_jsx("span", { children: card.channelName }), _jsx("span", { children: card.cardNumber }), _jsx("span", { children: card.cardName }), _jsx("span", { children: card.issuerName }), _jsx("span", { children: formatDateDot(card.issuedDate) })] }, card.cardId))))] }), _jsxs("div", { className: "mt-8 rounded-sm border border-gray-200 bg-white", children: [_jsx("div", { className: "border-b bg-[#ffffff] px-4 py-3 font-semibold", children: "\uC774\uC6A9\uC548\uB0B4" }), _jsxs("div", { className: "p-4 text-base text-gray-600", children: [_jsx("p", { children: "\u00B7 \uC55E \uD639\uC740 \uB4B7\uBA74\uC758 \uCE74\uB4DC \uBC88\uD638\uC640 CVC\uCF54\uB4DC\uAC00 \uC788\uB294 \uCE74\uB4DC\uB85C\uB9CC \uC628\uB77C\uC778 \uB4F1\uB85D\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uB4F1\uB85D\uB41C \uBA64\uBC84\uC2ED \uCE74\uB4DC\uB294 \uC628\uB77C\uC778 \uBC0F \uADF9\uC7A5\uC5D0\uC11C \uC0AC\uC6A9\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uD55C \uBC88 \uC0AD\uC81C\uD558\uC2E0 \uCE74\uB4DC\uBC88\uD638\uB294 \uC7AC\uB4F1\uB85D\uC774 \uBD88\uAC00\uD569\uB2C8\uB2E4." })] })] })] }));
    const renderMovieStory = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uB098\uC758 \uBB34\uBE44\uC2A4\uD1A0\uB9AC" }), _jsx("div", { className: "mt-5 grid grid-cols-2 border border-gray-300 md:grid-cols-4", children: ["무비타임라인", "관람평", "본영화", "보고싶어"].map((tab, index) => (_jsx("button", { className: `px-5 py-3 text-sm ${index === 0 ? "bg-[#000000] text-white" : "bg-white text-gray-600"}`, children: tab }, tab))) }), _jsxs("div", { className: "mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between border-b px-4 py-3 text-lg", children: [_jsx("button", { className: "text-gray-400", children: "\u2039" }), _jsxs("div", { className: "flex gap-8", children: [_jsx("span", { children: "2025" }), _jsx("span", { className: "border-b-4 border-[#eb4d32] pb-1", children: "2026" })] }), _jsx("button", { className: "text-gray-400", children: "\u203A" })] }), _jsx("div", { className: "py-14 text-center text-gray-500", children: "\uB098\uC758 \uBB34\uBE44\uD0C0\uC784\uB77C\uC778\uC744 \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694." })] })] }));
    const renderEvents = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uB098\uC758 \uC751\uBAA8 \uB0B4\uC5ED" }), _jsx("p", { className: "mt-5 text-sm text-gray-600", children: "\u00B7 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB530\uB77C \uB2F9\uCCA8\uC790 \uBC1C\uD45C\uC77C\uB85C \uBD80\uD130 6\uAC1C\uC6D4\uAC04 \uB2F9\uCCA8\uC790 \uBC1C\uD45C\uB0B4\uC5ED\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsx("p", { className: "text-lg font-semibold", children: "\uC804\uCCB4 (0\uAC74)" }), _jsxs("div", { className: "flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500", children: [_jsx("span", { children: "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsx(Search, { className: "h-4 w-4" })] })] }), _jsxs("div", { className: "mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uBC88\uD638" }), _jsx("span", { children: "\uBD84\uB958" }), _jsx("span", { children: "\uC774\uBCA4\uD2B8\uBA85" }), _jsx("span", { children: "\uC751\uBAA8\uC77C" }), _jsx("span", { children: "\uB2F9\uCCA8\uC790\uBC1C\uD45C" })] }), _jsx("div", { className: "py-8 text-center text-gray-500", children: "\uC870\uD68C\uB41C \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })] }));
    const renderInquiries = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uB098\uC758 \uBB38\uC758\uB0B4\uC5ED" }), _jsx("div", { className: "mt-5 grid grid-cols-1 border border-gray-300 md:grid-cols-3", children: ["1:1 문의내역", "단체관람/대관 문의내역", "분실물 문의내역"].map((tab, index) => (_jsx("button", { className: `px-5 py-3 text-sm ${index === 0 ? "bg-[#000000] text-white" : "bg-white text-gray-600"}`, children: tab }, tab))) }), _jsx("p", { className: "mt-4 text-sm text-gray-600", children: "\u00B7 \uACE0\uAC1D\uC13C\uD130\uB97C \uD1B5\uD574 \uB0A8\uAE30\uC2E0 1:1 \uBB38\uC758\uB0B4\uC5ED\uC744 \uD655\uC778\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-3", children: [_jsx("p", { className: "text-lg font-semibold", children: "\uC804\uCCB4 (0\uAC74)" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]", children: "1:1 \uBB38\uC758\uD558\uAE30" }), _jsx("select", { className: "rounded border border-gray-300 px-3 py-2 text-sm", children: _jsx("option", { children: "\uC804\uCCB4" }) }), _jsxs("div", { className: "flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500", children: [_jsx("span", { children: "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsx(Search, { className: "h-4 w-4" })] })] })] }), _jsxs("div", { className: "mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white", children: [_jsxs("div", { className: "grid grid-cols-6 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold", children: [_jsx("span", { children: "\uBC88\uD638" }), _jsx("span", { children: "\uADF9\uC7A5" }), _jsx("span", { children: "\uC720\uD615" }), _jsx("span", { children: "\uC81C\uBAA9" }), _jsx("span", { children: "\uB2F5\uBCC0\uC0C1\uD0DC" }), _jsx("span", { children: "\uB4F1\uB85D\uC77C" })] }), _jsx("div", { className: "py-8 text-center text-gray-500", children: "\uBAA9\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })] }));
    const renderPayments = () => (_jsxs("section", { children: [_jsx("h1", { className: "text-4xl font-semibold text-[#000000]", children: "\uC911\uC559\uD398\uC774 \uACB0\uC81C\uC218\uB2E8 \uAD00\uB9AC" }), _jsx("div", { className: "mt-6 rounded-sm border border-gray-200 bg-white p-6 text-gray-600", children: "\uACB0\uC81C\uC218\uB2E8 \uAD00\uB9AC \uAE30\uB2A5\uC740 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4." })] }));
    const renderContent = () => {
        if (pageKey === "dashboard")
            return renderDashboard();
        if (pageKey === "reservations")
            return renderReservations();
        if (pageKey === "vouchers-movie" || pageKey === "vouchers-store")
            return renderVouchers();
        if (pageKey === "coupons")
            return renderCoupons();
        if (pageKey === "points")
            return renderPoints();
        if (pageKey === "cards")
            return renderCards();
        if (pageKey === "movie-story")
            return renderMovieStory();
        if (pageKey === "events")
            return renderEvents();
        if (pageKey === "inquiries")
            return renderInquiries();
        return renderPayments();
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#fdf4e3] text-[#000000]", children: [_jsx(Header, {}), _jsx("div", { className: "border-y border-[#000000] bg-[#ffffff]", children: _jsxs("div", { className: "mx-auto flex h-12 max-w-[1200px] items-center gap-2 px-4 text-sm text-gray-500", children: [_jsx(Home, { className: "h-4 w-4" }), crumbs.map((crumb, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChevronRight, { className: "h-4 w-4" }), _jsx("span", { className: index === crumbs.length - 1 ? "text-gray-700" : "", children: crumb })] }, `${crumb}-${index}`)))] }) }), _jsxs("div", { className: "mx-auto flex w-full max-w-[1200px] gap-8 px-4 py-10", children: [_jsxs("aside", { className: "w-[220px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white", children: [_jsx("button", { type: "button", className: "w-full bg-[#000000] px-6 py-8 text-center text-xl font-semibold text-white", onClick: () => moveMenu("/my-page"), children: "\uB098\uC758 \uBA54\uAC00\uBC15\uC2A4" }), MENU_CONFIG.map((item) => {
                                const active = item.key === "vouchers"
                                    ? pageKey === "vouchers-movie" || pageKey === "vouchers-store"
                                    : item.key === pageKey;
                                return (_jsxs("div", { className: "border-t border-gray-200", children: [_jsxs("button", { className: `flex w-full items-center justify-between px-4 py-3 text-left text-base ${active ? "font-semibold text-[#eb4d32]" : "text-gray-700"}`, onClick: () => moveMenu(item.path), children: [_jsx("span", { children: item.label }), active ? _jsx(ChevronRight, { className: "h-5 w-5" }) : null] }), item.children ? (_jsx("div", { className: "space-y-1 px-5 pb-3 text-sm text-gray-500", children: item.children.map((child) => (_jsxs("button", { className: `block w-full text-left ${location.pathname === child.path ? "font-semibold text-[#eb4d32]" : "text-gray-500"}`, onClick: () => moveMenu(child.path), children: ["\u00B7 ", child.label] }, child.label))) })) : null] }, item.key));
                            }), _jsx("div", { className: "border-t border-gray-200 bg-[#ffffff] px-4 py-3 text-base text-gray-700", children: "\uD68C\uC6D0\uC815\uBCF4" }), _jsxs("div", { className: "px-5 pb-4 pt-2 text-sm text-gray-500", children: [_jsx("p", { children: "\u00B7 \uAC1C\uC778\uC815\uBCF4 \uC218\uC815" }), _jsx("p", { children: "\u00B7 \uC120\uD638\uC815\uBCF4 \uC218\uC815" })] })] }), _jsx("main", { className: "min-w-0 flex-1", children: renderContent() })] }), _jsx(Footer, {}), showCancelModal ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: _jsxs("div", { className: "w-full max-w-md rounded-lg border border-[#000000] bg-[#ffffff] p-5", children: [_jsx("h3", { className: "text-lg font-semibold text-[#000000]", children: "\uD658\uBD88 \uC0AC\uC720 \uC785\uB825" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "\uCDE8\uC18C \uC0AC\uC720\uB97C \uC785\uB825\uD558\uBA74 \uD574\uB2F9 \uB0B4\uC6A9\uC73C\uB85C \uD658\uBD88 \uC694\uCCAD\uB429\uB2C8\uB2E4." }), _jsx("textarea", { className: "mt-4 h-28 w-full resize-none rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#eb4d32]", placeholder: "\uC608: \uC77C\uC815 \uBCC0\uACBD\uC73C\uB85C \uCDE8\uC18C\uD569\uB2C8\uB2E4.", value: cancelReason, onChange: (e) => setCancelReason(e.target.value) }), _jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx("button", { className: "rounded border border-gray-300 px-4 py-2 text-sm text-gray-700", disabled: isCancelling !== null, onClick: () => {
                                        setShowCancelModal(false);
                                        setCancelTargetId(null);
                                        setCancelReason("");
                                    }, children: "\uB2EB\uAE30" }), _jsx("button", { className: "rounded bg-[#eb4d32] px-4 py-2 text-sm font-semibold text-[#ffffff] disabled:opacity-60", disabled: cancelTargetId === null || isCancelling !== null, onClick: () => {
                                        if (cancelTargetId === null)
                                            return;
                                        handleCancel(cancelTargetId, cancelReason);
                                    }, children: isCancelling !== null ? "처리 중..." : "환불 확정" })] })] }) })) : null, showVoucherRegisterModal ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4", children: _jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#000000] px-5 py-4", children: [_jsx("h3", { className: "text-3xl font-semibold text-[#ffffff]", children: pageKey === "vouchers-movie" ? "영화관람권 등록" : "스토어 교환권 등록" }), _jsx("button", { className: "text-4xl leading-none text-[#ffffff]", onClick: closeVoucherRegisterModal, "aria-label": "\uB2EB\uAE30", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-6 bg-[#ffffff] p-6", children: [_jsx("p", { className: "text-base text-[#000000]", children: pageKey === "vouchers-movie"
                                        ? "보유하신 영화관람권 12자리 또는 16자리를 입력해주세요."
                                        : "보유하신 스토어 교환권 16자리를 입력해주세요." }), _jsxs("div", { className: "rounded-sm bg-[#fdf4e3] p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("label", { className: "min-w-[120px] text-right text-base font-semibold text-[#000000]", children: pageKey === "vouchers-movie" ? "관람권번호" : "스토어 교환권" }), _jsx("input", { value: voucherRegisterCode, onChange: (e) => {
                                                        const digits = e.target.value.replace(/\D/g, "");
                                                        setVoucherRegisterCode(digits);
                                                        if (voucherRegisterError)
                                                            setVoucherRegisterError("");
                                                    }, maxLength: 16, className: "h-12 flex-1 border border-[#000000] bg-[#ffffff] px-3 text-base text-[#000000] outline-none", placeholder: pageKey === "vouchers-movie" ? "12자리 또는 16자리 입력" : "숫자만 입력해 주세요" }), _jsx("button", { className: "h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff]", onClick: handleVoucherRegister, disabled: voucherRegistering, children: voucherRegistering ? "등록 중..." : "등록" })] }), voucherRegisterError ? (_jsx("p", { className: "mt-2 text-sm text-[#eb4d32]", children: voucherRegisterError })) : null] }), pageKey === "vouchers-movie" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-sm border border-[#000000] bg-[#fdf4e3] p-5", children: [_jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uAD00\uB78C\uAD8C \uB4B7\uBA74\uC758 \uBC88\uD638(12\uC790\uB9AC \uB610\uB294 16\uC790\uB9AC)\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uBC88\uD638\uC5D0 \uC2A4\uD06C\uB798\uCE58 \uC601\uC5ED\uC774 \uC788\uB294 \uACBD\uC6B0, \uC2A4\uD06C\uB798\uCE58 \uD6C4 \uC22B\uC790\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsx("div", { className: "mt-4 rounded-sm border border-[#000000] bg-[#ffffff] p-3 text-sm text-[#000000]", children: "\uC608\uC2DC \uBC88\uD638: 1234 5678 0000 0000" })] }), _jsxs("div", { className: "space-y-1 text-sm leading-7 text-[#000000]", children: [_jsx("p", { children: "\u00B7 \uBCF4\uC720\uD558\uC2E0 \uAD00\uB78C\uAD8C\uC758 \uBC88\uD638\uB97C \uC815\uD655\uD788 \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsx("p", { children: "\u00B7 \uC2A4\uD06C\uB798\uCE58 \uAC1C\uBD09 \uD6C4\uC5D0\uB294 \uD604\uC7A5(\uADF9\uC7A5) \uC0AC\uC6A9\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uB4F1\uB85D \uC644\uB8CC \uD6C4 \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC0C1\uD0DC\uB85C \uBC18\uC601\uB429\uB2C8\uB2E4." })] })] })) : (_jsxs("div", { className: "rounded-sm border border-[#000000] bg-[#fdf4e3] p-5", children: [_jsx("p", { className: "mb-3 text-2xl font-semibold text-[#000000]", children: "\uC774\uC6A9\uC548\uB0B4" }), _jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uBA54\uAC00\uBC15\uC2A4 \uC2A4\uD1A0\uC5B4\uC5D0\uC11C \uAD6C\uB9E4 \uB610\uB294 \uC120\uBB3C\uBC1B\uC740 \uC2A4\uD1A0\uC5B4\uAD50\uD658\uAD8C\uC744 \uB4F1\uB85D\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uC120\uBB3C\uBC1B\uC740 \uAD50\uD658\uAD8C\uC740 \uB4F1\uB85D \uD6C4 \uACB0\uC81C\uAC00 \uCDE8\uC18C\uB420 \uACBD\uC6B0 \uC790\uB3D9 \uD68C\uC218\uCC98\uB9AC \uB418\uC5B4 \uC0AC\uC6A9\uD558\uC2E4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." })] })), _jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]", onClick: closeVoucherRegisterModal, children: "\uB2EB\uAE30" }) })] })] }) })) : null, showCouponRegisterModal ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4", children: _jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#000000] px-5 py-4", children: [_jsx("h3", { className: "text-3xl font-semibold text-[#ffffff]", children: "\uD560\uC778\uCFE0\uD3F0 \uB4F1\uB85D" }), _jsx("button", { className: "text-4xl leading-none text-[#ffffff]", onClick: closeCouponRegisterModal, "aria-label": "\uB2EB\uAE30", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-6 p-6", children: [_jsx("p", { className: "text-base text-[#000000]", children: "\uBCF4\uC720\uD558\uC2E0 \uCFE0\uD3F0\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." }), _jsxs("div", { className: "rounded-sm bg-[#fdf4e3] p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("label", { className: "min-w-[140px] text-right text-base font-semibold text-[#000000]", children: "\uD560\uC778\uCFE0\uD3F0 \uBC88\uD638" }), _jsx("input", { value: couponRegisterCode, onChange: (e) => {
                                                        setCouponRegisterCode(e.target.value.toUpperCase());
                                                        if (couponRegisterError)
                                                            setCouponRegisterError("");
                                                    }, className: "h-12 flex-1 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none", placeholder: "\uC22B\uC790\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694" }), _jsx("button", { className: "h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff] disabled:opacity-60", onClick: handleCouponRegister, disabled: couponRegistering, children: couponRegistering ? "등록 중..." : "등록" })] }), couponRegisterError ? (_jsx("p", { className: "mt-2 text-sm text-[#eb4d32]", children: couponRegisterError })) : null] }), _jsxs("div", { className: "rounded-sm border border-gray-200 bg-[#ffffff] p-5", children: [_jsx("p", { className: "mb-3 text-2xl font-semibold text-[#000000]", children: "\uC774\uC6A9\uC548\uB0B4" }), _jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uBA54\uAC00\uBC15\uC2A4\uC5D0\uC11C \uBC1C\uD589\uB41C \uB9E4\uD45C, \uB9E4\uC810, \uD3EC\uC778\uD2B8 \uCFE0\uD3F0\uC744 \uB4F1\uB85D\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { className: "text-sm leading-7 text-[#000000]", children: "\u00B7 \uB4F1\uB85D\uB41C \uCFE0\uD3F0\uC740 \uC0AD\uC81C\uAC00 \uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4." }), _jsx("p", { className: "mt-3 text-sm leading-7 text-[#000000]", children: "\u00B7 [\uD3EC\uC778\uD2B8 \uC801\uB9BD \uCFE0\uD3F0] \uCFE0\uD3F0 \uB4F1\uB85D \uC2DC \uBC14\uB85C \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD3EC\uC778\uD2B8\uB85C \uC801\uB9BD\uB429\uB2C8\uB2E4." })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]", onClick: closeCouponRegisterModal, children: "\uB2EB\uAE30" }) })] })] }) })) : null, showCardRegisterModal ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4", children: _jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#000000] px-5 py-4", children: [_jsx("h3", { className: "text-3xl font-semibold text-[#ffffff]", children: "\uBA64\uBC84\uC2ED\uCE74\uB4DC \uB4F1\uB85D" }), _jsx("button", { className: "text-4xl leading-none text-[#ffffff]", onClick: closeCardRegisterModal, "aria-label": "\uB2EB\uAE30", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-5 p-6", children: [_jsxs("div", { className: "rounded-sm bg-[#fdf4e3] p-4", children: [_jsxs("div", { className: "grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-3", children: [_jsx("label", { className: "text-right text-2xl font-semibold text-[#000000]", children: "\uCE74\uB4DC\uBC88\uD638" }), _jsx("input", { className: "h-12 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]", value: cardNumberInput, onChange: (e) => {
                                                        setCardNumberInput(e.target.value.replace(/\D/g, ""));
                                                        if (cardRegisterError)
                                                            setCardRegisterError("");
                                                    }, maxLength: 19, placeholder: "\uC22B\uC790\uB9CC \uC785\uB825" }), _jsx("label", { className: "text-right text-2xl font-semibold text-[#000000]", children: "CVC \uBC88\uD638" }), _jsx("input", { className: "h-12 w-40 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]", value: cardCvcInput, onChange: (e) => {
                                                        setCardCvcInput(e.target.value.replace(/\D/g, ""));
                                                        if (cardRegisterError)
                                                            setCardRegisterError("");
                                                    }, maxLength: 4, placeholder: "3~4\uC790\uB9AC" })] }), cardRegisterError ? (_jsx("p", { className: "mt-3 text-sm text-[#eb4d32]", children: cardRegisterError })) : null] }), _jsxs("div", { className: "rounded-sm border border-gray-200 bg-[#ffffff] p-4 text-base text-[#000000]", children: [_jsx("p", { className: "font-semibold", children: "\uC720\uC758\uC0AC\uD56D" }), _jsx("p", { children: "\u00B7 \uC55E \uD639\uC740 \uB4B7\uBA74\uC758 \uCE74\uB4DC \uBC88\uD638\uC640 CVC\uCF54\uB4DC\uAC00 \uC788\uB294 \uCE74\uB4DC\uB85C\uB9CC \uC628\uB77C\uC778 \uB4F1\uB85D\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uD55C \uBC88 \uC0AD\uC81C\uD558\uC2E0 \uCE74\uB4DC\uBC88\uD638\uB294 \uB2E4\uC2DC \uB4F1\uB85D\uD558\uC2E4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." })] }), _jsxs("div", { className: "flex justify-center gap-3", children: [_jsx("button", { className: "rounded border border-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#eb4d32]", onClick: closeCardRegisterModal, disabled: cardRegistering, children: "\uCDE8\uC18C" }), _jsx("button", { className: "rounded bg-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#ffffff] disabled:opacity-60", onClick: handleMembershipCardRegister, disabled: cardRegistering, children: cardRegistering ? "등록 중" : "등록" })] })] })] }) })) : null, selectedCoupon ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4", children: _jsxs("div", { className: "max-h-[88vh] w-full max-w-3xl overflow-auto rounded-sm border border-[#000000] bg-[#ffffff]", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#000000] px-5 py-4", children: [_jsx("h3", { className: "text-3xl font-semibold text-[#ffffff]", children: "\uCFE0\uD3F0\uC815\uBCF4" }), _jsx("button", { className: "text-4xl leading-none text-[#ffffff]", onClick: closeCouponInfoModal, "aria-label": "\uB2EB\uAE30", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-5 p-6", children: [_jsx("h4", { className: "text-center text-5xl font-semibold text-[#000000]", children: selectedCoupon.couponName }), _jsx("div", { className: "rounded-sm bg-[#fdf4e3] py-5 text-center text-4xl font-semibold text-[#eb4d32]", children: formatCouponCodeForModal(selectedCoupon.couponCode) }), _jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-base text-[#000000]", children: [_jsx("p", { className: "font-semibold", children: "\u00B7 \uAD6C\uBD84" }), _jsx("p", { children: selectedCoupon.couponKind || "기타" }), _jsx("p", { className: "font-semibold", children: "\u00B7 \uC0AC\uC6A9\uC0C1\uD0DC" }), _jsx("p", { children: mapCouponStatusLabel(selectedCoupon.status) }), _jsx("p", { className: "font-semibold", children: "\u00B7 \uBC1C\uAE09\uC77C" }), _jsx("p", { children: selectedCoupon.issuedAt ? formatDateTime(selectedCoupon.issuedAt) : "-" }), _jsx("p", { className: "font-semibold", children: "\u00B7 \uC720\uD6A8\uAE30\uAC04" }), _jsx("p", { children: selectedCoupon.expiresAt ? formatDateTime(selectedCoupon.expiresAt) : "-" }), _jsx("p", { className: "font-semibold", children: "\u00B7 \uD560\uC778\uC815\uBCF4" }), _jsx("p", { children: selectedCoupon.discountType === "RATE"
                                                ? `${selectedCoupon.discountValue}% 할인`
                                                : `${selectedCoupon.discountValue.toLocaleString()}원 할인` })] }), _jsxs("div", { className: "rounded-sm border border-gray-200 p-4 text-sm leading-7 text-[#000000]", children: [_jsx("p", { className: "mb-2 font-semibold", children: "\uC720\uC758\uC0AC\uD56D" }), _jsx("p", { children: "\u00B7 \uCFE0\uD3F0\uC740 \uC911\uBCF5 \uC0AC\uC6A9\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: "\u00B7 \uACB0\uC81C \uC804 \uCFE0\uD3F0 \uC801\uC6A9 \uAC00\uB2A5 \uC5EC\uBD80\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694." }), _jsx("p", { children: "\u00B7 \uC720\uD6A8\uAE30\uAC04 \uB9CC\uB8CC \uC2DC \uC790\uB3D9\uC73C\uB85C \uC0AC\uC6A9 \uBD88\uAC00 \uCC98\uB9AC\uB429\uB2C8\uB2E4." })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]", onClick: closeCouponInfoModal, children: "\uB2EB\uAE30" }) })] })] }) })) : null] }));
}
