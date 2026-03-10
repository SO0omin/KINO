import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';
import { KAKAO_AUTH_URL, NAVER_AUTH_URL, GOOGLE_AUTH_URL } from "../constants/socialAuth";
import {
    cancelReservation,
    downloadSelectedCoupons,
    getDownloadableCoupons,
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
    linkSocialAccountApi, 
    unlinkSocialAccountApi
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
    hasPointPassword: boolean;
    socialNaverLinked: boolean;
    socialKakaoLinked: boolean;
    socialGoogleLinked: boolean;
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
    const [appliedCouponKindFilter, setAppliedCouponKindFilter] = useState<CouponKindFilter>("전체");
    const [appliedCouponSourceFilter, setAppliedCouponSourceFilter] = useState<CouponSourceFilter>("전체");
    const [appliedCouponStatusFilter, setAppliedCouponStatusFilter] = useState<CouponStatusFilter>("available");
    const [appliedCouponHiddenOnly, setAppliedCouponHiddenOnly] = useState(false);
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
    const [hasPointPassword,] = useState(false);
    const [socialNaverLinked, setSocialNaverLinked] = useState(false);
    const [socialKakaoLinked, setSocialKakaoLinked] = useState(false);
    const [socialGoogleLinked, setSocialGoogleLinked] = useState(false);
    const [movieStoryTab, setMovieStoryTab] = useState<"timeline" | "review" | "watched" | "wish">("timeline");
    const [selectedTimelineYear, setSelectedTimelineYear] = useState<number>(new Date().getFullYear());
    const [showWatchedModal, setShowWatchedModal] = useState(false);
    const [watchedTicketCodeInput, setWatchedTicketCodeInput] = useState("");
    const [watchedMovies, setWatchedMovies] = useState<Array<{ id: string; movieTitle: string; watchedAt: string }>>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewMovieTitleInput, setReviewMovieTitleInput] = useState("");
    const [reviewContentInput, setReviewContentInput] = useState("");
    const [reviews, setReviews] = useState<MyReviewItem[]>([]);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [reviewReservationNumberInput, setReviewReservationNumberInput] = useState("");
    const [reviewMovieId, setReviewMovieId] = useState<number | null>(null);
    const [scoreDirection, setScoreDirection] = useState(10);
    const [scoreStory, setScoreStory] = useState(10);
    const [scoreVisual, setScoreVisual] = useState(10);
    const [scoreActor, setScoreActor] = useState(10);
    const [scoreOst, setScoreOst] = useState(10);
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
        setSocialKakaoLinked(memberProfile.socialKakaoLinked);
        setSocialGoogleLinked(memberProfile.socialGoogleLinked);
        setSocialNaverLinked(memberProfile.socialNaverLinked);
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
                setSocialGoogleLinked(Boolean(savedPreferences.socialGoogleLinked));
                setSavedPreferences({
                    marketingPolicyAgreed: Boolean(savedPreferences.marketingPolicyAgreed),
                    marketingEmailAgreed: Boolean(savedPreferences.marketingEmailAgreed),
                    marketingSmsAgreed: Boolean(savedPreferences.marketingSmsAgreed),
                    marketingPushAgreed: Boolean(savedPreferences.marketingPushAgreed),
                    preferredTheaterId: String(savedPreferences.preferredTheaterId ?? firstLegacyTheater ?? ""),
                    hasPointPassword:  Boolean(savedPreferences.hasPointPassword),
                    socialNaverLinked: Boolean(savedPreferences.socialNaverLinked),
                    socialKakaoLinked: Boolean(savedPreferences.socialKakaoLinked),
                    socialGoogleLinked: Boolean(savedPreferences.socialGoogleLinked),
                });
            } catch {
                setSavedPreferences({
                    marketingPolicyAgreed: false,
                    marketingEmailAgreed: false,
                    marketingSmsAgreed: false,
                    marketingPushAgreed: false,
                    preferredTheaterId: "",
                    hasPointPassword: false,
                    socialNaverLinked: false,
                    socialKakaoLinked: false,
                    socialGoogleLinked: false
                });
            }
        } else {
            setSavedPreferences({
                marketingPolicyAgreed: false,
                marketingEmailAgreed: false,
                marketingSmsAgreed: false,
                marketingPushAgreed: false,
                preferredTheaterId: "",
                hasPointPassword: false,
                socialNaverLinked: false,
                socialKakaoLinked: false,
                socialGoogleLinked: false
            });
        }
    }, [memberId]);

    useEffect(() => {
        if (isLoggedIn && memberId) {
            getMyReviews(memberId)
                .then((data) => {
                    // 백엔드에서 가져온 진짜 리뷰 리스트를 상태에 저장
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

    useEffect(() => {
        // 1단계 검증창이 닫혔고('AND'), 2단계 리뷰창도 닫혀있을 때만 리셋
        // 이렇게 하면 1단계 -> 2단계로 넘어가는 "사이"에는 데이터가 유지
        if (!showVerifyModal && !showReviewModal) {
            setReviewReservationNumberInput("");
            setReviewMovieId(null);
            setReviewMovieTitleInput("");
            
            // 점수 초기화
            setScoreDirection(10); 
            setScoreStory(10); 
            setScoreVisual(10); 
            setScoreActor(10); 
            setScoreOst(10);
        }
    }, [showVerifyModal, showReviewModal]);

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

    const handleVerifyAndOpenReview = async () => {
        const resNum = reviewReservationNumberInput.trim();
        
        if (!resNum) {
            alert("예매 번호를 입력해주세요.");
            return;
        }

        try {
            // 1단계: 예매 번호 자체가 유효한지 확인 (기존 API)
            const response = await axios.get(`http://localhost:8080/api/reservations/verify/${resNum}`);
            
            // 2단계: 해당 번호로 이미 리뷰를 썼는지 확인 (새로 만든 중복 체크 API)
            // 이 API는 이미 리뷰가 있으면 400 에러와 함께 "이미 작성된 리뷰입니다"를 던집니다.
            await axios.get(`http://localhost:8080/api/reviews/check-availability/${resNum}`);
            
           //  데이터 세팅을 먼저 하고
            setReviewMovieId(response.data.movieId);
            setReviewMovieTitleInput(response.data.movieTitle);
            
            // 그 다음에 모달을 전환
            setShowVerifyModal(false);
            setShowReviewModal(true);

        } catch (error: any) {
            // 에러 처리 (이미 썼거나, 번호가 틀렸을 때)
            const errorMessage = error.response?.data?.error || "유효하지 않은 예매 번호입니다. 번호를 확인해주세요.";
            
            alert(errorMessage);      // 1. 에러 알림창 띄우기
            setShowVerifyModal(false); // 2. 확인 누르면 검증 모달 닫기
        }
    };

    const handleResNumberChange = (value: string) => {
        // 영문, 숫자, 하이픈만 허용하도록 필터링
        const filteredValue = value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase();
        setReviewReservationNumberInput(filteredValue);
    };

    const handleReviewSubmit = async () => {
        if (!reviewContentInput.trim()) {
            alert("관람평 내용을 입력해 주세요.");
            return;
        }

        try {
            const reviewData = {
                memberId: memberId,
                movieId: reviewMovieId,
                reservationNumber: reviewReservationNumberInput,
                content: reviewContentInput.trim(),
                // 하드코딩된 10 대신 State 값을 실어 보냄
                scoreDirection,
                scoreStory,
                scoreVisual,
                scoreActor,
                scoreOst
            };

            await axios.post('/api/reviews', reviewData);

            alert("관람평이 성공적으로 등록되었습니다!");
            
            setShowReviewModal(false);
            // 초기화
            setReviewContentInput("");
            setScoreDirection(10); setScoreStory(10); setScoreVisual(10); setScoreActor(10); setScoreOst(10);
            
            const updatedReviews = await getMyReviews(memberId);
            setReviews(updatedReviews);
        } catch (error: any) {
            alert(error.response?.data?.message || "리뷰 등록 실패");
        }
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
            kind: appliedCouponKindFilter,
            source: appliedCouponSourceFilter,
            status: appliedCouponStatusFilter,
            hiddenOnly: appliedCouponHiddenOnly,
        });
    }, [couponItems, couponTab, appliedCouponKindFilter, appliedCouponStatusFilter, appliedCouponSourceFilter, appliedCouponHiddenOnly]);

    const applyCouponFilters = () => {
        setAppliedCouponKindFilter(couponKindFilter);
        setAppliedCouponSourceFilter(couponSourceFilter);
        setAppliedCouponStatusFilter(couponStatusFilter);
        setAppliedCouponHiddenOnly(couponHiddenOnly);
    };

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
            await Promise.all([loadCoupons(), load()]);
            closeCouponRegisterModal();
            alert("할인쿠폰 등록이 완료되었습니다.");
        } catch (error: any) {
            setCouponRegisterError(error?.message ?? "쿠폰 등록에 실패했습니다.");
        } finally {
            setCouponRegistering(false);
        }
    };

    const fetchDownloadableCouponsForCurrentTab = async () => {
        if (memberId <= 0) {
            throw new Error("회원 로그인 후 이용해 주세요.");
        }
        const sourceType = couponTab === "partner" ? "PARTNER" : "KINO";
        const result = await getDownloadableCoupons(memberId, sourceType);
        return result.coupons ?? [];
    };

    const downloadSelectedCouponsForCurrentTab = async (couponIds: number[]) => {
        if (memberId <= 0) {
            throw new Error("회원 로그인 후 이용해 주세요.");
        }
        const sourceType = couponTab === "partner" ? "PARTNER" : "KINO";
        const result = await downloadSelectedCoupons(memberId, sourceType, couponIds);
        await Promise.all([loadCoupons(), load()]);
        return result;
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
        const normalized = (code ?? "").trim();
        return normalized || "-";
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

    const recentPaidPurchases = useMemo(
        () =>
            reservations
                .filter((item) => String(item.paymentStatus).toUpperCase() === "PAID")
                .sort(
                    (a, b) =>
                        new Date(b.paidAt ?? b.startTime).getTime() - new Date(a.paidAt ?? a.startTime).getTime()
                )
                .slice(0, 2),
        [reservations]
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
                pointPasswordUsing: false,
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

    const toggleSocialLink = async (provider: "naver" | "kakao" | "google") => {
        const isLinked = provider === "naver" ? socialNaverLinked : 
                        provider === "kakao" ? socialKakaoLinked : socialGoogleLinked;
        
        const providerKoName = provider === "naver" ? "네이버" : provider === "kakao" ? "카카오" : "구글";

        if (isLinked) {
            if (!window.confirm(`${providerKoName} 계정 연동을 해제하시겠습니까?`)) return;
            try {
                await unlinkSocialAccountApi(provider.toUpperCase());
                alert(`${providerKoName} 연동이 해제되었습니다.`);
                await loadMemberProfile(); // 🔄 서버에서 최신 정보 다시 가져오기
            } catch (error: any) {
                alert(error.response?.data?.message || "해제 중 오류 발생");
            }
        } else {
            try {
                let authCode = "";
                const authUrl = provider === "naver" ? NAVER_AUTH_URL : 
                            provider === "kakao" ? KAKAO_AUTH_URL : GOOGLE_AUTH_URL;
                
                authCode = await openSocialPopup(provider.toUpperCase(), authUrl);
                if (!authCode) return;

                await linkSocialAccountApi(provider.toUpperCase(), authCode);
                alert(`성공적으로 연동되었습니다!`);
                await loadMemberProfile(); // 🔄 서버에서 최신 정보 다시 가져오기
            } catch (error: any) {
                alert(error.response?.data?.message || "연동 중 오류 발생");
            }
        }
    };

    const openSocialPopup = (provider: string, authUrl: string): Promise<string> => {

        
        return new Promise((resolve, reject) => {
            // 1. 로그인 버튼 눌렀을 때 이동하던 그 URL을 팝업으로 띄웁니다.
            const popup = window.open(authUrl, 'socialLoginPopup', 'width=500,height=600');

            // 2. 콜백 페이지가 postMessage로 쏴줄 데이터를 듣고 있는 리스너
            const messageListener = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                if (event.data?.type === 'SOCIAL_LINK' && event.data?.provider?.toUpperCase() === provider.toUpperCase()) {
                    
                    resolve(event.data.code); 
                    window.removeEventListener('message', messageListener);
                }
            };

            window.addEventListener('message', messageListener);

            // 3. 사용자가 로그인 안 하고 팝업을 그냥 X 눌러서 닫았을 때 무한 대기 방지
            const timer = setInterval(() => {
            if (popup?.closed) {
                clearInterval(timer);
                window.removeEventListener('message', messageListener);
                reject(new Error("팝업이 닫혔습니다."));
            }
            }, 1000);
        });
    };

    console.log(visibleReservations);

    const handlePayAgain = (reservationId: number) => {
        navigate(`/payment?reservationId=${reservationId}`);
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
                {/* ===================== [1] 프로필 및 등급 헤더 ===================== */}
                <section className="relative overflow-hidden bg-[#1A1A1A] text-white rounded-sm shadow-xl mb-6">
                    {/* 시네마틱 배경 효과 */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,#B91C1C_0%,transparent_50%)]"></div>
                    </div>

                    <div className="px-8 py-10 relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-center gap-8">
                            {/* 프로필 이미지 */}
                            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-lg">
                                {summary?.profileImage && summary.profileImage !== "default" ? (
                                    <img 
                                        src={summary.profileImage} 
                                        alt="profile" 
                                        className="h-full w-full object-cover transition-all duration-500" 
                                    />
                                ) : (
                                    <div className="font-display text-4xl text-white/40">K</div>
                                )}
                            </div>
                            {/* 유저 정보 */}
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-bold tracking-[0.3em] text-[#B91C1C] uppercase">Welcome Back</p>
                                <h1 className="font-display text-4xl tracking-tight uppercase text-white mb-2">
                                    {summary?.memberName ?? "회원"}
                                </h1>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display text-3xl text-white">{(summary?.availablePoints ?? 0).toLocaleString()}</span>
                                    <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Points</span>
                                </div>
                            </div>
                        </div>

                        {/* 등급 정보 */}
                        <div className="flex flex-col lg:items-end gap-3">
                            <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Current Tier</p>
                            <div className="flex items-baseline gap-3">
                                <span className="font-display text-3xl text-[#B91C1C] uppercase tracking-widest">{currentTier}</span>
                            </div>
                            
                            {nextTier ? (
                                <div className="inline-block border border-[#B91C1C]/30 bg-[#B91C1C]/10 px-4 py-1.5 rounded-sm text-[10px] font-bold tracking-widest text-white uppercase mt-1">
                                    <span className="text-[#B91C1C]">{(pointsToNextTier).toLocaleString()}P</span> to {nextTier}
                                </div>
                            ) : (
                                <div className="inline-block border border-white/20 bg-white/5 px-4 py-1.5 rounded-sm text-[10px] font-bold tracking-widest text-white uppercase mt-1">
                                    최고 등급 달성
                                </div>
                            )}
                            
                            {/* 등급 진행도 표시 (세련된 선 형태) */}
                            <div className="mt-4 flex items-center gap-3">
                                {tierSteps.map((label, index) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${index === currentTierIndex ? "text-[#B91C1C]" : "text-white/20"}`}>
                                            {label}
                                        </span>
                                        {index < tierSteps.length - 1 && (
                                            <div className={`w-6 h-px ${index < currentTierIndex ? "bg-[#B91C1C]" : "bg-white/10"}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===================== [2] 퀵 메뉴 3종 (포인트, 극장, 쿠폰) ===================== */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-10">
                    <button
                        type="button"
                        className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 text-left transition-all hover:shadow-lg hover:border-black/10 group"
                        onClick={() => moveMenu("/mypage/points")}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-[#B91C1C] transition-colors">Point History</span>
                            <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-[#B91C1C] transition-colors" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-black/5 pb-2">
                                <span className="text-xs font-bold text-[#1A1A1A]">적립 예정</span>
                                <span className="font-display text-lg">{(summary?.pendingPoints ?? 0).toLocaleString()} <span className="text-[10px] text-black/40">P</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#1A1A1A]">당월 소멸예정</span>
                                <span className="font-display text-lg text-[#B91C1C]">{(summary?.expiringPointsThisMonth ?? 0).toLocaleString()} <span className="text-[10px] text-black/40">P</span></span>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 text-left transition-all hover:shadow-lg hover:border-black/10 group flex flex-col"
                        onClick={() => moveMenu("/mypage/profile/preferences")}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-[#B91C1C] transition-colors">Preferred Theater</span>
                            <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-[#B91C1C] transition-colors" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-2">
                            {preferredTheaterName ? (
                                <span className="font-display text-2xl tracking-tight text-[#1A1A1A]">{preferredTheaterName}</span>
                            ) : (
                                <span className="text-xs font-bold text-black/40 uppercase tracking-widest">선호극장을<br/>설정해주세요</span>
                            )}
                        </div>
                    </button>

                    <button
                        type="button"
                        className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 text-left transition-all hover:shadow-lg hover:border-black/10 group"
                        onClick={() => moveMenu("/mypage/vouchers/movie")}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-[#B91C1C] transition-colors">Vouchers & Coupons</span>
                            <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-[#B91C1C] transition-colors" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-black/5 pb-2">
                                <span className="text-xs font-bold text-[#1A1A1A]">영화 관람권</span>
                                <span className="font-display text-lg">{availableMovieVoucherCount} <span className="text-[10px] text-black/40">매</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#1A1A1A]">할인/제휴 쿠폰</span>
                                <span className="font-display text-lg">{availableCouponCount} <span className="text-[10px] text-black/40">매</span></span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* ===================== [3] 무비 스토리 ===================== */}
                <section className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl p-8 mb-10">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>Movie Story</span>
                        </div>
                        <button
                            className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 border border-black/10 rounded-sm hover:bg-[#1A1A1A] hover:text-white transition-colors"
                            onClick={() => moveMenu("/mypage/movie-story")}
                        >
                            본 영화 등록
                        </button>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black/5">
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <p className="font-display text-5xl text-[#1A1A1A]">{summary?.paidReservationCount ?? 0}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Watched</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <p className="font-display text-5xl text-[#1A1A1A]">{summary?.reviewCount ?? 0}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Reviews</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <p className="font-display text-5xl text-[#1A1A1A]">{summary?.likedMovieCount ?? 0}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Want to Watch</p>
                        </div>
                    </div>
                </section>

                {/* ===================== [4] 예매 내역 ===================== */}
                <section className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl p-8 mb-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>My Reservations</span>
                        </div>
                        <button 
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors" 
                            onClick={() => moveMenu("/mypage/reservations")}
                        >
                            View All <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    
                    {activeReservations.length === 0 ? (
                        <div className="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">
                            <EmptyLine message="예매 내역이 없습니다." />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {activeReservations.slice(0, 2).map((item) => (
                                <div key={item.reservationId} className="flex flex-col lg:flex-row lg:items-center justify-between py-6 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors px-4 group">
                                    <div className="flex flex-col gap-2">
                                        <p className="font-display text-2xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">{item.movieTitle}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                                            {item.theaterName} <span className="mx-2">|</span> {formatDateTime(item.startTime)} <span className="mx-2">|</span> 좌석 {item.seatNames.join(", ") || "-"}
                                        </p>
                                    </div>
                                    <p className="font-display text-xl text-[#1A1A1A] mt-4 lg:mt-0">{formatMoney(item.finalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ===================== [5] 구매 내역 ===================== */}
                <section className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl p-8 mb-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>My Purchases</span>
                        </div>
                        <button
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors"
                            onClick={() => {
                                const params = new URLSearchParams(location.search);
                                params.set("tab", "purchase");
                                navigate(`/mypage/reservations?${params.toString()}`);
                            }}
                        >
                            View All <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {recentPaidPurchases.length === 0 ? (
                        <div className="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">
                            <EmptyLine message="구매 내역이 없습니다." />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {recentPaidPurchases.map((item) => (
                                <div key={item.reservationId} className="flex flex-col lg:flex-row lg:items-center justify-between py-6 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors px-4 group">
                                    <div className="flex flex-col gap-2">
                                        <p className="font-display text-2xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">{item.movieTitle}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                                            {item.theaterName} <span className="mx-2">|</span> 결제일시 {formatDateTime(item.paidAt ?? item.startTime)}
                                        </p>
                                    </div>
                                    <p className="font-display text-xl text-[#1A1A1A] mt-4 lg:mt-0">{formatMoney(item.finalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </>
        );
    }; //#1

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
            onClickPay={handlePayAgain}
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
            fetchDownloadableCouponsForCurrentTab={fetchDownloadableCouponsForCurrentTab}
            downloadSelectedCouponsForCurrentTab={downloadSelectedCouponsForCurrentTab}
            applyCouponFilters={applyCouponFilters}
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
        <section className="max-w-3xl mx-auto py-8">
            {/* 헤더 영역 */}
            <div className="mb-10">
                <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
                    <div className="w-8 h-px bg-[#B91C1C]"></div>
                    <span>Point Password</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-[#1A1A1A] mb-4">
                    포인트 비밀번호 설정
                </h1>
                <p className="text-xs font-bold tracking-widest text-black/40 leading-relaxed">
                    키노 극장에서 멤버십 포인트를 사용하시려면 비밀번호가 필요합니다.<br/>
                    결제 시 사용할 안전한 비밀번호 4자리를 입력해주세요.
                </p>
            </div>

            {/* 입력 폼 영역 */}
            <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 md:p-10 shadow-xl mb-10">
                <div className="flex flex-col gap-8">
                    {/* 새 비밀번호 */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-3">
                            New Password
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={pointPasswordInput}
                            onChange={(e) => setPointPasswordInput(e.target.value.replace(/\D/g, ""))}
                            className="w-full sm:w-64 border border-black/10 rounded-sm p-4 text-2xl font-mono tracking-[0.5em] text-[#1A1A1A] focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20 placeholder:tracking-normal placeholder:text-sm placeholder:font-sans bg-white"
                            placeholder="숫자 4자리"
                        />
                    </div>
                    
                    {/* 새 비밀번호 확인 */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-3">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            inputMode="numeric"
                            value={pointPasswordConfirmInput}
                            onChange={(e) => setPointPasswordConfirmInput(e.target.value.replace(/\D/g, ""))}
                            className="w-full sm:w-64 border border-black/10 rounded-sm p-4 text-2xl font-mono tracking-[0.5em] text-[#1A1A1A] focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20 placeholder:tracking-normal placeholder:text-sm placeholder:font-sans bg-white"
                            placeholder="숫자 4자리 재입력"
                        />
                    </div>
                </div>
            </div>

            {/* 이용안내 (Notice) */}
            <div className="bg-black/5 border border-black/10 rounded-sm p-8 mb-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-4">Notice</h3>
                <ul className="space-y-3 text-[10px] font-bold tracking-widest text-black/60 leading-relaxed list-disc list-inside marker:text-black/20">
                    <li>비밀번호는 숫자 4자리로 설정 가능하며, 연속된 숫자는 등록하실 수 없습니다.</li>
                    <li>비밀번호 찾기는 불가하며, 해당 페이지를 통해 재설정 후 이용하실 수 있습니다.</li>
                    <li>키노 극장 매표소 및 매점에서 포인트 사용 시 비밀번호가 일치하지 않을 경우 사용이 제한되오니 주의하여 등록 바랍니다.</li>
                </ul>
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 border-t border-black/5 pt-10">
                <button
                    className="w-full sm:w-[200px] py-4 bg-white border border-black/10 text-[10px] font-bold tracking-[0.2em] uppercase text-black/60 hover:bg-black/5 hover:text-black hover:border-black/20 transition-colors rounded-sm"
                    onClick={() => navigate(`/mypage/points?memberId=${memberId}`)}
                >
                    Cancel
                </button>
                <button
                    className="w-full sm:w-[200px] py-4 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-sm"
                    onClick={submitPointPassword}
                >
                    Confirm
                </button>
            </div>
        </section>
    ); //#2

    const renderCards = () => (
        <section className="py-8">
            {/* ===================== [1] 헤더 및 액션 버튼 ===================== */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
                        <div className="w-8 h-px bg-[#B91C1C]"></div>
                        <span>Membership Cards</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-[#1A1A1A] mb-4">
                        멤버십 카드관리
                    </h1>
                    <p className="text-xs font-bold tracking-widest text-black/40 leading-relaxed">
                        키노 계정에 등록된 멤버십 카드를 확인하고 관리할 수 있습니다.
                    </p>
                </div>
                <button
                    className="px-8 py-4 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-sm whitespace-nowrap"
                    onClick={openCardRegisterModal}
                >
                    Register New Card
                </button>
            </div>

            {/* ===================== [2] 멤버십 카드 목록 (카드형 UI) ===================== */}
            <div className="mb-12">
                {membershipCardLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-sm bg-[#FDFDFD]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] animate-pulse">Loading Cards...</span>
                    </div>
                ) : membershipCards.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-sm bg-[#FDFDFD]">
                        <span className="text-xs font-bold uppercase tracking-widest text-black/20 mb-2">등록된 카드가 없습니다</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">우측 상단의 버튼을 눌러 카드를 등록해주세요</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {membershipCards.map((card) => (
                            <div 
                                key={card.cardId} 
                                className="relative bg-[#1A1A1A] text-white p-6 md:p-8 rounded-md shadow-xl overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-black/5"
                            >
                                {/* 카드 내부 디자인 (은은한 빛 반사 효과) */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#B91C1C]/20 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-10 -mb-10"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{card.issuerName}</p>
                                            <p className="font-display text-2xl tracking-tight text-white">{card.cardName}</p>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/30 rounded-sm">
                                            {card.channelName}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3">
                                        <p className="font-mono text-xl tracking-[0.15em] text-white/90 drop-shadow-sm">
                                            {card.cardNumber}
                                        </p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                                            Issued: {formatDateDot(card.issuedDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===================== [3] 이용안내 (Notice) ===================== */}
            <div className="bg-black/5 border border-black/10 rounded-sm p-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-4">Notice</h3>
                <ul className="space-y-3 text-[10px] font-bold tracking-widest text-black/60 leading-relaxed list-disc list-inside marker:text-black/20">
                    <li>앞 혹은 뒷면의 카드 번호와 CVC코드가 있는 카드로만 온라인 등록이 가능합니다.</li>
                    <li>등록된 멤버십 카드는 온라인 및 극장에서 사용하실 수 있습니다.</li>
                    <li>한 번 삭제하신 카드번호는 재등록이 불가합니다.</li>
                </ul>
            </div>
        </section>
    ); //#3

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
            hasPointPassword={hasPointPassword}
            socialNaverLinked={socialNaverLinked}
            socialKakaoLinked={socialKakaoLinked}
            socialGoogleLinked={socialGoogleLinked}
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
                    socialGoogleLinked: false
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
                    hasPointPassword,
                    socialNaverLinked,
                    socialKakaoLinked,
                    socialGoogleLinked
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
            setShowReviewModal={setShowVerifyModal}
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
            <BreadcrumbBar
                crumbs={isGuestReservationOnly ? ["나의 키노", "예매/구매내역", "예매내역"] : crumbs}
                onMoveMenu={moveMenu}
            />

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

                showVerifyModal={showVerifyModal} 
                setShowVerifyModal={setShowVerifyModal}
                showReviewModal={showReviewModal}
                setShowReviewModal={setShowReviewModal}
                reviewReservationNumberInput={reviewReservationNumberInput}
                setReviewReservationNumberInput={setReviewReservationNumberInput}
                reviewMovieTitleInput={reviewMovieTitleInput}
                setReviewMovieTitleInput={setReviewMovieTitleInput}
                reviewContentInput={reviewContentInput}
                setReviewContentInput={setReviewContentInput}
                handleVerifyAndOpenReview={handleVerifyAndOpenReview} // 1단계 확인 함수
                scoreDirection={scoreDirection} setScoreDirection={setScoreDirection}
                scoreStory={scoreStory} setScoreStory={setScoreStory}
                scoreVisual={scoreVisual} setScoreVisual={setScoreVisual}
                scoreActor={scoreActor} setScoreActor={setScoreActor}
                scoreOst={scoreOst} setScoreOst={setScoreOst}
                handleReviewSubmit={handleReviewSubmit}

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
