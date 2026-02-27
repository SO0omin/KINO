import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Search } from "lucide-react";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import {
  cancelReservation,
  getMyCoupons,
  getMyMembershipCards,
  getMyPointHistories,
  getMyPageSummary,
  getMyReservations,
  getMyVouchers,
  getMemberProfile,
  redeemCoupon,
  registerMembershipCard,
  sendPointPasswordSms,
  type MyPointHistoryItem,
  type MyMembershipCardItem,
  type MyCouponItem,
  updatePointPassword,
  updateMemberProfile,
  updateMemberPassword,
  verifyPointPasswordSms,
  registerVoucher,
  removeMovieLike,
  getMyWishMovies,
  type MyVoucherItem,
  type MyPageSummary,
  type MyReservationItem,
  type MemberProfile,
  type MyWishMovieItem,
} from "../api/myPageApi";

type PageKey =
  | "dashboard"
  | "reservations"
  | "vouchers-movie"
  | "vouchers-store"
  | "coupons"
  | "points"
  | "movie-story"
  | "events"
  | "inquiries"
  | "payments"
  | "cards"
  | "point-password"
  | "profile"
  | "profile-preferences";

const PATH_TO_KEY: Record<string, PageKey> = {
  "/my-page": "dashboard",
  "/my-page/reservations": "reservations",
  "/my-page/vouchers": "vouchers-movie",
  "/my-page/vouchers/movie": "vouchers-movie",
  "/my-page/vouchers/store": "vouchers-store",
  "/my-page/coupons": "coupons",
  "/my-page/points": "points",
  "/my-page/point-password": "point-password",
  "/my-page/movie-story": "movie-story",
  "/my-page/events": "events",
  "/my-page/inquiries": "inquiries",
  "/my-page/payments": "payments",
  "/my-page/cards": "cards",
  "/my-page/profile": "profile",
  "/my-page/profile/preferences": "profile-preferences",
};

type MenuChild = {
  label: string;
  path: string;
};

type MenuItem = {
  label: string;
  key: Exclude<PageKey, "dashboard"> | "vouchers";
  path: string;
  children?: MenuChild[];
};

