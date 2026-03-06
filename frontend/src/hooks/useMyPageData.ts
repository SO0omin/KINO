import { useCallback, useEffect, useState } from "react";
import {
  getMemberProfile,
  getMyCoupons,
  getMyMembershipCards,
  getMyPageSummary,
  getMyPointHistories,
  getMyReservations,
  getMyVouchers,
  getMyWishMovies,
  type MemberProfile,
  type MyCouponItem,
  type MyMembershipCardItem,
  type MyPageSummary,
  type MyPointHistoryItem,
  type MyReservationItem,
  type MyVoucherItem,
  type MyWishMovieItem,
} from "../api/myPageApi";
import { mapVoucherStatusToApi, type UiVoucherStatus } from "../mappers/myPageMapper";
import type { PageKey } from "../types/mypage";

type UseMyPageDataOptions = {
  memberId: number;
  guestId?: number | null;
  pageKey: PageKey;
  voucherStatus: UiVoucherStatus;
  appliedPointFrom: string;
  appliedPointTo: string;
  onError?: (message: string) => void;
};

export function useMyPageData({
  memberId,
  guestId,
  pageKey,
  voucherStatus,
  appliedPointFrom,
  appliedPointTo,
  onError,
}: UseMyPageDataOptions) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);

  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [wishMovies, setWishMovies] = useState<MyWishMovieItem[]>([]);
  const [wishLoading, setWishLoading] = useState(false);

  const [voucherItems, setVoucherItems] = useState<MyVoucherItem[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [couponItems, setCouponItems] = useState<MyCouponItem[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const [membershipCards, setMembershipCards] = useState<MyMembershipCardItem[]>([]);
  const [membershipCardLoading, setMembershipCardLoading] = useState(false);

  const [pointRows, setPointRows] = useState<MyPointHistoryItem[]>([]);
  const [pointLoading, setPointLoading] = useState(false);

  const notifyError = useCallback(
    (message: string) => {
      if (onError) {
        onError(message);
        return;
      }
      alert(message);
    },
    [onError]
  );

  const load = useCallback(async () => {
    const hasMember = memberId > 0;
    const hasGuest = !!guestId && guestId > 0;
    if (!hasMember && !hasGuest) {
      setSummary(null);
      setReservations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const reservationPromise = getMyReservations({
        memberId: hasMember ? memberId : undefined,
        guestId: hasGuest ? guestId : undefined,
      });
      const summaryPromise = hasMember ? getMyPageSummary(memberId) : Promise.resolve(null);

      const [summaryData, reservationData] = await Promise.all([
        summaryPromise,
        reservationPromise,
      ]);
      setSummary(summaryData);
      setReservations(reservationData);
    } catch (error: any) {
      notifyError(error?.message ?? "마이페이지 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [guestId, memberId, notifyError]);

  const loadMemberProfile = useCallback(async () => {
    if (memberId <= 0) {
      setMemberProfile(null);
      return null;
    }
    setProfileLoading(true);
    try {
      const profile = await getMemberProfile(memberId);
      setMemberProfile(profile);
      return profile;
    } catch (error: any) {
      notifyError(error?.message ?? "회원 정보를 불러오지 못했습니다.");
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [memberId, notifyError]);

  const loadWishMovies = useCallback(async () => {
    if (memberId <= 0) {
      setWishMovies([]);
      return [];
    }
    setWishLoading(true);
    try {
      const rows = await getMyWishMovies(memberId);
      setWishMovies(rows);
      return rows;
    } catch (error: any) {
      notifyError(error?.message ?? "보고싶어 목록을 불러오지 못했습니다.");
      setWishMovies([]);
      return [];
    } finally {
      setWishLoading(false);
    }
  }, [memberId, notifyError]);

  const loadVouchers = useCallback(async () => {
    const isVoucherPage = pageKey === "vouchers-movie";
    if (!isVoucherPage) return [];
    if (memberId <= 0) {
      setVoucherItems([]);
      return [];
    }

    setVoucherLoading(true);
    try {
      const rows = await getMyVouchers(
        memberId,
        "MOVIE",
        mapVoucherStatusToApi(voucherStatus)
      );
      setVoucherItems(rows);
      return rows;
    } catch (error: any) {
      notifyError(error?.message ?? "관람권/교환권 정보를 불러오지 못했습니다.");
      setVoucherItems([]);
      return [];
    } finally {
      setVoucherLoading(false);
    }
  }, [memberId, notifyError, pageKey, voucherStatus]);

  const loadCoupons = useCallback(async () => {
    if (pageKey !== "coupons") return [];
    if (memberId <= 0) {
      setCouponItems([]);
      return [];
    }

    setCouponLoading(true);
    try {
      const rows = await getMyCoupons(memberId);
      setCouponItems(rows);
      return rows;
    } catch (error: any) {
      notifyError(error?.message ?? "쿠폰 목록을 불러오지 못했습니다.");
      setCouponItems([]);
      return [];
    } finally {
      setCouponLoading(false);
    }
  }, [memberId, notifyError, pageKey]);

  const loadMembershipCards = useCallback(async () => {
    if (pageKey !== "cards") return [];
    if (memberId <= 0) {
      setMembershipCards([]);
      return [];
    }

    setMembershipCardLoading(true);
    try {
      const rows = await getMyMembershipCards(memberId);
      setMembershipCards(rows);
      return rows;
    } catch (error: any) {
      notifyError(error?.message ?? "멤버십 카드 목록을 불러오지 못했습니다.");
      setMembershipCards([]);
      return [];
    } finally {
      setMembershipCardLoading(false);
    }
  }, [memberId, notifyError, pageKey]);

  const loadPointHistories = useCallback(async () => {
    if (pageKey !== "points") return [];
    if (memberId <= 0) {
      setPointRows([]);
      return [];
    }

    setPointLoading(true);
    try {
      const rows = await getMyPointHistories(memberId, appliedPointFrom, appliedPointTo);
      setPointRows(rows);
      return rows;
    } catch (error: any) {
      notifyError(error?.message ?? "포인트 이용내역을 불러오지 못했습니다.");
      setPointRows([]);
      return [];
    } finally {
      setPointLoading(false);
    }
  }, [appliedPointFrom, appliedPointTo, memberId, notifyError, pageKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (pageKey !== "profile") return;
    loadMemberProfile();
  }, [pageKey, loadMemberProfile]);

  useEffect(() => {
    if (pageKey !== "movie-story") return;
    loadWishMovies();
  }, [pageKey, loadWishMovies]);

  useEffect(() => {
    if (pageKey !== "vouchers-movie") return;
    loadVouchers();
  }, [pageKey, loadVouchers]);

  useEffect(() => {
    if (pageKey !== "coupons") return;
    loadCoupons();
  }, [pageKey, loadCoupons]);

  useEffect(() => {
    if (pageKey !== "cards") return;
    loadMembershipCards();
  }, [pageKey, loadMembershipCards]);

  useEffect(() => {
    if (pageKey !== "points") return;
    loadPointHistories();
  }, [pageKey, loadPointHistories]);

  return {
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
    loadPointHistories,
  };
}
