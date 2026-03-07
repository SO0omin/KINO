import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
    cancelReservation,
    redeemCoupon,
    registerMembershipCard,
    sendPointPasswordSms,
    type MyCouponItem,
    getMyCoupons,
    getMyVouchers,
    updatePointPassword,
    updateMemberProfile,
    updateMemberPassword,
    verifyPointPasswordSms,
    registerVoucher,
    removeMovieLike,
    getMyReviews,
    type MyReviewItem,
} from "../api/myPageApi";
import { ticketingApi } from "../api/ticketingApi";
import { useMyPageData } from "../hooks/useMyPageData";
import {
    filterCoupons,
    mapCouponStatusLabel,
    mapVoucherStatusLabel,
    toPurchaseRows,
    type CouponKindFilter,
    type CouponSourceFilter,
    type CouponStatusFilter,
    type UiVoucherStatus,
} from "../mappers/myPageMapper";
import {
    formatDateDot,
    formatDateSimple,
    formatDateTime,
    formatMoney,
    formatYmd,
    monthLabel,
    shiftDays,
    splitReservations,
    toMonthKey,
} from "../mappers/myPageFormatters";
import { PATH_TO_KEY, breadcrumbLabels } from "../types/mypage";
import { BreadcrumbBar } from "../components/mypage/BreadcrumbBar";
import { SidebarMenu } from "../components/mypage/SidebarMenu";
import { ReservationsSection } from "../components/mypage/sections/ReservationsSection";
import { CouponsSection } from "../components/mypage/sections/CouponsSection";
import { ProfilePreferencesSection } from "../components/mypage/sections/ProfilePreferencesSection";
import { PointsSection } from "../components/mypage/sections/PointsSection";
import { MovieStorySection } from "../components/mypage/sections/MovieStorySection";
import { VouchersSection } from "../components/mypage/sections/VouchersSection";
import { ProfileSection } from "../components/mypage/sections/ProfileSection";
import { MyPageModals } from "../components/mypage/modals/MyPageModals";

function EmptyLine({ message }: { message: string }) {
    return <div className="py-10 text-center text-base text-gray-300">{message}</div>;
}

type PreferenceSnapshot = {
    marketingPolicyAgreed: boolean;
    marketingEmailAgreed: boolean;
    marketingSmsAgreed: boolean;
    marketingPushAgreed: boolean;
    preferredTheaterId: string;
    socialNaverLinked: boolean;
    socialKakaoLinked: boolean;
};