const MENU_CONFIG: MenuItem[] = [
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

function formatDateTime(value: string) {
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

function formatMoney(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatYmd(value: string) {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDot(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatDateSimple(value: string) {
  const date = new Date(value?.includes(" ") ? value.replace(" ", "T") : value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function shiftDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toMonthKey(value: string) {
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}년 ${Number(month)}월`;
}

function splitReservations(items: MyReservationItem[]) {
  const active = items.filter((item) => item.paymentStatus !== "CANCELLED");
  const cancelled = items.filter((item) => item.paymentStatus === "CANCELLED");
  return { active, cancelled };
}

function breadcrumbLabels(pageKey: PageKey) {
  if (pageKey === "dashboard") return ["나의 메가박스"];
  const byPage: Record<PageKey, string[]> = {
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
    "point-password": ["나의 메가박스", "멤버십 포인트", "포인트 비밀번호 설정"],
    profile: ["나의 메가박스", "회원정보", "개인정보 수정"],
    "profile-preferences": ["나의 메가박스", "회원정보", "선호정보 수정"],
  };
  return byPage[pageKey];
}

function EmptyLine({ message }: { message: string }) {
  return <div className="py-10 text-center text-base text-gray-300">{message}</div>;
}

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const memberId = useMemo(() => {
    const q = new URLSearchParams(location.search).get("memberId");
    return Number(q || 1);
  }, [location.search]);

  const pageKey = PATH_TO_KEY[location.pathname] ?? "dashboard";
  const verificationToken = useMemo(() => new URLSearchParams(location.search).get("verifyToken") ?? "", [location.search]);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
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
  const [pointRows, setPointRows] = useState<MyPointHistoryItem[]>([]);
  const [pointLoading, setPointLoading] = useState(false);
  const [showPointPhoneModal, setShowPointPhoneModal] = useState(false);
  const [pointPhoneNumber, setPointPhoneNumber] = useState("");
  const [pointAuthCodeInput, setPointAuthCodeInput] = useState("");
  const [pointAuthSending, setPointAuthSending] = useState(false);
  const [pointAuthVerifying, setPointAuthVerifying] = useState(false);
  const [pointPasswordInput, setPointPasswordInput] = useState("");
  const [pointPasswordConfirmInput, setPointPasswordConfirmInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"available" | "used" | "expired">("available");
  const [showVoucherRegisterModal, setShowVoucherRegisterModal] = useState(false);
  const [voucherRegisterCode, setVoucherRegisterCode] = useState("");
  const [voucherRegisterError, setVoucherRegisterError] = useState("");
  const [voucherItems, setVoucherItems] = useState<MyVoucherItem[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherRegistering, setVoucherRegistering] = useState(false);
  const [couponTab, setCouponTab] = useState<"megabox" | "partner">("megabox");
  const [couponKindFilter, setCouponKindFilter] = useState<"전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타">("전체");
  const [couponSourceFilter, setCouponSourceFilter] = useState<"전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스">("전체");
  const [couponStatusFilter, setCouponStatusFilter] = useState<"available" | "used" | "expired">("available");
  const [couponHiddenOnly, setCouponHiddenOnly] = useState(false);
  const [couponItems, setCouponItems] = useState<MyCouponItem[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponRegisterModal, setShowCouponRegisterModal] = useState(false);
  const [couponRegisterCode, setCouponRegisterCode] = useState("");
  const [couponRegistering, setCouponRegistering] = useState(false);
  const [couponRegisterError, setCouponRegisterError] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<MyCouponItem | null>(null);
  const [membershipCards, setMembershipCards] = useState<MyMembershipCardItem[]>([]);
  const [membershipCardLoading, setMembershipCardLoading] = useState(false);
  const [showCardRegisterModal, setShowCardRegisterModal] = useState(false);
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [cardCvcInput, setCardCvcInput] = useState("");
  const [cardRegistering, setCardRegistering] = useState(false);
  const [cardRegisterError, setCardRegisterError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileTel, setProfileTel] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [prefGenre, setPrefGenre] = useState("");
  const [prefTime, setPrefTime] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [marketingPolicyAgreed, setMarketingPolicyAgreed] = useState(false);
  const [marketingEmailAgreed, setMarketingEmailAgreed] = useState(false);
  const [marketingSmsAgreed, setMarketingSmsAgreed] = useState(false);
  const [marketingPushAgreed, setMarketingPushAgreed] = useState(false);
  const [preferredCinemas, setPreferredCinemas] = useState<string[]>(["", "", "", "", ""]);
  const [preferredGenres, setPreferredGenres] = useState<string[]>(["", "", ""]);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
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
  const [reviews, setReviews] = useState<Array<{ id: string; movieTitle: string; content: string; createdAt: string }>>([]);
  const [wishMovies, setWishMovies] = useState<MyWishMovieItem[]>([]);
  const [wishLoading, setWishLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryData, reservationData] = await Promise.all([
        getMyPageSummary(memberId),
        getMyReservations(memberId),
      ]);
      setSummary(summaryData);
      setReservations(reservationData);
    } catch (error: any) {
      alert(error?.message ?? "마이페이지 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [memberId]);

  const loadMemberProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await getMemberProfile(memberId);
      setMemberProfile(profile);
      setProfileName(profile.name ?? "");
      setProfileTel(profile.tel ?? "");
      setProfileEmail(profile.email ?? "");
      setProfileBirthDate(profile.birthDate ?? "");
    } catch (error: any) {
      alert(error?.message ?? "회원 정보를 불러오지 못했습니다.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "profile") return;
    loadMemberProfile();
  }, [pageKey, memberId]);

  useEffect(() => {
    const savedWatched = localStorage.getItem(`movie-story-watched-${memberId}`);
    const savedReviews = localStorage.getItem(`movie-story-reviews-${memberId}`);
    const savedPreferencesRaw = localStorage.getItem(`mypage-preferences-${memberId}`);
    setWatchedMovies(savedWatched ? JSON.parse(savedWatched) : []);
    setReviews(savedReviews ? JSON.parse(savedReviews) : []);

    if (savedPreferencesRaw) {
      try {
        const savedPreferences = JSON.parse(savedPreferencesRaw);
        setPrefGenre(savedPreferences.prefGenre ?? "");
        setPrefTime(savedPreferences.prefTime ?? "");
        setMarketingPolicyAgreed(Boolean(savedPreferences.marketingPolicyAgreed));
        setMarketingEmailAgreed(Boolean(savedPreferences.marketingEmailAgreed));
        setMarketingSmsAgreed(Boolean(savedPreferences.marketingSmsAgreed));
        setMarketingPushAgreed(Boolean(savedPreferences.marketingPushAgreed));
        setPreferredCinemas(Array.isArray(savedPreferences.preferredCinemas) ? savedPreferences.preferredCinemas.slice(0, 5).concat(["", "", "", "", ""]).slice(0, 5) : ["", "", "", "", ""]);
        setPreferredGenres(Array.isArray(savedPreferences.preferredGenres) ? savedPreferences.preferredGenres.slice(0, 3).concat(["", "", ""]).slice(0, 3) : ["", "", ""]);
        setPreferredTimeSlot(savedPreferences.preferredTimeSlot ?? "");
        setSocialNaverLinked(Boolean(savedPreferences.socialNaverLinked));
        setSocialKakaoLinked(Boolean(savedPreferences.socialKakaoLinked));
      } catch {
        setPrefGenre("");
        setPrefTime("");
      }
    }
  }, [memberId]);

  useEffect(() => {
    localStorage.setItem(`movie-story-watched-${memberId}`, JSON.stringify(watchedMovies));
  }, [memberId, watchedMovies]);

  useEffect(() => {
    localStorage.setItem(`movie-story-reviews-${memberId}`, JSON.stringify(reviews));
  }, [memberId, reviews]);

  useEffect(() => {
    localStorage.setItem(
      `mypage-preferences-${memberId}`,
      JSON.stringify({
        prefGenre,
        prefTime,
        marketingPolicyAgreed,
        marketingEmailAgreed,
        marketingSmsAgreed,
        marketingPushAgreed,
        preferredCinemas,
        preferredGenres,
        preferredTimeSlot,
        socialNaverLinked,
        socialKakaoLinked,
      })
    );
  }, [
    memberId,
    prefGenre,
    prefTime,
    marketingPolicyAgreed,
    marketingEmailAgreed,
    marketingSmsAgreed,
    marketingPushAgreed,
    preferredCinemas,
    preferredGenres,
    preferredTimeSlot,
    socialNaverLinked,
    socialKakaoLinked,
  ]);

  const loadWishMovies = async () => {
    setWishLoading(true);
    try {
      const rows = await getMyWishMovies(memberId);
      setWishMovies(rows);
    } catch (error: any) {
      alert(error?.message ?? "보고싶어 목록을 불러오지 못했습니다.");
      setWishMovies([]);
    } finally {
      setWishLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "movie-story") return;
    loadWishMovies();
  }, [pageKey, memberId]);

  const handleCancel = async (reservationId: number, reason: string) => {
    setIsCancelling(reservationId);
    try {
      await cancelReservation(
        memberId,
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
    const isMovieVoucher = pageKey === "vouchers-movie";
    const digits = voucherRegisterCode.replace(/\D/g, "");
    const valid = isMovieVoucher
      ? digits.length === 12 || digits.length === 16
      : digits.length === 16;

    if (!valid) {
      setVoucherRegisterError(
        isMovieVoucher
          ? "영화관람권 번호는 12자리 또는 16자리 숫자만 가능합니다."
          : "스토어 교환권 번호는 16자리 숫자만 가능합니다."
      );
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
      .catch((error: any) => {
        setVoucherRegisterError(error?.message ?? "등록 처리 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setVoucherRegistering(false);
      });
  };

  const mapVoucherStatusToApi = (status: "available" | "used" | "expired") => {
    if (status === "available") return "AVAILABLE";
    if (status === "used") return "USED";
    return "EXPIRED";
  };

  const mapVoucherStatusLabel = (status: string, isMovieVoucher: boolean) => {
    if (status === "USED") return isMovieVoucher ? "사용완료" : "교환완료";
    if (status === "EXPIRED") return "기간만료";
    return "사용가능";
  };

  const loadVouchers = async () => {
    const isVoucherPage = pageKey === "vouchers-movie" || pageKey === "vouchers-store";
    if (!isVoucherPage) return;

    setVoucherLoading(true);
    try {
      const isMovieVoucher = pageKey === "vouchers-movie";
      const rows = await getMyVouchers(
        memberId,
        isMovieVoucher ? "MOVIE" : "STORE",
        mapVoucherStatusToApi(voucherStatus)
      );
      setVoucherItems(rows);
    } catch (error: any) {
      alert(error?.message ?? "관람권/교환권 정보를 불러오지 못했습니다.");
      setVoucherItems([]);
    } finally {
      setVoucherLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "vouchers-movie" && pageKey !== "vouchers-store") return;
    loadVouchers();
  }, [pageKey, memberId, voucherStatus]);

  const mapCouponStatusLabel = (status: string) => {
    if (status === "USED") return "사용완료";
    if (status === "EXPIRED") return "기간만료";
    return "사용가능";
  };

  const normalizeCouponStatus = (status: string) => {
    if (status === "USED") return "used";
    if (status === "EXPIRED") return "expired";
    return "available";
  };

  const loadCoupons = async () => {
    if (pageKey !== "coupons") return;
    setCouponLoading(true);
    try {
      const rows = await getMyCoupons(memberId);
      setCouponItems(rows);
    } catch (error: any) {
      alert(error?.message ?? "쿠폰 목록을 불러오지 못했습니다.");
      setCouponItems([]);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "coupons") return;
    loadCoupons();
  }, [pageKey, memberId]);

  const filteredCoupons = useMemo(() => {
    return couponItems.filter((item) => {
      const byTab =
        couponTab === "megabox"
          ? item.sourceType !== "PARTNER"
          : item.sourceType === "PARTNER";

      const byKind =
        couponKindFilter === "전체"
          ? true
          : item.couponKind === couponKindFilter;

      const byStatus = normalizeCouponStatus(item.status) === couponStatusFilter;

      const bySource =
        couponSourceFilter === "전체"
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

  const loadMembershipCards = async () => {
    if (pageKey !== "cards") return;
    setMembershipCardLoading(true);
    try {
      const rows = await getMyMembershipCards(memberId);
      setMembershipCards(rows);
    } catch (error: any) {
      alert(error?.message ?? "멤버십 카드 목록을 불러오지 못했습니다.");
      setMembershipCards([]);
    } finally {
      setMembershipCardLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "cards") return;
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

  const loadPointHistories = async () => {
    if (pageKey !== "points") return;
    setPointLoading(true);
    try {
      const rows = await getMyPointHistories(memberId, appliedPointFrom, appliedPointTo);
      setPointRows(rows);
    } catch (error: any) {
      alert(error?.message ?? "포인트 이용내역을 불러오지 못했습니다.");
      setPointRows([]);
    } finally {
      setPointLoading(false);
    }
  };

  useEffect(() => {
    if (pageKey !== "points") return;
    loadPointHistories();
  }, [pageKey, memberId, appliedPointFrom, appliedPointTo]);

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
        const statusMatched =
          appliedPurchaseStatusType === "all"
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
      navigate(`/my-page/point-password?memberId=${memberId}&verifyToken=${encodeURIComponent(response.verificationToken)}`);
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
      navigate(`/my-page/points?memberId=${memberId}`);
      return;
    }
    try {
      const response = await updatePointPassword(memberId, verificationToken, newPassword, confirmPassword);
      alert(response?.message ?? "포인트 비밀번호가 설정되었습니다.");
      navigate(`/my-page/points?memberId=${memberId}`);
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

    return (
      <>
        <section className="overflow-hidden rounded-md border border-[#000000] bg-[#000000] text-[#ffffff]">
          <div className="bg-[#000000] px-8 py-9">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#eb4d32] text-2xl font-bold">W</div>
                <div>
                  <h1 className="text-3xl font-semibold leading-none">안녕하세요!</h1>
                  <p className="mt-2 text-3xl font-semibold leading-none">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
                  <p className="mt-3 text-base font-semibold">{summary?.memberName ?? "회원"}님</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">현재등급 <span className="font-semibold text-[#eb4d32]">WELCOME</span></p>
                <div className="mt-3 inline-block rounded bg-[#eb4d32] px-4 py-1 text-sm font-semibold text-[#ffffff]">
                  다음 Friends 등급까지 6,000 P 남았어요!
                </div>
                <div className="mt-4 flex items-center justify-end gap-5 text-sm">
                  {["Welcome", "Friends", "VIP", "VVIP", "MVIP"].map((label, index) => (
                    <div key={label} className="flex items-center gap-2 text-white/85">
                      <span className={`h-3 w-3 rounded-full ${index === 0 ? "bg-[#eb4d32]" : "bg-[#ffffff]"}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 border-t border-[#000000] bg-[#ffffff] text-[#000000] lg:grid-cols-4">
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>포인트 이용내역</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm">적립예정 <span className="float-right font-semibold">0 P</span></p>
              <p className="mt-2 text-sm">당월소멸예정 <span className="float-right font-semibold">0 P</span></p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>선호하는 극장</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-[#eb4d32]">선호극장</p>
              <p>을 설정하세요.</p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>관람권/쿠폰</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm">영화관람권 <span className="float-right font-semibold">0 매</span></p>
              <p className="mt-2 text-sm">스토어교환권 <span className="float-right font-semibold">0 매</span></p>
              <p className="mt-2 text-sm">할인/제휴쿠폰 <span className="float-right font-semibold">{summary?.availableCouponCount ?? 0} 매</span></p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>클럽 멤버십</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p>특별한 멤버십 혜택을 만나보세요!</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#eb4d32]">나의 무비스토리</h3>
              <button className="rounded border border-gray-300 px-4 py-1 text-sm">본 영화 등록</button>
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

          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#eb4d32]">선호관람정보</h3>
              <button className="rounded border border-gray-300 px-4 py-1 text-sm">설정</button>
            </div>
            <div className="space-y-4 text-base text-[#eb4d32]">
              <p>· 내 선호장르</p>
              <p>· 내 선호시간</p>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-sm border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
            <h3 className="text-2xl font-semibold text-[#eb4d32]">나의 예매내역</h3>
            <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/reservations")}>더보기 <ChevronRight className="h-5 w-5" /></button>
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
            <button className="flex items-center gap-1 text-base text-gray-600">더보기 <ChevronRight className="h-5 w-5" /></button>
          </div>
          <EmptyLine message="구매내역이 없습니다." />
        </section>

        <section className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-sm border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
              <h3 className="text-2xl font-semibold text-[#eb4d32]">참여이벤트</h3>
              <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/events")}>더보기 <ChevronRight className="h-5 w-5" /></button>
            </div>
            <EmptyLine message="참여한 이벤트가 없습니다." />
          </div>
          <div className="rounded-sm border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
              <h3 className="text-2xl font-semibold text-[#eb4d32]">문의내역</h3>
              <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/inquiries")}>더보기 <ChevronRight className="h-5 w-5" /></button>
            </div>
            <EmptyLine message="문의내역이 없습니다." />
          </div>
        </section>
      </>
    );
  };

  const renderReservations = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">예매/구매 내역</h1>

      <div className="mt-5 flex border-b border-gray-300">
        <button
          className={`w-40 border border-b-0 px-4 py-2 ${reservationTab === "reservation" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`}
          onClick={() => setReservationTab("reservation")}
        >
          예매
        </button>
        <button
          className={`w-40 border border-b-0 px-4 py-2 ${reservationTab === "purchase" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`}
          onClick={() => setReservationTab("purchase")}
        >
          구매
        </button>
      </div>

      {reservationTab === "reservation" ? (
        <>
          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold">구분</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={historyType === "current"}
                  onChange={() => setHistoryType("current")}
                />
                예매내역
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={historyType === "past"}
                  onChange={() => setHistoryType("past")}
                />
                지난내역
              </label>
              <select
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={historyType === "current"}
              >
                {monthOptions.length === 0 ? (
                  <option value="">월 데이터 없음</option>
                ) : (
                  monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {monthLabel(month)}
                    </option>
                  ))
                )}
              </select>
              <button
                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm"
                onClick={() => {
                  setAppliedHistoryType(historyType);
                  setAppliedMonth(historyType === "current" ? "" : selectedMonth);
                }}
              >
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white">
            {loading ? (
              <div className="py-12 text-center text-gray-500">불러오는 중...</div>
            ) : visibleReservations.length === 0 ? (
              <div className="py-12 text-center text-gray-500">예매 내역이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {visibleReservations.map((item) => (
                  <div key={item.reservationId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{item.movieTitle}</p>
                      <p className="text-sm text-gray-600">{item.theaterName} / {item.screenName}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(item.startTime)}</p>
                      <p className="text-sm text-gray-600">좌석: {item.seatNames.join(", ") || "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(item.finalAmount)}</p>
                      {item.cancellable ? (
                        <button
                          className="mt-2 rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]"
                          disabled={isCancelling === item.reservationId}
                          onClick={() => openCancelModal(item.reservationId)}
                        >
                          {isCancelling === item.reservationId ? "처리 중..." : "환불하기"}
                        </button>
                      ) : (
                        <span className="mt-2 inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-500">환불 불가</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="mr-2 font-semibold text-[#000000]">구분</span>
              <select
                className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1.5 text-sm text-[#000000]"
                value={purchaseSelectType}
                onChange={(e) => setPurchaseSelectType(e.target.value as "all" | "movie")}
              >
                <option value="all">전체</option>
                <option value="movie">영화예매</option>
              </select>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "all"} onChange={() => setPurchaseStatusType("all")} />
                전체
              </label>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "purchase"} onChange={() => setPurchaseStatusType("purchase")} />
                구매내역
              </label>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "cancel"} onChange={() => setPurchaseStatusType("cancel")} />
                취소내역
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-2 font-semibold text-[#000000]">조회기간</span>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "week" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("week")}>1주일</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month1" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month1")}>1개월</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month3" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month3")}>3개월</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month6" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month6")}>6개월</button>
              <input type="date" className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1" value={purchaseFrom} onChange={(e) => setPurchaseFrom(e.target.value)} />
              <span className="text-[#000000]">~</span>
              <input type="date" className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1" value={purchaseTo} onChange={(e) => setPurchaseTo(e.target.value)} />
              <button
                className="flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-3 py-1 text-[#000000]"
                onClick={() => {
                  setAppliedPurchaseSelectType(purchaseSelectType);
                  setAppliedPurchaseStatusType(purchaseStatusType);
                  setAppliedPurchaseFrom(purchaseFrom);
                  setAppliedPurchaseTo(purchaseTo);
                }}
              >
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm bg-[#ffffff]">
            <div className="p-5">
              <p className="text-base font-semibold text-[#000000]">전체 {purchaseRows.length}건</p>
              <div className="mt-2">
                <div className="grid grid-cols-5 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
                  <span>결제일시</span>
                  <span>구분</span>
                  <span>상품명</span>
                  <span>결제금액</span>
                  <span>상태</span>
                </div>
                {purchaseRows.length === 0 ? (
                  <div className="border-b border-gray-200 py-10 text-center text-[#000000]">결제내역이 없습니다.</div>
                ) : (
                  purchaseRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-5 border-b border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
                      <span>{formatDateTime(row.paymentDate.toISOString())}</span>
                      <span>{row.category}</span>
                      <span>{row.productName}</span>
                      <span>{formatMoney(row.amount)}</span>
                      <span className={row.isCancelled ? "text-[#eb4d32]" : "text-[#000000]"}>{row.statusLabel}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-sm bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#000000]">
              <span>이용안내</span>
              <span>⌃</span>
            </div>
            <div className="p-4 text-sm leading-7 text-[#000000]">
              <p className="font-semibold">[스토어 구매/취소 안내]</p>
              <p>· 스토어 상품은 구매 후 취소가능기간 내 100% 환불이 가능하며, 부분환불은 불가 합니다.</p>
              <p>· (ex. 3개의 쿠폰 합 번에 구매하신 경우, 3개 모두 취소만 가능하며 그 중 사용하신 쿠폰이 있는 경우 환불이 불가합니다)</p>
              <p>· 스토어 교환권은 MMS로 최대 1회 재전송 하실 수 있습니다.</p>
              <p className="mt-3 font-semibold">[모바일오더 구매/취소 안내]</p>
              <p>· 모바일오더는 모바일앱을 통해 이용하실 수 있습니다.</p>
              <p>· 모바일오더는 구매 후 즉시 조리되는 상품으로 취소가 불가합니다.</p>
              <p>· 극장 매점에서 주문번호가 호출되면 상품을 수령하실 수 있습니다.</p>
              <p>· 극장 상황에 따라 상품준비시간이 다소 길어질 수 있습니다.</p>
            </div>
          </div>
        </>
      )}

      {reservationTab === "reservation" ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[#eb4d32]">예매취소내역</h2>
          <p className="mt-2 text-sm text-gray-600">· 상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-6 text-center text-gray-500">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => (
                <div key={item.reservationId} className="grid grid-cols-5 border-t border-gray-200 px-4 py-3 text-center text-sm">
                  <span>{formatDateTime(item.startTime)}</span>
                  <span>{item.movieTitle}</span>
                  <span>{item.theaterName}</span>
                  <span>{formatDateTime(item.startTime)}</span>
                  <span>{formatMoney(item.finalAmount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {reservationTab === "reservation" ? (
        <div className="mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3">이용안내</div>
      ) : null}
    </section>
  );

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

    return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">{isMovieVoucher ? "영화관람권" : "스토어 교환권"}</h1>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mt-2 text-sm text-[#000000]">· 보유하신 {isMovieVoucher ? "영화관람권/예매권" : "스토어 교환권"} 내역입니다.</p>
          <p className="text-sm text-[#000000]">
            · {isMovieVoucher ? "소지하신 지류(종이)관람권은 등록 후 이용하실 수 있습니다." : "소지하신 스토어교환권은 등록 후 이용하실 수 있습니다."}
          </p>
        </div>
        <button
          className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]"
          onClick={openVoucherRegisterModal}
        >
          {isMovieVoucher ? "관람권등록" : "스토어 교환권 등록"}
        </button>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#000000]">
          {isMovieVoucher ? (
            <>총 <span className="text-[#eb4d32]">{voucherItems.length}</span>매</>
          ) : (
            <>전체 <span className="text-[#eb4d32]">{voucherItems.length}</span>건</>
          )}
        </p>
        <select
          className="rounded border border-gray-200 bg-[#ffffff] px-4 py-2 text-sm text-[#000000]"
          value={voucherStatus}
          onChange={(e) => setVoucherStatus(e.target.value as "available" | "used" | "expired")}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        {isMovieVoucher ? (
          <>
            <div className="grid grid-cols-3 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
              <span>관람권명</span>
              <span>유효기간</span>
              <span>사용상태</span>
            </div>
            {voucherLoading ? (
              <div className="py-8 text-center text-[#000000]">불러오는 중...</div>
            ) : voucherItems.length === 0 ? (
              <div className="py-8 text-center text-[#000000]">조회된 관람권 내역이 없습니다.</div>
            ) : (
              voucherItems.map((item) => (
                <div key={item.voucherId} className="grid grid-cols-3 border-t border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
                  <span>{item.name}</span>
                  <span>{item.validUntil ? formatDateTime(item.validUntil) : "-"}</span>
                  <span>{mapVoucherStatusLabel(item.status, true)}</span>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-4 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
              <span>구분</span>
              <span>교환권명</span>
              <span>유효기간</span>
              <span>사용상태</span>
            </div>
            {voucherLoading ? (
              <div className="py-8 text-center text-[#000000]">불러오는 중...</div>
            ) : voucherItems.length === 0 ? (
              <div className="py-8 text-center text-[#000000]">등록된 교환권이 없습니다.</div>
            ) : (
              voucherItems.map((item) => (
                <div key={item.voucherId} className="grid grid-cols-4 border-t border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
                  <span>교환권</span>
                  <span>{item.name}</span>
                  <span>{item.validUntil ? formatDateTime(item.validUntil) : "-"}</span>
                  <span>{mapVoucherStatusLabel(item.status, false)}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#000000]">
          <span>이용안내</span>
          <span className="text-gray-400">⌄</span>
        </div>
      </div>
    </section>
  );
  };

  const renderCoupons = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">메가박스/제휴쿠폰</h1>

      <div className="mt-5 flex border-b border-gray-200">
        <button
          className={`w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "megabox" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`}
          onClick={() => setCouponTab("megabox")}
        >
          메가박스 쿠폰
        </button>
        <button
          className={`w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "partner" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`}
          onClick={() => setCouponTab("partner")}
        >
          제휴 쿠폰
        </button>
      </div>

      {couponTab === "partner" ? (
        <>
          <div className="mt-5">
            <p className="text-sm text-[#000000]">· 제휴쿠폰 내역입니다.</p>
            <p className="text-sm text-[#000000]">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            <div className="grid grid-cols-2 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>쿠폰명</span>
              <span>발급일자</span>
            </div>
            {couponLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">불러오는 중...</div>
            ) : couponItems.filter((item) => item.sourceType === "PARTNER").length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">쿠폰이 없습니다.</div>
            ) : (
              couponItems
                .filter((item) => item.sourceType === "PARTNER")
                .map((item) => (
                  <div key={item.memberCouponId} className="grid grid-cols-2 items-center border-t border-gray-200 px-4 py-4 text-center text-sm text-[#000000]">
                    <span>{item.couponName}</span>
                    <span>{item.issuedAt ? formatDateTime(item.issuedAt) : "-"}</span>
                  </div>
                ))
            )}
          </div>

          <div className="mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3">이용안내</div>
        </>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#000000]">· 보유하신 쿠폰 내역입니다.</p>
              <p className="text-sm text-[#000000]">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
            </div>
            <button
              className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]"
              onClick={openCouponRegisterModal}
            >
              할인쿠폰 등록
            </button>
          </div>

          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-[#000000]">유형</span>
              {(["전체", "매표", "매점", "포인트", "포토카드", "기타"] as const).map((type) => (
                <button
                  key={type}
                  className={`rounded border px-4 py-2 ${couponKindFilter === type ? "border-[#eb4d32] text-[#eb4d32]" : "border-gray-200 text-[#000000]"}`}
                  onClick={() => setCouponKindFilter(type)}
                >
                  {type}
                </button>
              ))}
              <span className="ml-4 font-semibold text-[#000000]">구분</span>
              <select
                className="rounded border border-gray-200 bg-[#ffffff] px-3 py-2"
                value={couponSourceFilter}
                onChange={(e) => setCouponSourceFilter(e.target.value as "전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스")}
              >
                <option>전체</option>
                <option>할인쿠폰</option>
                <option>VIP쿠폰</option>
                <option>쿠폰패스</option>
              </select>
              <button className="flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-4 py-2">
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "available"} onChange={() => setCouponStatusFilter("available")} />
                  사용가능
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "used"} onChange={() => setCouponStatusFilter("used")} />
                  사용완료
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "expired"} onChange={() => setCouponStatusFilter("expired")} />
                  기간만료
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={couponHiddenOnly}
                  onChange={(e) => setCouponHiddenOnly(e.target.checked)}
                />
                숨긴쿠폰
              </label>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <p className="text-lg font-semibold text-[#000000]">
              총 <span className="text-[#eb4d32]">{filteredCoupons.length}</span>매
            </p>
          </div>

          <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            <div className="grid grid-cols-5 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>구분</span>
              <span>쿠폰명</span>
              <span>유효기간</span>
              <span>사용상태</span>
              <span>액션</span>
            </div>

            {couponLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">불러오는 중...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">조회된 쿠폰 내역이 없습니다.</div>
            ) : (
              filteredCoupons.map((item) => (
                <div key={item.memberCouponId} className="grid grid-cols-5 items-center border-t border-gray-200 px-4 py-4 text-center text-sm">
                  <span>{item.couponKind || "기타"}</span>
                  <div>
                    <p>{item.couponName}</p>
                    <p className="text-gray-500">{item.couponCode}</p>
                  </div>
                  <span>{item.expiresAt ? formatDateTime(item.expiresAt) : "-"}</span>
                  <span>{mapCouponStatusLabel(item.status)}</span>
                  <button
                    className="mx-auto rounded border border-gray-200 px-3 py-1 text-sm"
                    onClick={() => openCouponInfoModal(item)}
                  >
                    쿠폰정보
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button className="rounded bg-[#eb4d32] px-4 py-2 text-sm text-[#ffffff]">1</button>
          </div>

          <div className="mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3">이용안내</div>
        </>
      )}
    </section>
  );

  const renderPoints = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">포인트 이용내역</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b bg-[#ffffff] px-5 py-4">
          <h2 className="text-lg font-semibold">나의 포인트 정보</h2>
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm"
            onClick={openPointPhoneModal}
          >
            포인트 비밀번호 설정
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-[#000000] p-6 text-white">
            <h3 className="text-center text-3xl font-semibold">사용가능 포인트</h3>
            <p className="mt-3 text-center text-5xl font-bold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 적립예정</span><span>0 P</span>
              </div>
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 당월소멸예정</span><span>0 P</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-center text-xl font-semibold text-gray-700">VIP 선정 누적 포인트 현황</h3>
            <div className="mt-4 rounded bg-[#ffffff] py-2 text-center text-base font-semibold">포인트</div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>· 매표 <span className="float-right">0</span></p>
              <p>· 매점 <span className="float-right">0</span></p>
              <p>· 이벤트(VIP등급대상) <span className="float-right">0</span></p>
            </div>
            <p className="mt-8 text-right text-3xl font-semibold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
          </div>
        </div>
      </div>

      <h2 className="mt-9 text-3xl font-semibold text-[#eb4d32]">이용내역 조회</h2>
      <p className="mt-2 text-sm text-gray-600">· 하단 내역은 상영일 및 구매일 기준이며, 해당일 익일(+1)에 사용 가능 포인트로 전환됩니다.</p>
      <p className="text-sm text-gray-600">· 적립 예정 포인트는 사용 가능포인트에 포함되지 않으며, 환불 또는 거래 취소가 될 경우 내역에서 삭제됩니다.</p>

      <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm md:flex-nowrap">
          <span className="font-semibold">조회기간</span>
          <button className={`rounded border px-4 py-2 ${pointRange === 'week' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`} onClick={() => applyPointRange('week')}>1주일</button>
          <button className={`rounded border px-4 py-2 ${pointRange === 'month1' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`} onClick={() => applyPointRange('month1')}>1개월</button>
          <button className={`rounded border px-4 py-2 ${pointRange === 'month3' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`} onClick={() => applyPointRange('month3')}>3개월</button>
          <button className={`rounded border px-4 py-2 ${pointRange === 'month6' ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`} onClick={() => applyPointRange('month6')}>6개월</button>
          <input className="w-[170px] rounded border border-gray-300 px-3 py-2" type="date" value={pointFrom} onChange={(e) => setPointFrom(e.target.value)} />
          <span>~</span>
          <input className="w-[170px] rounded border border-gray-300 px-3 py-2" type="date" value={pointTo} onChange={(e) => setPointTo(e.target.value)} />
          <button
            className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 whitespace-nowrap"
            onClick={() => {
              if (!pointFrom || !pointTo) {
                alert("조회 시작일/종료일을 선택해 주세요.");
                return;
              }
              if (new Date(pointFrom).getTime() > new Date(pointTo).getTime()) {
                alert("조회 시작일은 종료일보다 이후일 수 없습니다.");
                return;
              }
              setAppliedPointFrom(pointFrom);
              setAppliedPointTo(pointTo);
            }}
          >
            <Search className="h-4 w-4" /> 조회
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>일자</span>
          <span>구분</span>
          <span>내용</span>
          <span>지점</span>
          <span>포인트</span>
        </div>
        {pointLoading ? (
          <div className="py-8 text-center text-gray-500">불러오는 중...</div>
        ) : pointRows.length === 0 ? (
          <div className="py-8 text-center text-gray-500">조회된 내역이 없습니다</div>
        ) : (
          pointRows.map((row) => (
            <div key={row.pointId} className="grid grid-cols-5 border-t border-gray-200 px-4 py-3 text-center text-sm">
              <span>{formatDateTime(row.createdAt)}</span>
              <span>{row.typeLabel}</span>
              <span>{row.content}</span>
              <span>{row.branchName || "-"}</span>
              <span className={row.point >= 0 ? "text-[#eb4d32] font-semibold" : "font-semibold"}>
                {row.point > 0 ? `+${row.point.toLocaleString()}` : row.point.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );

  const renderPointPassword = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">포인트 비밀번호 설정</h1>
      <p className="mt-5 text-xl text-[#000000]">· 메가박스 극장에서 멤버십 포인트를 사용하시려면 비밀번호가 필요합니다.</p>
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
        <p>· 메가박스 극장 매표소 및 매점에서 포인트 사용 시 비밀번호가 일치하지 않을 경우 사용이 제한되오니 주의하여 등록바랍니다.</p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded border border-[#eb4d32] px-10 py-3 text-lg font-semibold text-[#eb4d32]"
          onClick={() => navigate(`/my-page/points?memberId=${memberId}`)}
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
          <p className="mt-5 text-sm text-gray-600">· 메가박스 계정에 등록된 멤버십 카드를 관리할 수 있습니다.</p>
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
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">개인정보 수정</h1>
      <p className="mt-4 text-sm text-gray-600">· 회원님의 정보를 정확히 입력해주세요.</p>

      <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr_auto] items-center border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-5 text-base font-semibold text-[#000000]">프로필 사진</div>
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">이미지</div>
              )}
            </div>
            <label className="cursor-pointer rounded border border-gray-300 bg-[#ffffff] px-4 py-2 text-sm text-[#000000]">
              이미지 등록
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setProfileImageUrl(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <span className="text-xs text-gray-400">개인정보가 포함된 이미지는 등록하지 마시기 바랍니다.</span>
          </div>
          <div className="px-4 text-right">
            <button className="rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]">회원탈퇴</button>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">아이디</div>
          <div className="px-4 py-4 text-base text-gray-700">{memberProfile?.username ?? "-"}</div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">기본정보</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">이름 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-10 w-[220px] border border-gray-300 px-3 text-base"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 disabled:opacity-60"
              onClick={handleSaveProfile}
              disabled={profileLoading || profileSaving}
            >
              이름변경
            </button>
            <span className="text-sm text-gray-500">개명으로 이름이 변경된 경우 회원정보의 이름을 변경하실 수 있습니다.</span>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">생년월일 <span className="text-[#eb4d32]">*</span></div>
          <div className="px-4 py-4 text-base text-gray-700">
            {profileBirthDate ? formatDateSimple(profileBirthDate) : "-"}
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">휴대폰 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-10 w-[220px] border border-gray-300 px-3 text-base"
              value={profileTel}
              onChange={(e) => setProfileTel(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 disabled:opacity-60"
              onClick={handlePhoneChange}
              disabled={profileLoading || profileSaving}
            >
              휴대폰번호 변경
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">이메일 <span className="text-[#eb4d32]">*</span></div>
          <div className="px-4 py-3">
            <input
              className="h-10 w-full max-w-[700px] border border-gray-300 px-3 text-base"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              disabled={profileLoading}
            />
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">비밀번호 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
            <button className="rounded border border-gray-300 px-3 py-2" onClick={() => setShowPasswordChangeModal(true)}>
              비밀번호 변경
            </button>
            <span>마지막 비밀번호 변경: 57일전에 함</span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">포인트 비밀번호 설정</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">멤버십 포인트 사용시 비밀번호 설정</div>
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
            <button
              className="rounded border border-gray-300 px-3 py-2"
              onClick={openPointPhoneModal}
            >
              포인트 비밀번호 설정
            </button>
            <label className="flex items-center gap-1"><input type="radio" name="pointuse" defaultChecked />사용안함</label>
            <label className="flex items-center gap-1"><input type="radio" name="pointuse" />사용함</label>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">생년월일 로그인 설정</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">무인발권기(KIOSK) 기능설정</div>
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" defaultChecked />사용</label>
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" />사용안함</label>
            <span className="text-gray-500">생년월일+휴대폰번호 티켓 출력 및 회원서비스 이용</span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">간편로그인 계정연동</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[120px_1fr_120px] border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#000000]">
          <span>구분</span>
          <span>연동정보</span>
          <span className="text-center">연결</span>
        </div>
        {["네이버", "카카오"].map((row) => (
          <div key={row} className="grid grid-cols-[120px_1fr_120px] border-b border-gray-200 px-4 py-3 text-sm">
            <span>{row}</span>
            <span className="text-gray-500">
              {row === "네이버"
                ? (socialNaverLinked ? "네이버 계정 연동됨" : "연결된 계정정보가 없습니다.")
                : (socialKakaoLinked ? "카카오 계정 연동됨" : "연결된 계정정보가 없습니다.")}
            </span>
            <div className="text-center">
              <button
                className="rounded bg-[#000000] px-3 py-1.5 text-xs text-[#ffffff]"
                onClick={() => toggleSocialLink(row === "네이버" ? "naver" : "kakao")}
              >
                {row === "네이버" ? (socialNaverLinked ? "해제" : "연동") : (socialKakaoLinked ? "해제" : "연동")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">스페셜 멤버십 가입내역</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr_auto] items-center px-4 py-3 text-sm">
          <span className="font-semibold">가입정보</span>
          <span className="text-gray-500">가입된 스페셜 멤버십이 없습니다.</span>
          <button className="rounded bg-[#000000] px-4 py-2 text-xs text-[#ffffff]">스페셜 멤버십 가입 안내</button>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          className="rounded border border-[#eb4d32] px-8 py-3 text-base font-semibold text-[#eb4d32]"
          onClick={() => loadMemberProfile()}
          disabled={profileLoading || profileSaving}
        >
          취소
        </button>
        <button
          className="rounded bg-[#eb4d32] px-8 py-3 text-base font-semibold text-[#ffffff] disabled:opacity-60"
          disabled={profileLoading || profileSaving}
          onClick={handleSaveProfile}
        >
          {profileSaving ? "저장 중..." : "등록"}
        </button>
      </div>
    </section>
  );

  const renderProfilePreferences = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">선택정보 수정</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold">마케팅 활용을 위한 개인정보 수집 이용 안내</h3>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="radio" checked={!marketingPolicyAgreed} onChange={() => setMarketingPolicyAgreed(false)} />미동의</label>
            <label className="flex items-center gap-1"><input type="radio" checked={marketingPolicyAgreed} onChange={() => setMarketingPolicyAgreed(true)} />동의</label>
          </div>
        </div>
        <div className="px-6 py-5 text-sm leading-7 text-gray-700">
          <p>[수집 목적]</p>
          <p>고객 맞춤형 상품 및 서비스 추천, 이벤트/사은/할인 정보 안내</p>
          <p className="mt-2">[수집 항목]</p>
          <p>이메일, 휴대폰번호, 주소, 생년월일, 선호극장, 문자/이메일/앱푸시 수신동의여부</p>
          <p className="mt-2">[보유 및 이용 기간]</p>
          <p>회원 탈퇴 시 혹은 이용 목적 달성 시까지</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="border-b border-gray-200 px-6 py-4 text-xl font-semibold">마케팅정보 수신동의</div>
        <div className="px-6 py-5 text-sm text-gray-700">
          <p>거래정보와 관련된 내용(예매완료/취소)과 소멸포인트 안내는 수신동의 여부와 관계없이 발송됩니다.</p>
          <p className="mt-1">· 수신동의 여부를 선택해 주세요.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">이메일</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingEmailAgreed} onChange={() => setMarketingEmailAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingEmailAgreed} onChange={() => setMarketingEmailAgreed(false)} />수신거부</label>
            </div>
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">SMS</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingSmsAgreed} onChange={() => setMarketingSmsAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingSmsAgreed} onChange={() => setMarketingSmsAgreed(false)} />수신거부</label>
            </div>
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">PUSH</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingPushAgreed} onChange={() => setMarketingPushAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingPushAgreed} onChange={() => setMarketingPushAgreed(false)} />수신거부</label>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">부가정보</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold">선호극장</div>
          <div className="space-y-3 px-4 py-4">
            <p className="text-sm text-gray-500">선호 극장은 최대 5개까지 등록 가능합니다.</p>
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-10 text-sm font-semibold">{idx + 1}순위</span>
                <input
                  className="h-10 w-[220px] border border-gray-300 px-3 text-sm"
                  placeholder={`${idx + 1}순위 극장 선택`}
                  value={preferredCinemas[idx] || ""}
                  onChange={(e) =>
                    setPreferredCinemas((prev) => {
                      const next = [...prev];
                      next[idx] = e.target.value;
                      return next;
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold">선호 장르 (3개 선택)</div>
          <div className="flex flex-wrap items-center gap-2 px-4 py-4">
            {[0, 1, 2].map((idx) => (
              <input
                key={idx}
                className="h-10 w-[180px] border border-gray-300 px-3 text-sm"
                placeholder="선호장르 선택"
                value={preferredGenres[idx] || ""}
                onChange={(e) =>
                  setPreferredGenres((prev) => {
                    const next = [...prev];
                    next[idx] = e.target.value;
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold">선호시간</div>
          <div className="grid grid-cols-2 gap-y-2 px-4 py-4 text-sm md:grid-cols-3">
            {["10시 이전", "10시~13시", "13시~16시", "16시~18시", "18시~21시", "21시 이후"].map((slot) => (
              <label key={slot} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="pref-time-slot"
                  checked={preferredTimeSlot === slot}
                  onChange={() => setPreferredTimeSlot(slot)}
                />
                {slot}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded border border-[#eb4d32] px-8 py-3 text-base font-semibold text-[#eb4d32]"
          onClick={() => {
            setMarketingPolicyAgreed(false);
            setMarketingEmailAgreed(false);
            setMarketingSmsAgreed(false);
            setMarketingPushAgreed(false);
            setPreferredCinemas(["", "", "", "", ""]);
            setPreferredGenres(["", "", ""]);
            setPreferredTimeSlot("");
          }}
        >
          취소
        </button>
        <button
          className="rounded bg-[#eb4d32] px-8 py-3 text-base font-semibold text-[#ffffff]"
          onClick={() => {
            setPrefGenre(preferredGenres.filter(Boolean).join(", "));
            setPrefTime(preferredTimeSlot);
            alert("선호정보가 저장되었습니다.");
          }}
        >
          수정
        </button>
      </div>
    </section>
  );

  const renderMovieStory = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 무비스토리</h1>

      <div className="mt-5 grid grid-cols-2 border border-gray-300 md:grid-cols-4">
        {[
          { key: "timeline", label: "무비타임라인" },
          { key: "review", label: "관람평" },
          { key: "watched", label: "본영화" },
          { key: "wish", label: "보고싶어" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-5 py-3 text-sm ${
              movieStoryTab === tab.key ? "bg-[#000000] text-[#ffffff]" : "bg-[#ffffff] text-gray-600"
            }`}
            onClick={() => setMovieStoryTab(tab.key as "timeline" | "review" | "watched" | "wish")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {movieStoryTab === "timeline" ? (
        <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-lg">
            <button
              className="text-gray-400"
              onClick={() => {
                const idx = timelineYears.indexOf(selectedTimelineYear);
                if (idx > 0) setSelectedTimelineYear(timelineYears[idx - 1]);
              }}
            >
              ‹
            </button>
            <div className="flex gap-8">
              {timelineYears.map((year) => (
                <button
                  key={year}
                  className={year === selectedTimelineYear ? "border-b-4 border-[#eb4d32] pb-1" : ""}
                  onClick={() => setSelectedTimelineYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
            <button
              className="text-gray-400"
              onClick={() => {
                const idx = timelineYears.indexOf(selectedTimelineYear);
                if (idx < timelineYears.length - 1) setSelectedTimelineYear(timelineYears[idx + 1]);
              }}
            >
              ›
            </button>
          </div>
          {timelineRows.length === 0 ? (
            <div className="py-14 text-center text-gray-500">나의 무비타임라인을 만들어 보세요.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {timelineRows.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <p className="text-lg font-semibold text-[#000000]">{item.movieTitle}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {formatDateSimple(item.watchedAt)} · {item.theaterName} {item.screenName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {movieStoryTab === "review" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-2xl font-semibold">총 <span className="text-[#eb4d32]">{reviewCount}</span>건</p>
            <button
              className="rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]"
              onClick={() => setShowReviewModal(true)}
            >
              관람평 작성
            </button>
          </div>
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            {reviews.length === 0 ? (
              <div className="py-14 text-center text-gray-500">등록된 한줄평이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reviews.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <p className="text-base font-semibold">{item.movieTitle}</p>
                    <p className="mt-2 text-sm">{item.content}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateSimple(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {movieStoryTab === "watched" ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[#000000]">· 극장에서 발권하신 티켓 거래번호 또는 직접 등록으로 본 영화를 기록할 수 있습니다.</p>
              <p className="text-sm text-[#000000]">· 본영화는 관람한 인원수에 한해 등록이 가능합니다.</p>
            </div>
            <button
              className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]"
              onClick={() => setShowWatchedModal(true)}
            >
              본 영화 등록
            </button>
          </div>
          <div className="mt-5">
            <p className="text-2xl font-semibold">총 <span className="text-[#eb4d32]">{watchedCount}</span>건</p>
          </div>
          <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            {allWatchedMovies.length === 0 ? (
              <div className="py-14 text-center text-gray-500">관람 내역이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {allWatchedMovies.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <p className="text-base font-semibold">{item.movieTitle}</p>
                    <p className="mt-1 text-sm text-gray-600">{formatDateSimple(item.watchedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {movieStoryTab === "wish" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-2xl font-semibold">총 <span className="text-[#eb4d32]">{wishCount}</span>건</p>
            <span className="text-sm text-gray-600">영화 목록에서 찜하기로만 추가 가능합니다.</span>
          </div>
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            {wishLoading ? (
              <div className="py-20 text-center text-gray-500">불러오는 중...</div>
            ) : wishMovies.length === 0 ? (
              <div className="py-20 text-center text-gray-500">보고싶은 영화를 담아주세요.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {wishMovies.map((item) => (
                  <div key={item.movieId} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-base font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-500">movieId: {item.movieId}</p>
                    </div>
                    <button
                      className="rounded border border-gray-300 px-3 py-1 text-sm"
                      onClick={async () => {
                        try {
                          await removeMovieLike(item.movieId, memberId);
                          await loadWishMovies();
                        } catch (error: any) {
                          alert(error?.message ?? "삭제에 실패했습니다.");
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );

  const renderEvents = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 응모 내역</h1>
      <p className="mt-5 text-sm text-gray-600">· 개인정보 처리방침에 따라 당첨자 발표일로 부터 6개월간 당첨자 발표내역을 확인할 수 있습니다.</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-semibold">전체 (0건)</p>
        <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
          <span>검색어를 입력해 주세요.</span>
          <Search className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>번호</span>
          <span>분류</span>
          <span>이벤트명</span>
          <span>응모일</span>
          <span>당첨자발표</span>
        </div>
        <div className="py-8 text-center text-gray-500">조회된 내역이 없습니다.</div>
      </div>
    </section>
  );

  const renderInquiries = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 문의내역</h1>

      <div className="mt-5 grid grid-cols-1 border border-gray-300 md:grid-cols-3">
        {["1:1 문의내역", "단체관람/대관 문의내역", "분실물 문의내역"].map((tab, index) => (
          <button key={tab} className={`px-5 py-3 text-sm ${index === 0 ? "bg-[#000000] text-white" : "bg-white text-gray-600"}`}>
            {tab}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-600">· 고객센터를 통해 남기신 1:1 문의내역을 확인하실 수 있습니다.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold">전체 (0건)</p>
        <div className="flex items-center gap-2">
          <button className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]">1:1 문의하기</button>
          <select className="rounded border border-gray-300 px-3 py-2 text-sm"><option>전체</option></select>
          <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
            <span>검색어를 입력해 주세요.</span>
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-6 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>번호</span>
          <span>극장</span>
          <span>유형</span>
          <span>제목</span>
          <span>답변상태</span>
          <span>등록일</span>
        </div>
        <div className="py-8 text-center text-gray-500">목록이 없습니다.</div>
      </div>
    </section>
  );

  const renderPayments = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">중앙페이 결제수단 관리</h1>
      <div className="mt-6 rounded-sm border border-gray-200 bg-white p-6 text-gray-600">
        결제수단 관리 기능은 준비 중입니다.
      </div>
    </section>
  );

  const renderContent = () => {
    if (pageKey === "dashboard") return renderDashboard();
    if (pageKey === "reservations") return renderReservations();
    if (pageKey === "vouchers-movie" || pageKey === "vouchers-store") return renderVouchers();
    if (pageKey === "coupons") return renderCoupons();
    if (pageKey === "points") return renderPoints();
    if (pageKey === "point-password") return renderPointPassword();
    if (pageKey === "cards") return renderCards();
    if (pageKey === "profile") return renderProfile();
    if (pageKey === "profile-preferences") return renderProfilePreferences();
    if (pageKey === "movie-story") return renderMovieStory();
    if (pageKey === "events") return renderEvents();
    if (pageKey === "inquiries") return renderInquiries();
    return renderPayments();
  };

  return (
    <div className="min-h-screen bg-[#fdf4e3] text-[#000000]">
      <Header />

      <div className="border-y border-[#000000] bg-[#ffffff]">
        <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-2 px-4 text-sm text-gray-500">
          <Home className="h-4 w-4" />
          {crumbs.map((crumb, index) => (
            <div key={`${crumb}-${index}`} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className={index === crumbs.length - 1 ? "text-gray-700" : ""}>{crumb}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] gap-8 px-4 py-10">
        <aside className="w-[220px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white">
          <button
            type="button"
            className="w-full bg-[#000000] px-6 py-8 text-center text-xl font-semibold text-white"
            onClick={() => moveMenu("/my-page")}
          >
            나의 메가박스
          </button>

          {MENU_CONFIG.map((item) => {
            const active = item.key === "vouchers"
              ? pageKey === "vouchers-movie" || pageKey === "vouchers-store"
              : item.key === pageKey;
            return (
              <div key={item.key} className="border-t border-gray-200">
                <button
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-base ${active ? "font-semibold text-[#eb4d32]" : "text-gray-700"}`}
                  onClick={() => moveMenu(item.path)}
                >
                  <span>{item.label}</span>
                  {active ? <ChevronRight className="h-5 w-5" /> : null}
                </button>
                {item.children ? (
                  <div className="space-y-1 px-5 pb-3 text-sm text-gray-500">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        className={`block w-full text-left ${location.pathname === child.path ? "font-semibold text-[#eb4d32]" : "text-gray-500"}`}
                        onClick={() => moveMenu(child.path)}
                      >
                        · {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="border-t border-gray-200 bg-[#ffffff] px-4 py-3 text-base text-gray-700">회원정보</div>
          <div className="px-5 pb-4 pt-2 text-sm text-gray-500">
            <button
              className={`block w-full text-left ${pageKey === "profile" ? "font-semibold text-[#eb4d32]" : "text-gray-500"}`}
              onClick={() => moveMenu("/my-page/profile")}
            >
              · 개인정보 수정
            </button>
            <button
              className={`mt-1 block w-full text-left ${pageKey === "profile-preferences" ? "font-semibold text-[#eb4d32]" : "text-gray-500"}`}
              onClick={() => moveMenu("/my-page/profile/preferences")}
            >
              · 선호정보 수정
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {renderContent()}
        </main>
      </div>

      <Footer />

      {showPasswordChangeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#000000] bg-[#ffffff] p-5">
            <h3 className="text-lg font-semibold text-[#000000]">비밀번호 변경</h3>
            <div className="mt-4 space-y-3">
              <input
                type="password"
                className="h-11 w-full rounded border border-gray-300 px-3 text-sm"
                placeholder="현재 비밀번호"
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
              />
              <input
                type="password"
                className="h-11 w-full rounded border border-gray-300 px-3 text-sm"
                placeholder="새 비밀번호 (8자리 이상)"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
              />
              <input
                type="password"
                className="h-11 w-full rounded border border-gray-300 px-3 text-sm"
                placeholder="새 비밀번호 확인"
                value={newPasswordConfirmInput}
                onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded border border-gray-300 px-4 py-2 text-sm"
                onClick={() => {
                  if (passwordChanging) return;
                  setShowPasswordChangeModal(false);
                  setCurrentPasswordInput("");
                  setNewPasswordInput("");
                  setNewPasswordConfirmInput("");
                }}
              >
                취소
              </button>
              <button
                className="rounded bg-[#eb4d32] px-4 py-2 text-sm font-semibold text-[#ffffff] disabled:opacity-60"
                onClick={handlePasswordChange}
                disabled={passwordChanging}
              >
                {passwordChanging ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#000000] bg-[#ffffff] p-5">
            <h3 className="text-lg font-semibold text-[#000000]">환불 사유 입력</h3>
            <p className="mt-2 text-sm text-gray-600">
              취소 사유를 입력하면 해당 내용으로 환불 요청됩니다.
            </p>

            <textarea
              className="mt-4 h-28 w-full resize-none rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#eb4d32]"
              placeholder="예: 일정 변경으로 취소합니다."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
                disabled={isCancelling !== null}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelTargetId(null);
                  setCancelReason("");
                }}
              >
                닫기
              </button>
              <button
                className="rounded bg-[#eb4d32] px-4 py-2 text-sm font-semibold text-[#ffffff] disabled:opacity-60"
                disabled={cancelTargetId === null || isCancelling !== null}
                onClick={() => {
                  if (cancelTargetId === null) return;
                  handleCancel(cancelTargetId, cancelReason);
                }}
              >
                {isCancelling !== null ? "처리 중..." : "환불 확정"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPointPhoneModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">휴대폰 인증</h3>
              <button
                className="text-4xl leading-none text-[#ffffff]"
                onClick={closePointPhoneModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-base text-[#000000]">포인트 비밀번호 설정을 위해 휴대폰 인증을 진행해 주세요.</p>

              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                  <label className="text-right text-base font-semibold text-[#000000]">휴대폰 번호</label>
                  <input
                    value={pointPhoneNumber}
                    onChange={(e) => setPointPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    className="h-11 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]"
                    placeholder="01012345678"
                  />
                  <button
                    className="h-11 rounded bg-[#eb4d32] px-4 text-sm font-semibold text-[#ffffff]"
                    onClick={sendPointPhoneAuthCode}
                    disabled={pointAuthSending}
                  >
                    {pointAuthSending ? "발송 중..." : "인증번호 발송"}
                  </button>

                  <label className="text-right text-base font-semibold text-[#000000]">인증번호</label>
                  <input
                    value={pointAuthCodeInput}
                    onChange={(e) => setPointAuthCodeInput(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="h-11 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]"
                    placeholder="6자리 입력"
                  />
                  <button
                    className="h-11 rounded bg-[#eb4d32] px-4 text-sm font-semibold text-[#ffffff]"
                    onClick={verifyPointPhoneAuthCode}
                    disabled={pointAuthVerifying}
                  >
                    {pointAuthVerifying ? "확인 중..." : "인증 확인"}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="rounded border border-[#eb4d32] px-8 py-2 text-base font-semibold text-[#eb4d32]"
                  onClick={closePointPhoneModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showVoucherRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">
                {pageKey === "vouchers-movie" ? "영화관람권 등록" : "스토어 교환권 등록"}
              </h3>
              <button
                className="text-4xl leading-none text-[#ffffff]"
                onClick={closeVoucherRegisterModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 bg-[#ffffff] p-6">
              <p className="text-base text-[#000000]">
                {pageKey === "vouchers-movie"
                  ? "보유하신 영화관람권 12자리 또는 16자리를 입력해주세요."
                  : "보유하신 스토어 교환권 16자리를 입력해주세요."}
              </p>

              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[120px] text-right text-base font-semibold text-[#000000]">
                    {pageKey === "vouchers-movie" ? "관람권번호" : "스토어 교환권"}
                  </label>
                  <input
                    value={voucherRegisterCode}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setVoucherRegisterCode(digits);
                      if (voucherRegisterError) setVoucherRegisterError("");
                    }}
                    maxLength={16}
                    className="h-12 flex-1 border border-[#000000] bg-[#ffffff] px-3 text-base text-[#000000] outline-none"
                    placeholder={pageKey === "vouchers-movie" ? "12자리 또는 16자리 입력" : "숫자만 입력해 주세요"}
                  />
                  <button
                    className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff]"
                    onClick={handleVoucherRegister}
                    disabled={voucherRegistering}
                  >
                    {voucherRegistering ? "등록 중..." : "등록"}
                  </button>
                </div>
                {voucherRegisterError ? (
                  <p className="mt-2 text-sm text-[#eb4d32]">{voucherRegisterError}</p>
                ) : null}
              </div>

              {pageKey === "vouchers-movie" ? (
                <>
                  <div className="rounded-sm border border-[#000000] bg-[#fdf4e3] p-5">
                    <p className="text-sm leading-7 text-[#000000]">
                      · 관람권 뒷면의 번호(12자리 또는 16자리)를 입력해 주세요.
                    </p>
                    <p className="text-sm leading-7 text-[#000000]">
                      · 번호에 스크래치 영역이 있는 경우, 스크래치 후 숫자를 입력해 주세요.
                    </p>
                    <div className="mt-4 rounded-sm border border-[#000000] bg-[#ffffff] p-3 text-sm text-[#000000]">
                      예시 번호: 1234 5678 0000 0000
                    </div>
                  </div>
                  <div className="space-y-1 text-sm leading-7 text-[#000000]">
                    <p>· 보유하신 관람권의 번호를 정확히 입력해 주세요.</p>
                    <p>· 스크래치 개봉 후에는 현장(극장) 사용이 제한될 수 있습니다.</p>
                    <p>· 등록 완료 후 사용 가능한 상태로 반영됩니다.</p>
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-[#000000] bg-[#fdf4e3] p-5">
                  <p className="mb-3 text-2xl font-semibold text-[#000000]">이용안내</p>
                  <p className="text-sm leading-7 text-[#000000]">
                    · 메가박스 스토어에서 구매 또는 선물받은 스토어교환권을 등록하실 수 있습니다.
                  </p>
                  <p className="text-sm leading-7 text-[#000000]">
                    · 선물받은 교환권은 등록 후 결제가 취소될 경우 자동 회수처리 되어 사용하실 수 없습니다.
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]"
                  onClick={closeVoucherRegisterModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCouponRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">할인쿠폰 등록</h3>
              <button
                className="text-4xl leading-none text-[#ffffff]"
                onClick={closeCouponRegisterModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <p className="text-base text-[#000000]">보유하신 쿠폰번호를 입력해 주세요.</p>

              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[140px] text-right text-base font-semibold text-[#000000]">
                    할인쿠폰 번호
                  </label>
                  <input
                    value={couponRegisterCode}
                    onChange={(e) => {
                      setCouponRegisterCode(e.target.value.toUpperCase());
                      if (couponRegisterError) setCouponRegisterError("");
                    }}
                    className="h-12 flex-1 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none"
                    placeholder="숫자만 입력해 주세요"
                  />
                  <button
                    className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff] disabled:opacity-60"
                    onClick={handleCouponRegister}
                    disabled={couponRegistering}
                  >
                    {couponRegistering ? "등록 중..." : "등록"}
                  </button>
                </div>
                {couponRegisterError ? (
                  <p className="mt-2 text-sm text-[#eb4d32]">{couponRegisterError}</p>
                ) : null}
              </div>

              <div className="rounded-sm border border-gray-200 bg-[#ffffff] p-5">
                <p className="mb-3 text-2xl font-semibold text-[#000000]">이용안내</p>
                <p className="text-sm leading-7 text-[#000000]">· 메가박스에서 발행된 매표, 매점, 포인트 쿠폰을 등록하실 수 있습니다.</p>
                <p className="text-sm leading-7 text-[#000000]">· 등록된 쿠폰은 삭제가 불가능합니다.</p>
                <p className="mt-3 text-sm leading-7 text-[#000000]">· [포인트 적립 쿠폰] 쿠폰 등록 시 바로 사용 가능한 포인트로 적립됩니다.</p>
              </div>

              <div className="flex justify-center">
                <button
                  className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]"
                  onClick={closeCouponRegisterModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showWatchedModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">본 영화 등록</h3>
              <button
                className="text-4xl leading-none text-[#ffffff]"
                onClick={() => setShowWatchedModal(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <p className="text-base text-[#000000]">
                발견하신 티켓 하단의 거래번호 또는 예매번호를 입력해주세요.
              </p>

              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[140px] text-right text-base font-semibold text-[#000000]">
                    거래번호 또는 예매번호
                  </label>
                  <input
                    value={watchedTicketCodeInput}
                    onChange={(e) => setWatchedTicketCodeInput(e.target.value.replace(/\D/g, ""))}
                    maxLength={20}
                    className="h-12 flex-1 border border-gray-300 bg-[#ffffff] px-3 text-base text-[#000000] outline-none"
                    placeholder="숫자만 입력해 주세요"
                  />
                  <button
                    className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff]"
                    onClick={() => {
                      const code = watchedTicketCodeInput.trim();
                      if (!code) {
                        alert("거래번호 또는 예매번호를 입력해 주세요.");
                        return;
                      }

                      const matched = reservations.find(
                        (r) => String(r.reservationId) === code
                      );
                      const movieTitle = matched ? matched.movieTitle : `본 영화 등록 (${code})`;
                      const watchedAt = matched ? matched.startTime : new Date().toISOString();

                      setWatchedMovies((prev) => [
                        ...prev,
                        {
                          id: `m-${Date.now()}`,
                          movieTitle,
                          watchedAt,
                        },
                      ]);
                      setShowWatchedModal(false);
                      setWatchedTicketCodeInput("");
                    }}
                  >
                    등록
                  </button>
                </div>
              </div>

              <div className="rounded-sm border border-gray-200 bg-[#ffffff] p-5">
                <p className="mb-3 text-2xl font-semibold text-[#000000]">이용안내</p>
                <p className="text-sm leading-7 text-[#000000]">
                  · 극장에서 예매하신 내역을 본 영화(관람이력)로 등록하실 수 있습니다.
                </p>
                <p className="text-sm leading-7 text-[#000000]">
                  · 예매처를 통해 예매하신 고객님은 극장에서 발권하신 티켓 하단의 온라인 예매번호를 입력해 주세요.
                </p>
                <p className="text-sm leading-7 text-[#000000]">
                  · 본 영화 등록은 관람인원만큼 가능하며, 동일 계정 중복등록은 불가합니다.
                </p>
                <p className="text-sm leading-7 text-[#000000]">
                  · 상영시간 종료 이후 등록 가능합니다.
                </p>
                <p className="text-sm leading-7 text-[#000000]">
                  · 본 영화로 수동 등록한 내역은 이벤트 참여 및 포인트 추후 적립이 불가합니다.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]"
                  onClick={() => setShowWatchedModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showReviewModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-lg rounded-sm border border-[#000000] bg-[#ffffff] p-6">
            <h3 className="text-2xl font-semibold">관람평 작성</h3>
            <div className="mt-4 space-y-3">
              <input
                value={reviewMovieTitleInput}
                onChange={(e) => setReviewMovieTitleInput(e.target.value)}
                className="h-11 w-full border border-gray-300 px-3"
                placeholder="영화 제목"
              />
              <textarea
                value={reviewContentInput}
                onChange={(e) => setReviewContentInput(e.target.value)}
                className="h-24 w-full resize-none border border-gray-300 px-3 py-2"
                placeholder="관람평을 입력해 주세요."
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border border-gray-300 px-4 py-2" onClick={() => setShowReviewModal(false)}>취소</button>
              <button
                className="rounded bg-[#eb4d32] px-4 py-2 text-[#ffffff]"
                onClick={() => {
                  if (!reviewMovieTitleInput.trim() || !reviewContentInput.trim()) {
                    alert("영화 제목과 관람평을 입력해 주세요.");
                    return;
                  }
                  setReviews((prev) => [
                    {
                      id: `rv-${Date.now()}`,
                      movieTitle: reviewMovieTitleInput.trim(),
                      content: reviewContentInput.trim(),
                      createdAt: new Date().toISOString(),
                    },
                    ...prev,
                  ]);
                  setShowReviewModal(false);
                  setReviewMovieTitleInput("");
                  setReviewContentInput("");
                }}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      ) : null}


      {showCardRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">멤버십카드 등록</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeCardRegisterModal} aria-label="닫기">×</button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-3">
                  <label className="text-right text-2xl font-semibold text-[#000000]">카드번호</label>
                  <input
                    className="h-12 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]"
                    value={cardNumberInput}
                    onChange={(e) => {
                      setCardNumberInput(e.target.value.replace(/\D/g, ""));
                      if (cardRegisterError) setCardRegisterError("");
                    }}
                    maxLength={19}
                    placeholder="숫자만 입력"
                  />

                  <label className="text-right text-2xl font-semibold text-[#000000]">CVC 번호</label>
                  <input
                    className="h-12 w-40 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]"
                    value={cardCvcInput}
                    onChange={(e) => {
                      setCardCvcInput(e.target.value.replace(/\D/g, ""));
                      if (cardRegisterError) setCardRegisterError("");
                    }}
                    maxLength={4}
                    placeholder="3~4자리"
                  />
                </div>
                {cardRegisterError ? (
                  <p className="mt-3 text-sm text-[#eb4d32]">{cardRegisterError}</p>
                ) : null}
              </div>

              <div className="rounded-sm border border-gray-200 bg-[#ffffff] p-4 text-base text-[#000000]">
                <p className="font-semibold">유의사항</p>
                <p>· 앞 혹은 뒷면의 카드 번호와 CVC코드가 있는 카드로만 온라인 등록이 가능합니다.</p>
                <p>· 한 번 삭제하신 카드번호는 다시 등록하실 수 없습니다.</p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  className="rounded border border-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#eb4d32]"
                  onClick={closeCardRegisterModal}
                  disabled={cardRegistering}
                >
                  취소
                </button>
                <button
                  className="rounded bg-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#ffffff] disabled:opacity-60"
                  onClick={handleMembershipCardRegister}
                  disabled={cardRegistering}
                >
                  {cardRegistering ? "등록 중" : "등록"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCoupon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">쿠폰정보</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeCouponInfoModal} aria-label="닫기">×</button>
            </div>

            <div className="space-y-5 p-6">
              <h4 className="text-center text-5xl font-semibold text-[#000000]">{selectedCoupon.couponName}</h4>
              <div className="rounded-sm bg-[#fdf4e3] py-5 text-center text-4xl font-semibold text-[#eb4d32]">
                {formatCouponCodeForModal(selectedCoupon.couponCode)}
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-base text-[#000000]">
                <p className="font-semibold">· 구분</p><p>{selectedCoupon.couponKind || "기타"}</p>
                <p className="font-semibold">· 사용상태</p><p>{mapCouponStatusLabel(selectedCoupon.status)}</p>
                <p className="font-semibold">· 발급일</p><p>{selectedCoupon.issuedAt ? formatDateTime(selectedCoupon.issuedAt) : "-"}</p>
                <p className="font-semibold">· 유효기간</p><p>{selectedCoupon.expiresAt ? formatDateTime(selectedCoupon.expiresAt) : "-"}</p>
                <p className="font-semibold">· 할인정보</p>
                <p>
                  {selectedCoupon.discountType === "RATE"
                    ? `${selectedCoupon.discountValue}% 할인`
                    : `${selectedCoupon.discountValue.toLocaleString()}원 할인`}
                </p>
              </div>

              <div className="rounded-sm border border-gray-200 p-4 text-sm leading-7 text-[#000000]">
                <p className="mb-2 font-semibold">유의사항</p>
                <p>· 쿠폰은 중복 사용이 제한될 수 있습니다.</p>
                <p>· 결제 전 쿠폰 적용 가능 여부를 확인해 주세요.</p>
                <p>· 유효기간 만료 시 자동으로 사용 불가 처리됩니다.</p>
              </div>

              <div className="flex justify-center">
                <button
                  className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]"
                  onClick={closeCouponInfoModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