export default function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { memberId: authMemberId, guestId: authGuestId, isGuest, isLoggedIn } = useAuth();
    const memberId = useMemo(() => {
        if (authMemberId && authMemberId > 0) {
            return authMemberId;
        }
        const queryValue = new URLSearchParams(location.search).get("memberId");
        const parsedFromQuery = queryValue ? Number(queryValue) : NaN;
        if (Number.isFinite(parsedFromQuery) && parsedFromQuery > 0) {
            return parsedFromQuery;
        }
        return 0;
    }, [location.search, authMemberId]);
    const guestId = useMemo(() => {
        if (authGuestId && authGuestId > 0) {
            return authGuestId;
        }
        const queryValue = new URLSearchParams(location.search).get("guestId");
        const parsedFromQuery = queryValue ? Number(queryValue) : NaN;
        if (Number.isFinite(parsedFromQuery) && parsedFromQuery > 0) {
            return parsedFromQuery;
        }
        return 0;
    }, [location.search, authGuestId]);

    const pageKey = PATH_TO_KEY[location.pathname] ?? "dashboard";
    const isGuestReservationOnly = isGuest && memberId <= 0 && guestId > 0;
    const verificationToken = useMemo(() => new URLSearchParams(location.search).get("verifyToken") ?? "", [location.search]);

    const [isCancelling, setIsCancelling] = useState<number | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [reservationTab, setReservationTab] = useState<"reservation" | "purchase">("reservation");
    const [historyType, setHistoryType] = useState<"current" | "past">("current");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [appliedHistoryType, setAppliedHistoryType] = useState<"current" | "past">("current");
    const [appliedMonth, setAppliedMonth] = useState<string>("");
    const today = useMemo(() => new Date(), []);
    const [purchaseSelectType, setPurchaseSelectType] = useState<"all" | "movie">("all");
    const [purchaseStatusType, setPurchaseStatusType] = useState<"all" | "purchase" | "cancel">("all");
    const [purchaseRange, setPurchaseRange] = useState<"week" | "month1" | "month3" | "month6">("month1");
    const [purchaseFrom, setPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
    const [purchaseTo, setPurchaseTo] = useState(formatYmd(today.toISOString()));
    const [appliedPurchaseSelectType, setAppliedPurchaseSelectType] = useState<"all" | "movie">("all");
    const [appliedPurchaseStatusType, setAppliedPurchaseStatusType] = useState<"all" | "purchase" | "cancel">("all");
    const [appliedPurchaseFrom, setAppliedPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
    const [appliedPurchaseTo, setAppliedPurchaseTo] = useState(formatYmd(today.toISOString()));
    const [pointRange, setPointRange] = useState<"week" | "month1" | "month3" | "month6">("week");
    const [pointFrom, setPointFrom] = useState(formatYmd(shiftDays(today, -7).toISOString()));
    const [pointTo, setPointTo] = useState(formatYmd(today.toISOString()));
    const [appliedPointFrom, setAppliedPointFrom] = useState(formatYmd(shiftDays(today, -7).toISOString()));
    const [appliedPointTo, setAppliedPointTo] = useState(formatYmd(today.toISOString()));
    const [showPointPhoneModal, setShowPointPhoneModal] = useState(false);
    const [pointPhoneNumber, setPointPhoneNumber] = useState("");
    const [pointAuthCodeInput, setPointAuthCodeInput] = useState("");
    const [pointAuthSending, setPointAuthSending] = useState(false);
    const [pointAuthVerifying, setPointAuthVerifying] = useState(false);
    const [pointPasswordInput, setPointPasswordInput] = useState("");
    const [pointPasswordConfirmInput, setPointPasswordConfirmInput] = useState("");
    const [voucherStatus, setVoucherStatus] = useState<UiVoucherStatus>("available");
    const [showVoucherRegisterModal, setShowVoucherRegisterModal] = useState(false);
    const [voucherRegisterCode, setVoucherRegisterCode] = useState("");
    const [voucherRegisterError, setVoucherRegisterError] = useState("");
    const [voucherRegistering, setVoucherRegistering] = useState(false);
    const [couponTab, setCouponTab] = useState<"megabox" | "partner">("megabox");
    const [couponKindFilter, setCouponKindFilter] = useState<CouponKindFilter>("전체");
    const [couponSourceFilter, setCouponSourceFilter] = useState<CouponSourceFilter>("전체");
    const [couponStatusFilter, setCouponStatusFilter] = useState<CouponStatusFilter>("available");
    const [couponHiddenOnly, setCouponHiddenOnly] = useState(false);
    const [showCouponRegisterModal, setShowCouponRegisterModal] = useState(false);
    const [couponRegisterCode, setCouponRegisterCode] = useState("");
    const [couponRegistering, setCouponRegistering] = useState(false);
    const [couponRegisterError, setCouponRegisterError] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState<MyCouponItem | null>(null);
    const [showCardRegisterModal, setShowCardRegisterModal] = useState(false);
    const [cardNumberInput, setCardNumberInput] = useState("");
    const [cardCvcInput, setCardCvcInput] = useState("");
    const [cardRegistering, setCardRegistering] = useState(false);
    const [cardRegisterError, setCardRegisterError] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState("");
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileTel, setProfileTel] = useState("");
    const [profileEmail, setProfileEmail] = useState("");
    const [profileBirthDate, setProfileBirthDate] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [marketingPolicyAgreed, setMarketingPolicyAgreed] = useState(false);
    const [marketingEmailAgreed, setMarketingEmailAgreed] = useState(false);
    const [marketingSmsAgreed, setMarketingSmsAgreed] = useState(false);
    const [marketingPushAgreed, setMarketingPushAgreed] = useState(false);
    const [preferredTheaterId, setPreferredTheaterId] = useState("");
    const [preferredTheaterName, setPreferredTheaterName] = useState("");
    const [availableMovieVoucherCount, setAvailableMovieVoucherCount] = useState(0);
    const [availableCouponCount, setAvailableCouponCount] = useState(0);
    const [savedPreferences, setSavedPreferences] = useState<PreferenceSnapshot | null>(null);
    const [socialNaverLinked, setSocialNaverLinked] = useState(false);
    const [socialKakaoLinked, setSocialKakaoLinked] = useState(false);
    const [movieStoryTab, setMovieStoryTab] = useState<"timeline" | "review" | "watched" | "wish">("timeline");
    const [selectedTimelineYear, setSelectedTimelineYear] = useState<number>(new Date().getFullYear());
    const [showWatchedModal, setShowWatchedModal] = useState(false);
    const [watchedTicketCodeInput, setWatchedTicketCodeInput] = useState("");
    const [watchedMovies, setWatchedMovies] = useState<Array<{ id: string; movieTitle: string; watchedAt: string }>>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewMovieTitleInput, setReviewMovieTitleInput] = useState("");
    const [reviewContentInput, setReviewContentInput] = useState("");
    const [reviews, setReviews] = useState<MyReviewItem[]>([]);
    const {
        loading,
        summary,
        reservations,
        memberProfile,
        profileLoading,
        wishMovies,
        wishLoading,
        voucherItems,
        voucherLoading,
        couponItems,
        couponLoading,
        membershipCards,
        membershipCardLoading,
        pointRows,
        pointLoading,
        load,
        loadMemberProfile,
        loadWishMovies,
        loadVouchers,
        loadCoupons,
        loadMembershipCards,
    } = useMyPageData({
        memberId,
        guestId,
        pageKey,
        voucherStatus,
        appliedPointFrom,
        appliedPointTo,
    });

    useEffect(() => {
        if (!memberProfile) return;
        setProfileName(memberProfile.name ?? "");
        setProfileTel(memberProfile.tel ?? "");
        setProfileEmail(memberProfile.email ?? "");
        setProfileBirthDate(memberProfile.birthDate ?? "");
        if (memberProfile.profileImage) {
            setProfileImageUrl(memberProfile.profileImage);
        }
    }, [memberProfile]);

    useEffect(() => {
        const savedWatched = localStorage.getItem(`movie-story-watched-${memberId}`);
        const savedPreferencesRaw = localStorage.getItem(`mypage-preferences-${memberId}`);
        setWatchedMovies(savedWatched ? JSON.parse(savedWatched) : []);


        if (savedPreferencesRaw) {
            try {
                const savedPreferences = JSON.parse(savedPreferencesRaw);
                setMarketingPolicyAgreed(Boolean(savedPreferences.marketingPolicyAgreed));
                setMarketingEmailAgreed(Boolean(savedPreferences.marketingEmailAgreed));
                setMarketingSmsAgreed(Boolean(savedPreferences.marketingSmsAgreed));
                setMarketingPushAgreed(Boolean(savedPreferences.marketingPushAgreed));
                const legacyPreferredCinemas = Array.isArray(savedPreferences.preferredCinemas)
                    ? savedPreferences.preferredCinemas
                    : [];
                const firstLegacyTheater = legacyPreferredCinemas.find((value: unknown) => typeof value === "string" && value.trim()) ?? "";
                setPreferredTheaterId(String(savedPreferences.preferredTheaterId ?? firstLegacyTheater ?? ""));
                setSocialNaverLinked(Boolean(savedPreferences.socialNaverLinked));
                setSocialKakaoLinked(Boolean(savedPreferences.socialKakaoLinked));
                setSavedPreferences({
                    marketingPolicyAgreed: Boolean(savedPreferences.marketingPolicyAgreed),
                    marketingEmailAgreed: Boolean(savedPreferences.marketingEmailAgreed),
                    marketingSmsAgreed: Boolean(savedPreferences.marketingSmsAgreed),
                    marketingPushAgreed: Boolean(savedPreferences.marketingPushAgreed),
                    preferredTheaterId: String(savedPreferences.preferredTheaterId ?? firstLegacyTheater ?? ""),
                    socialNaverLinked: Boolean(savedPreferences.socialNaverLinked),
                    socialKakaoLinked: Boolean(savedPreferences.socialKakaoLinked),
                });
            } catch {
                setSavedPreferences({
                    marketingPolicyAgreed: false,
                    marketingEmailAgreed: false,
                    marketingSmsAgreed: false,
                    marketingPushAgreed: false,
                    preferredTheaterId: "",
                    socialNaverLinked: false,
                    socialKakaoLinked: false,
                });
            }
        } else {
            setSavedPreferences({
                marketingPolicyAgreed: false,
                marketingEmailAgreed: false,
                marketingSmsAgreed: false,
                marketingPushAgreed: false,
                preferredTheaterId: "",
                socialNaverLinked: false,
                socialKakaoLinked: false,
            });
        }
    }, [memberId]);

    useEffect(() => {
        if (isLoggedIn && memberId) {
            getMyReviews(memberId)
                .then((data) => {
                    // 백엔드에서 가져온 진짜 리뷰 리스트를 상태에 저장!
                    setReviews(data);
                })
                .catch((err) => {
                    console.error("리뷰 목록 로드 실패", err);
                });
        }
    }, [memberId, isLoggedIn]);

    useEffect(() => {
        if (!preferredTheaterId) {
            setPreferredTheaterName("");
            return;
        }

        let mounted = true;
        ticketingApi
            .getTheaters()
            .then((response) => {
                if (!mounted) return;
                const target = (response.data ?? []).find(
                    (theater) => String(theater.id) === String(preferredTheaterId)
                );
                setPreferredTheaterName(target?.name ?? "");
            })
            .catch(() => {
                if (!mounted) return;
                setPreferredTheaterName("");
            });

        return () => {
            mounted = false;
        };
    }, [preferredTheaterId]);

    useEffect(() => {
        if (pageKey !== "dashboard") return;
        if (memberId <= 0) {
            setAvailableMovieVoucherCount(0);
            setAvailableCouponCount(0);
            return;
        }

        let mounted = true;
        Promise.all([
            getMyVouchers(memberId, "MOVIE", "AVAILABLE"),
            getMyCoupons(memberId),
        ])
            .then(([movieRows, couponRows]) => {
                if (!mounted) return;
                setAvailableMovieVoucherCount(movieRows.length);
                setAvailableCouponCount(
                    couponRows.filter((coupon) => String(coupon.status).toUpperCase() === "AVAILABLE").length
                );
            })
            .catch(() => {
                if (!mounted) return;
                setAvailableMovieVoucherCount(0);
                setAvailableCouponCount(0);
            });

        return () => {
            mounted = false;
        };
    }, [pageKey, memberId]);

    useEffect(() => {
        localStorage.setItem(`movie-story-watched-${memberId}`, JSON.stringify(watchedMovies));
    }, [memberId, watchedMovies]);

    const handleRemoveWishMovie = async (movieId: number) => {
        try {
            await removeMovieLike(movieId, memberId);
            await loadWishMovies();
        } catch (error: any) {
            alert(error?.message ?? "삭제에 실패했습니다.");
        }
    };

    const handleCancel = async (reservationId: number, reason: string) => {
        setIsCancelling(reservationId);
        try {
            await cancelReservation(
                {
                    memberId: memberId > 0 ? memberId : undefined,
                    guestId: guestId > 0 ? guestId : undefined,
                },
                reservationId,
                reason.trim() || "사용자 요청 취소"
            );
            await load();
            setShowCancelModal(false);
            setCancelTargetId(null);
            setCancelReason("");
            alert("환불(취소) 처리가 완료되었습니다.");
        } catch (error: any) {
            alert(error?.message ?? "환불 처리 중 오류가 발생했습니다.");
        } finally {
            setIsCancelling(null);
        }
    };

    const moveMenu = (path: string) => {
        navigate(`${path}${location.search || ""}`);
    };

    useEffect(() => {
        if (pageKey !== "reservations") return;
        const tab = new URLSearchParams(location.search).get("tab");
        setReservationTab(tab === "purchase" ? "purchase" : "reservation");
    }, [pageKey, location.search]);

    useEffect(() => {
        if (!isGuestReservationOnly) return;
        if (location.pathname !== "/mypage/reservations") {
            navigate(`/mypage/reservations?guestId=${guestId}`, { replace: true });
        }
    }, [guestId, isGuestReservationOnly, location.pathname, navigate]);

    const openCancelModal = (reservationId: number) => {
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
        const digits = voucherRegisterCode.replace(/\D/g, "");
        const valid = digits.length === 12 || digits.length === 16;

        if (!valid) {
            setVoucherRegisterError("영화관람권 번호는 12자리 또는 16자리 숫자만 가능합니다.");
            return;
        }

        setVoucherRegisterError("");
        setVoucherRegistering(true);
        registerVoucher({
            memberId,
            voucherType: "MOVIE",
            code: digits,
        })
            .then(async (response) => {
                await loadVouchers();
                alert(response.message || "등록이 완료되었습니다.");
                closeVoucherRegisterModal();
            })
            .catch((error: any) => {
                setVoucherRegisterError(error?.message ?? "등록 처리 중 오류가 발생했습니다.");
            })
            .finally(() => {
                setVoucherRegistering(false);
            });
    };

    const filteredCoupons = useMemo(() => {
        return filterCoupons(couponItems, {
            tab: couponTab,
            kind: couponKindFilter,
            source: couponSourceFilter,
            status: couponStatusFilter,
            hiddenOnly: couponHiddenOnly,
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

    const openCouponInfoModal = (coupon: MyCouponItem) => {
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
        } catch (error: any) {
            setCouponRegisterError(error?.message ?? "쿠폰 등록에 실패했습니다.");
        } finally {
            setCouponRegistering(false);
        }
    };

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
        } catch (error: any) {
            setCardRegisterError(error?.message ?? "멤버십 카드 등록에 실패했습니다.");
        } finally {
            setCardRegistering(false);
        }
    };

    const formatCouponCodeForModal = (code: string) => {
        const cleaned = (code ?? "").replace(/[^0-9A-Za-z]/g, "");
        if (cleaned.length < 8) return code || "-";
        return cleaned.match(/.{1,4}/g)?.join("-") ?? cleaned;
    };

    const { active: activeReservations, cancelled: cancelledReservations } = splitReservations(reservations);
    const crumbs = breadcrumbLabels(pageKey);
    const reservationWatchedMovies = useMemo(() => {
        return reservations
            .filter((item) => item.paymentStatus !== "CANCELLED")
            .map((item) => ({
                id: `r-${item.reservationId}`,
                movieTitle: item.movieTitle,
                watchedAt: item.startTime,
                theaterName: item.theaterName,
                screenName: item.screenName,
            }));
    }, [reservations]);

    const allWatchedMovies = useMemo(() => {
        const manualRows = watchedMovies.map((item) => ({
            id: item.id,
            movieTitle: item.movieTitle,
            watchedAt: item.watchedAt,
            theaterName: "직접 등록",
            screenName: "-",
        }));
        return [...reservationWatchedMovies, ...manualRows].sort(
            (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
        );
    }, [reservationWatchedMovies, watchedMovies]);

    const timelineYears = useMemo(() => {
        const years = Array.from(
            new Set(allWatchedMovies.map((item) => new Date(item.watchedAt).getFullYear()))
        ).filter((v) => !Number.isNaN(v));
        if (years.length === 0) {
            const nowYear = new Date().getFullYear();
            return [nowYear - 1, nowYear];
        }
        return years.sort((a, b) => a - b);
    }, [allWatchedMovies]);

    useEffect(() => {
        if (!timelineYears.includes(selectedTimelineYear)) {
            setSelectedTimelineYear(timelineYears[timelineYears.length - 1]);
        }
    }, [timelineYears, selectedTimelineYear]);

    const timelineRows = useMemo(
        () => allWatchedMovies.filter((item) => new Date(item.watchedAt).getFullYear() === selectedTimelineYear),
        [allWatchedMovies, selectedTimelineYear]
    );

    const watchedCount = allWatchedMovies.length;
    const reviewCount = reviews.length;
    const wishCount = wishMovies.length;
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
        if (!selectedMonth) setSelectedMonth(fallback);
        if (!appliedMonth) setAppliedMonth(fallback);
    }, [monthOptions, selectedMonth, appliedMonth]);

    const visibleReservations = useMemo(() => {
        const now = Date.now();
        return activeReservations.filter((item) => {
            const start = new Date(item.startTime).getTime();
            const historyMatched =
                appliedHistoryType === "current" ? start >= now : start < now;
            const monthMatched =
                appliedHistoryType === "current"
                    ? true
                    : (!appliedMonth || toMonthKey(item.startTime) === appliedMonth);
            return historyMatched && monthMatched;
        });
    }, [activeReservations, appliedHistoryType, appliedMonth]);

    const purchaseRows = useMemo(
        () =>
            toPurchaseRows(reservations, {
                selectType: appliedPurchaseSelectType,
                statusType: appliedPurchaseStatusType,
                from: appliedPurchaseFrom,
                to: appliedPurchaseTo,
            }),
        [reservations, appliedPurchaseSelectType, appliedPurchaseStatusType, appliedPurchaseFrom, appliedPurchaseTo]
    );

    const applyPurchaseRange = (range: "week" | "month1" | "month3" | "month6") => {
        setPurchaseRange(range);
        const to = new Date();
        const from = new Date(to);
        if (range === "week") from.setDate(to.getDate() - 7);
        if (range === "month1") from.setMonth(to.getMonth() - 1);
        if (range === "month3") from.setMonth(to.getMonth() - 3);
        if (range === "month6") from.setMonth(to.getMonth() - 6);
        setPurchaseFrom(formatYmd(from.toISOString()));
        setPurchaseTo(formatYmd(to.toISOString()));
    };

    const applyPointRange = (range: "week" | "month1" | "month3" | "month6") => {
        setPointRange(range);
        const to = new Date();
        const from = new Date(to);
        if (range === "week") from.setDate(to.getDate() - 7);
        if (range === "month1") from.setMonth(to.getMonth() - 1);
        if (range === "month3") from.setMonth(to.getMonth() - 3);
        if (range === "month6") from.setMonth(to.getMonth() - 6);
        setPointFrom(formatYmd(from.toISOString()));
        setPointTo(formatYmd(to.toISOString()));
    };

    const openPointPhoneModal = () => {
        setPointPhoneNumber("");
        setPointAuthCodeInput("");
        setShowPointPhoneModal(true);
    };

    const closePointPhoneModal = () => {
        setShowPointPhoneModal(false);
        setPointPhoneNumber("");
        setPointAuthCodeInput("");
    };

    const sendPointPhoneAuthCode = async () => {
        const phoneDigits = pointPhoneNumber.replace(/\D/g, "");
        if (!/^01\d{8,9}$/.test(phoneDigits)) {
            alert("휴대폰 번호를 올바르게 입력해 주세요. (예: 01012345678)");
            return;
        }
        setPointAuthSending(true);
        try {
            const response = await sendPointPasswordSms(memberId, phoneDigits);
            alert(response?.message ?? "인증번호가 발송되었습니다.");
        } catch (error: any) {
            alert(error?.message ?? "인증번호 발송에 실패했습니다.");
        } finally {
            setPointAuthSending(false);
        }
    };

    const verifyPointPhoneAuthCode = async () => {
        const phoneDigits = pointPhoneNumber.replace(/\D/g, "");
        const codeDigits = pointAuthCodeInput.replace(/\D/g, "");
        if (!/^01\d{8,9}$/.test(phoneDigits)) {
            alert("휴대폰 번호를 올바르게 입력해 주세요.");
            return;
        }
        if (codeDigits.length !== 6) {
            alert("인증번호 6자리를 입력해 주세요.");
            return;
        }
        setPointAuthVerifying(true);
        try {
            const response = await verifyPointPasswordSms(memberId, phoneDigits, codeDigits);
            closePointPhoneModal();
            navigate(`/mypage/point-password?memberId=${memberId}&verifyToken=${encodeURIComponent(response.verificationToken)}`);
        } catch (error: any) {
            alert(error?.message ?? "휴대폰 인증에 실패했습니다.");
        } finally {
            setPointAuthVerifying(false);
        }
    };

    const submitPointPassword = async () => {
        const newPassword = pointPasswordInput.replace(/\D/g, "");
        const confirmPassword = pointPasswordConfirmInput.replace(/\D/g, "");
        if (!verificationToken) {
            alert("휴대폰 인증 정보가 없습니다. 다시 인증해 주세요.");
            navigate(`/mypage/points?memberId=${memberId}`);
            return;
        }
        try {
            const response = await updatePointPassword(memberId, verificationToken, newPassword, confirmPassword);
            alert(response?.message ?? "포인트 비밀번호가 설정되었습니다.");
            navigate(`/mypage/points?memberId=${memberId}`);
        } catch (error: any) {
            alert(error?.message ?? "포인트 비밀번호 설정에 실패했습니다.");
        }
    };

    const handleSaveProfile = async () => {
        if (!profileName.trim()) {
            alert("이름을 입력해 주세요.");
            return;
        }
        setProfileSaving(true);
        try {
            const response = await updateMemberProfile({
                memberId,
                name: profileName.trim(),
                tel: profileTel.trim(),
                email: profileEmail.trim(),
                birthDate: profileBirthDate || undefined,
                profileImage: profileImageUrl,
            });
            alert(response?.message ?? "개인정보가 수정되었습니다.");
            await loadMemberProfile();
        } catch (error: any) {
            alert(error?.message ?? "개인정보 수정에 실패했습니다.");
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePhoneChange = async () => {
        const digits = profileTel.replace(/\D/g, "");
        if (!/^01\d{8,9}$/.test(digits)) {
            alert("휴대폰 번호 형식을 확인해 주세요. (예: 01012345678)");
            return;
        }
        setProfileTel(digits);
        await handleSaveProfile();
    };

    const handlePasswordChange = async () => {
        if (!currentPasswordInput.trim()) {
            alert("현재 비밀번호를 입력해 주세요.");
            return;
        }
        if (newPasswordInput.length < 8) {
            alert("새 비밀번호는 8자리 이상 입력해 주세요.");
            return;
        }
        if (newPasswordInput !== newPasswordConfirmInput) {
            alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }
        setPasswordChanging(true);
        try {
            const response = await updateMemberPassword({
                memberId,
                currentPassword: currentPasswordInput,
                newPassword: newPasswordInput,
                confirmPassword: newPasswordConfirmInput,
            });
            alert(response?.message ?? "비밀번호가 변경되었습니다.");
            setShowPasswordChangeModal(false);
            setCurrentPasswordInput("");
            setNewPasswordInput("");
            setNewPasswordConfirmInput("");
        } catch (error: any) {
            alert(error?.message ?? "비밀번호 변경에 실패했습니다.");
        } finally {
            setPasswordChanging(false);
        }
    };

    const toggleSocialLink = (provider: "naver" | "kakao") => {
        if (provider === "naver") {
            const next = !socialNaverLinked;
            setSocialNaverLinked(next);
            alert(next ? "네이버 계정이 연동되었습니다." : "네이버 계정 연동이 해제되었습니다.");
            return;
        }
        const next = !socialKakaoLinked;
        setSocialKakaoLinked(next);
        alert(next ? "카카오 계정이 연동되었습니다." : "카카오 계정 연동이 해제되었습니다.");
    };

    const renderDashboard = () => {
        const cardClass = "rounded-sm border border-gray-200 bg-white p-5";
        const tierSteps = ["WELCOME", "FRIENDS", "VIP", "VVIP", "MVIP"] as const;
        const currentTier = (summary?.pointTier ?? "WELCOME").toUpperCase();
        const currentTierIndex = Math.max(0, tierSteps.indexOf(currentTier as (typeof tierSteps)[number]));
        const nextTier = summary?.nextPointTier;
        const pointsToNextTier = summary?.pointsToNextTier ?? 0;

        return (
            <>
                <section className="overflow-hidden rounded-md border border-[#000000] bg-[#000000] text-[#ffffff]">
                    <div className="bg-[#000000] px-8 py-9">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-[#eb4d32] text-2xl font-bold text-[#ffffff]">
                                    {/* 백엔드에서 내려주는 이름(profileImage)으로 정확히 매칭! */}
                                    {summary?.profileImage ? (
                                        <img 
                                            src={summary.profileImage} 
                                            alt="profile" 
                                            className="h-full w-full object-cover" 
                                        />
                                    ) : (
                                        // 프로필 이미지가 없을 때 이름의 첫 글자를 보여주는 센스
                                        <span>{summary?.memberName ? summary.memberName.charAt(0) : "W"}</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold leading-none">안녕하세요!</h1>
                                    <p className="mt-2 text-3xl font-semibold leading-none">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
                                    <p className="mt-3 text-base font-semibold">{summary?.memberName ?? "회원"}님</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">현재등급 <span className="font-semibold text-[#eb4d32]">{currentTier}</span></p>
                                {nextTier ? (
                                    <div className="mt-3 inline-block rounded bg-[#eb4d32] px-4 py-1 text-sm font-semibold text-[#ffffff]">
                                        다음 {nextTier} 등급까지 {pointsToNextTier.toLocaleString()} P 남았어요!
                                    </div>
                                ) : (
                                    <div className="mt-3 inline-block rounded bg-[#eb4d32] px-4 py-1 text-sm font-semibold text-[#ffffff]">
                                        최고 등급을 달성했어요!
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-end gap-5 text-sm">
                                    {tierSteps.map((label, index) => (
                                        <div key={label} className="flex items-center gap-2 text-white/85">
                                            <span className={`h-3 w-3 rounded-full ${index === currentTierIndex ? "bg-[#eb4d32]" : "bg-[#ffffff]"}`} />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-0 border-t border-[#000000] bg-[#ffffff] text-[#000000] lg:grid-cols-3">
                        <button
                            type="button"
                            className="p-5 text-left transition-colors hover:bg-gray-50"
                            onClick={() => moveMenu("/mypage/points")}
                        >
                            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                                <span>포인트 이용내역</span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm">적립예정 <span className="float-right font-semibold">{(summary?.pendingPoints ?? 0).toLocaleString()} P</span></p>
                            <p className="mt-2 text-sm">당월소멸예정 <span className="float-right font-semibold">{(summary?.expiringPointsThisMonth ?? 0).toLocaleString()} P</span></p>
                        </button>
                        <button
                            type="button"
                            className="p-5 text-left transition-colors hover:bg-gray-50"
                            onClick={() => moveMenu("/mypage/profile/preferences")}
                        >
                            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                                <span>선호하는 극장</span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                            {preferredTheaterName ? (
                                <p className="text-[#eb4d32]">{preferredTheaterName}</p>
                            ) : (
                                <>
                                    <p className="text-[#eb4d32]">선호극장</p>
                                    <p>을 설정하세요.</p>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="p-5 text-left transition-colors hover:bg-gray-50"
                            onClick={() => moveMenu("/mypage/vouchers/movie")}
                        >
                            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                                <span>관람권/쿠폰</span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm">영화관람권 <span className="float-right font-semibold">{availableMovieVoucherCount} 매</span></p>
                            <p className="mt-2 text-sm">할인/제휴쿠폰 <span className="float-right font-semibold">{availableCouponCount} 매</span></p>
                        </button>
                    </div>
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4">
                    <div className={cardClass}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-[#eb4d32]">나의 무비스토리</h3>
                            <button
                                className="rounded border border-gray-300 px-4 py-1 text-sm"
                                onClick={() => moveMenu("/mypage/movie-story")}
                            >
                                본 영화 등록
                            </button>
                        </div>
                        <div className="grid grid-cols-3 text-center">
                            <div>
                                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.paidReservationCount ?? 0}</p>
                                <p className="text-sm">본 영화</p>
                            </div>
                            <div>
                                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.reviewCount ?? 0}</p>
                                <p className="text-sm">관람평</p>
                            </div>
                            <div>
                                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.likedMovieCount ?? 0}</p>
                                <p className="text-sm">보고싶어</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-7 rounded-sm border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
                        <h3 className="text-2xl font-semibold text-[#eb4d32]">나의 예매내역</h3>
                        <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/mypage/reservations")}>더보기 <ChevronRight className="h-5 w-5" /></button>
                    </div>
                    {activeReservations.length === 0 ? <EmptyLine message="예매 내역이 없습니다." /> : (
                        <div className="divide-y">
                            {activeReservations.slice(0, 2).map((item) => (
                                <div key={item.reservationId} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-lg font-semibold">{item.movieTitle}</p>
                                        <p className="text-sm text-gray-600">{item.theaterName} · {formatDateTime(item.startTime)} · 좌석 {item.seatNames.join(", ") || "-"}</p>
                                    </div>
                                    <p className="font-semibold">{formatMoney(item.finalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-7 rounded-sm border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
                        <h3 className="text-2xl font-semibold text-[#eb4d32]">나의 구매내역</h3>
                        <button
                            className="flex items-center gap-1 text-base text-gray-600"
                            onClick={() => {
                                const params = new URLSearchParams(location.search);
                                params.set("tab", "purchase");
                                navigate(`/mypage/reservations?${params.toString()}`);
                            }}
                        >
                            더보기 <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <EmptyLine message="구매내역이 없습니다." />
                </section>

            </>
        );
    };

    const renderReservations = () => (
        <ReservationsSection
            guestView={isGuestReservationOnly}
            reservationTab={reservationTab}
            setReservationTab={setReservationTab}
            historyType={historyType}
            setHistoryType={setHistoryType}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            monthOptions={monthOptions}
            monthLabel={monthLabel}
            setAppliedHistoryType={setAppliedHistoryType}
            setAppliedMonth={setAppliedMonth}
            loading={loading}
            visibleReservations={visibleReservations}
            formatDateTime={formatDateTime}
            formatMoney={formatMoney}
            isCancelling={isCancelling}
            openCancelModal={openCancelModal}
            purchaseSelectType={purchaseSelectType}
            setPurchaseSelectType={setPurchaseSelectType}
            purchaseStatusType={purchaseStatusType}
            setPurchaseStatusType={setPurchaseStatusType}
            purchaseRange={purchaseRange}
            applyPurchaseRange={applyPurchaseRange}
            purchaseFrom={purchaseFrom}
            setPurchaseFrom={setPurchaseFrom}
            purchaseTo={purchaseTo}
            setPurchaseTo={setPurchaseTo}
            setAppliedPurchaseSelectType={setAppliedPurchaseSelectType}
            setAppliedPurchaseStatusType={setAppliedPurchaseStatusType}
            setAppliedPurchaseFrom={setAppliedPurchaseFrom}
            setAppliedPurchaseTo={setAppliedPurchaseTo}
            purchaseRows={purchaseRows}
            cancelledReservations={cancelledReservations}
        />
    );

    const renderVouchers = () => {
        return (
            <VouchersSection
                openVoucherRegisterModal={openVoucherRegisterModal}
                voucherItems={voucherItems}
                voucherStatus={voucherStatus}
                setVoucherStatus={setVoucherStatus}
                voucherLoading={voucherLoading}
                formatDateTime={formatDateTime}
                mapVoucherStatusLabel={mapVoucherStatusLabel}
            />
        );
    };

    const renderCoupons = () => (
        <CouponsSection
            couponTab={couponTab}
            setCouponTab={setCouponTab}
            couponLoading={couponLoading}
            couponItems={couponItems}
            formatDateTime={formatDateTime}
            openCouponRegisterModal={openCouponRegisterModal}
            couponKindFilter={couponKindFilter}
            setCouponKindFilter={setCouponKindFilter}
            couponSourceFilter={couponSourceFilter}
            setCouponSourceFilter={setCouponSourceFilter}
            couponStatusFilter={couponStatusFilter}
            setCouponStatusFilter={setCouponStatusFilter}
            couponHiddenOnly={couponHiddenOnly}
            setCouponHiddenOnly={setCouponHiddenOnly}
            filteredCoupons={filteredCoupons}
            mapCouponStatusLabel={mapCouponStatusLabel}
            openCouponInfoModal={openCouponInfoModal}
        />
    );

    const renderPoints = () => (
        <PointsSection
            summary={summary}
            openPointPhoneModal={openPointPhoneModal}
            pointRange={pointRange}
            applyPointRange={applyPointRange}
            pointFrom={pointFrom}
            setPointFrom={setPointFrom}
            pointTo={pointTo}
            setPointTo={setPointTo}
            setAppliedPointFrom={setAppliedPointFrom}
            setAppliedPointTo={setAppliedPointTo}
            pointLoading={pointLoading}
            pointRows={pointRows}
            formatDateTime={formatDateTime}
        />
    );

    const renderPointPassword = () => (
        <section>
            <h1 className="text-4xl font-semibold text-[#000000]">포인트 비밀번호 설정</h1>
            <p className="mt-5 text-xl text-[#000000]">· 키노 극장에서 멤버십 포인트를 사용하시려면 비밀번호가 필요합니다.</p>
            <p className="text-xl text-[#000000]">· 사용하실 비밀번호 4자리를 입력해주세요.</p>

            <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
                <div className="grid grid-cols-[220px_1fr] border-b border-gray-200">
                    <div className="bg-[#fdf4e3] px-5 py-4 text-xl font-semibold text-[#000000]">새 비밀번호</div>
                    <div className="px-5 py-3">
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={pointPasswordInput}
                            onChange={(e) => setPointPasswordInput(e.target.value.replace(/\D/g, ""))}
                            className="h-12 w-[220px] border border-gray-200 px-3 text-lg outline-none focus:border-[#eb4d32]"
                            placeholder="숫자 4자리"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-[220px_1fr]">
                    <div className="bg-[#fdf4e3] px-5 py-4 text-xl font-semibold text-[#000000]">새 비밀번호 재입력</div>
                    <div className="px-5 py-3">
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={pointPasswordConfirmInput}
                            onChange={(e) => setPointPasswordConfirmInput(e.target.value.replace(/\D/g, ""))}
                            className="h-12 w-[220px] border border-gray-200 px-3 text-lg outline-none focus:border-[#eb4d32]"
                            placeholder="숫자 4자리"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-sm border border-gray-200 bg-[#ffffff] p-5 text-base text-[#000000]">
                <p className="mb-2 text-2xl font-semibold">이용안내</p>
                <p>· 비밀번호는 숫자 4자리로 설정 가능하며, 연속된 숫자는 등록하실 수 없습니다.</p>
                <p>· 비밀번호 찾기는 불가하며, 해당 페이지를 통해 재설정 후 이용하실 수 있습니다.</p>
                <p>· 키노 극장 매표소 및 매점에서 포인트 사용 시 비밀번호가 일치하지 않을 경우 사용이 제한되오니 주의하여 등록바랍니다.</p>
            </div>

            <div className="mt-8 flex justify-center gap-3">
                <button
                    className="rounded border border-[#eb4d32] px-10 py-3 text-lg font-semibold text-[#eb4d32]"
                    onClick={() => navigate(`/mypage/points?memberId=${memberId}`)}
                >
                    취소
                </button>
                <button
                    className="rounded bg-[#eb4d32] px-10 py-3 text-lg font-semibold text-[#ffffff]"
                    onClick={submitPointPassword}
                >
                    수정
                </button>
            </div>
        </section>
    );

    const renderCards = () => (
        <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-[#000000]">멤버십 카드관리</h1>
                    <p className="mt-5 text-sm text-gray-600">· 키노 계정에 등록된 멤버십 카드를 관리할 수 있습니다.</p>
                </div>
                <button
                    className="rounded border border-[#eb4d32] px-5 py-3 text-sm text-[#eb4d32]"
                    onClick={openCardRegisterModal}
                >
                    멤버십 카드 등록
                </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
                <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
                    <span>구분</span>
                    <span>카드번호</span>
                    <span>카드명</span>
                    <span>발급처</span>
                    <span>발급일</span>
                </div>
                {membershipCardLoading ? (
                    <div className="border-t px-4 py-8 text-center text-sm text-gray-500">불러오는 중...</div>
                ) : membershipCards.length === 0 ? (
                    <div className="border-t px-4 py-8 text-center text-sm text-gray-500">등록된 멤버십 카드가 없습니다.</div>
                ) : (
                    membershipCards.map((card) => (
                        <div key={card.cardId} className="grid grid-cols-5 border-t border-gray-200 px-4 py-4 text-center text-sm">
                            <span>{card.channelName}</span>
                            <span>{card.cardNumber}</span>
                            <span>{card.cardName}</span>
                            <span>{card.issuerName}</span>
                            <span>{formatDateDot(card.issuedDate)}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 rounded-sm border border-gray-200 bg-white">
                <div className="border-b bg-[#ffffff] px-4 py-3 font-semibold">이용안내</div>
                <div className="p-4 text-base text-gray-600">
                    <p>· 앞 혹은 뒷면의 카드 번호와 CVC코드가 있는 카드로만 온라인 등록이 가능합니다.</p>
                    <p>· 등록된 멤버십 카드는 온라인 및 극장에서 사용하실 수 있습니다.</p>
                    <p>· 한 번 삭제하신 카드번호는 재등록이 불가합니다.</p>
                </div>
            </div>
        </section>
    );

    const renderProfile = () => (
        <ProfileSection
            profileImageUrl={profileImageUrl}
            setProfileImageUrl={setProfileImageUrl}
            memberProfile={memberProfile}
            profileName={profileName}
            setProfileName={setProfileName}
            profileLoading={profileLoading}
            profileSaving={profileSaving}
            handleSaveProfile={handleSaveProfile}
            profileBirthDate={profileBirthDate}
            formatDateSimple={formatDateSimple}
            profileTel={profileTel}
            setProfileTel={setProfileTel}
            handlePhoneChange={handlePhoneChange}
            profileEmail={profileEmail}
            setProfileEmail={setProfileEmail}
            setShowPasswordChangeModal={setShowPasswordChangeModal}
            openPointPhoneModal={openPointPhoneModal}
            socialNaverLinked={socialNaverLinked}
            socialKakaoLinked={socialKakaoLinked}
            toggleSocialLink={toggleSocialLink}
            loadMemberProfile={() => loadMemberProfile().then(() => {})}
        />
    );

    const renderProfilePreferences = () => (
        <ProfilePreferencesSection
            marketingPolicyAgreed={marketingPolicyAgreed}
            setMarketingPolicyAgreed={setMarketingPolicyAgreed}
            marketingEmailAgreed={marketingEmailAgreed}
            setMarketingEmailAgreed={setMarketingEmailAgreed}
            marketingSmsAgreed={marketingSmsAgreed}
            setMarketingSmsAgreed={setMarketingSmsAgreed}
            marketingPushAgreed={marketingPushAgreed}
            setMarketingPushAgreed={setMarketingPushAgreed}
            preferredTheaterId={preferredTheaterId}
            setPreferredTheaterId={setPreferredTheaterId}
            onReset={() => {
                const snapshot = savedPreferences ?? {
                    marketingPolicyAgreed: false,
                    marketingEmailAgreed: false,
                    marketingSmsAgreed: false,
                    marketingPushAgreed: false,
                    preferredTheaterId: "",
                    socialNaverLinked: false,
                    socialKakaoLinked: false,
                };
                setMarketingPolicyAgreed(snapshot.marketingPolicyAgreed);
                setMarketingEmailAgreed(snapshot.marketingEmailAgreed);
                setMarketingSmsAgreed(snapshot.marketingSmsAgreed);
                setMarketingPushAgreed(snapshot.marketingPushAgreed);
                setPreferredTheaterId(snapshot.preferredTheaterId);
                setSocialNaverLinked(snapshot.socialNaverLinked);
                setSocialKakaoLinked(snapshot.socialKakaoLinked);
            }}
            onSubmit={() => {
                const nextSnapshot: PreferenceSnapshot = {
                    marketingPolicyAgreed,
                    marketingEmailAgreed,
                    marketingSmsAgreed,
                    marketingPushAgreed,
                    preferredTheaterId,
                    socialNaverLinked,
                    socialKakaoLinked,
                };
                setSavedPreferences(nextSnapshot);
                localStorage.setItem(
                    `mypage-preferences-${memberId}`,
                    JSON.stringify({
                        ...nextSnapshot,
                        // Legacy compatibility for previously array-based format.
                        preferredCinemas: nextSnapshot.preferredTheaterId ? [nextSnapshot.preferredTheaterId] : [],
                    })
                );
                alert("선호정보가 저장되었습니다.");
            }}
        />
    );

    const renderMovieStory = () => (
        <MovieStorySection
            movieStoryTab={movieStoryTab}
            setMovieStoryTab={setMovieStoryTab}
            timelineYears={timelineYears}
            selectedTimelineYear={selectedTimelineYear}
            setSelectedTimelineYear={setSelectedTimelineYear}
            timelineRows={timelineRows}
            formatDateSimple={formatDateSimple}
            reviewCount={reviewCount}
            setShowReviewModal={setShowReviewModal}
            reviews={reviews}
            watchedCount={watchedCount}
            setShowWatchedModal={setShowWatchedModal}
            allWatchedMovies={allWatchedMovies}
            wishCount={wishCount}
            wishLoading={wishLoading}
            wishMovies={wishMovies}
            onRemoveWishMovie={handleRemoveWishMovie}
        />
    );

    const renderContent = () => {
        if (isGuestReservationOnly) return renderReservations();
        if (pageKey === "dashboard") return renderDashboard();
        if (pageKey === "reservations") return renderReservations();
        if (pageKey === "vouchers-movie") return renderVouchers();
        if (pageKey === "coupons") return renderCoupons();
        if (pageKey === "points") return renderPoints();
        if (pageKey === "point-password") return renderPointPassword();
        if (pageKey === "cards") return renderCards();
        if (pageKey === "profile") return renderProfile();
        if (pageKey === "profile-preferences") return renderProfilePreferences();
        if (pageKey === "movie-story") return renderMovieStory();
        return renderDashboard();
    };

    return (
        <div className="min-h-screen bg-[#fdf4e3] text-[#000000]">
            <BreadcrumbBar crumbs={isGuestReservationOnly ? ["나의 키노", "예매/구매내역", "예매내역"] : crumbs} />

            <div className="mx-auto flex w-full max-w-[1200px] gap-8 px-4 py-10">
                {isGuestReservationOnly ? null : (
                    <SidebarMenu currentPath={location.pathname} pageKey={pageKey} onMoveMenu={moveMenu} />
                )}

                <main className={`min-w-0 ${isGuestReservationOnly ? "w-full" : "flex-1"}`}>
                    {renderContent()}
                </main>
            </div>

            <MyPageModals
                showPasswordChangeModal={showPasswordChangeModal}
                currentPasswordInput={currentPasswordInput}
                setCurrentPasswordInput={setCurrentPasswordInput}
                newPasswordInput={newPasswordInput}
                setNewPasswordInput={setNewPasswordInput}
                newPasswordConfirmInput={newPasswordConfirmInput}
                setNewPasswordConfirmInput={setNewPasswordConfirmInput}
                passwordChanging={passwordChanging}
                setShowPasswordChangeModal={setShowPasswordChangeModal}
                handlePasswordChange={handlePasswordChange}
                showCancelModal={showCancelModal}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                isCancelling={isCancelling}
                setCancelTargetId={setCancelTargetId}
                setShowCancelModal={setShowCancelModal}
                cancelTargetId={cancelTargetId}
                handleCancel={handleCancel}
                showPointPhoneModal={showPointPhoneModal}
                closePointPhoneModal={closePointPhoneModal}
                pointPhoneNumber={pointPhoneNumber}
                setPointPhoneNumber={setPointPhoneNumber}
                pointAuthSending={pointAuthSending}
                sendPointPhoneAuthCode={sendPointPhoneAuthCode}
                pointAuthCodeInput={pointAuthCodeInput}
                setPointAuthCodeInput={setPointAuthCodeInput}
                pointAuthVerifying={pointAuthVerifying}
                verifyPointPhoneAuthCode={verifyPointPhoneAuthCode}
                showVoucherRegisterModal={showVoucherRegisterModal}
                pageKey={pageKey}
                closeVoucherRegisterModal={closeVoucherRegisterModal}
                voucherRegisterCode={voucherRegisterCode}
                setVoucherRegisterCode={setVoucherRegisterCode}
                voucherRegisterError={voucherRegisterError}
                setVoucherRegisterError={setVoucherRegisterError}
                voucherRegistering={voucherRegistering}
                handleVoucherRegister={handleVoucherRegister}
                showCouponRegisterModal={showCouponRegisterModal}
                couponRegisterCode={couponRegisterCode}
                setCouponRegisterCode={setCouponRegisterCode}
                couponRegisterError={couponRegisterError}
                setCouponRegisterError={setCouponRegisterError}
                couponRegistering={couponRegistering}
                handleCouponRegister={handleCouponRegister}
                closeCouponRegisterModal={closeCouponRegisterModal}
                showWatchedModal={showWatchedModal}
                setShowWatchedModal={setShowWatchedModal}
                watchedTicketCodeInput={watchedTicketCodeInput}
                setWatchedTicketCodeInput={setWatchedTicketCodeInput}
                reservations={reservations}
                setWatchedMovies={setWatchedMovies}
                showReviewModal={showReviewModal}
                setShowReviewModal={setShowReviewModal}
                reviewMovieTitleInput={reviewMovieTitleInput}
                setReviewMovieTitleInput={setReviewMovieTitleInput}
                reviewContentInput={reviewContentInput}
                setReviewContentInput={setReviewContentInput}
                setReviews={setReviews}
                showCardRegisterModal={showCardRegisterModal}
                closeCardRegisterModal={closeCardRegisterModal}
                cardNumberInput={cardNumberInput}
                setCardNumberInput={setCardNumberInput}
                cardRegisterError={cardRegisterError}
                setCardRegisterError={setCardRegisterError}
                cardCvcInput={cardCvcInput}
                setCardCvcInput={setCardCvcInput}
                cardRegistering={cardRegistering}
                handleMembershipCardRegister={handleMembershipCardRegister}
                selectedCoupon={selectedCoupon}
                closeCouponInfoModal={closeCouponInfoModal}
                formatCouponCodeForModal={formatCouponCodeForModal}
                mapCouponStatusLabel={mapCouponStatusLabel}
                formatDateTime={formatDateTime}
            />
        </div>
    );
}
