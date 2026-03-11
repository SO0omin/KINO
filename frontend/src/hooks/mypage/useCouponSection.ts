import { useMemo, useState } from "react";
import type {
  DownloadSelectedCouponsResponse,
  DownloadableCouponItem,
  MyCouponItem,
} from "../../api/myPageApi";
import {
  downloadSelectedCoupons,
  getDownloadableCoupons,
  redeemCoupon,
} from "../../api/myPageApi";
import {
  filterCoupons,
  type CouponKindFilter,
  type CouponSourceFilter,
  type CouponStatusFilter,
} from "../../mappers/myPageMapper";
import { cinemaAlert } from "../../utils/alert";

type UseCouponSectionOptions = {
  memberId: number;
  couponItems: MyCouponItem[];
  loadCoupons: () => Promise<any>;
  load: () => Promise<any>;
};

export function useCouponSection({
  memberId,
  couponItems,
  loadCoupons,
  load,
}: UseCouponSectionOptions) {
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

  const filteredCoupons = useMemo(() => {
    return filterCoupons(couponItems, {
      tab: couponTab,
      kind: appliedCouponKindFilter,
      source: appliedCouponSourceFilter,
      status: appliedCouponStatusFilter,
      hiddenOnly: appliedCouponHiddenOnly,
    });
  }, [
    appliedCouponHiddenOnly,
    appliedCouponKindFilter,
    appliedCouponSourceFilter,
    appliedCouponStatusFilter,
    couponItems,
    couponTab,
  ]);

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
      cinemaAlert("할인쿠폰 등록이 완료되었습니다.","알림");
    } catch (error: any) {
      setCouponRegisterError(error?.message ?? "쿠폰 등록에 실패했습니다.");
    } finally {
      setCouponRegistering(false);
    }
  };

  const fetchDownloadableCouponsForCurrentTab = async (): Promise<DownloadableCouponItem[]> => {
    if (memberId <= 0) {
      throw new Error("회원 로그인 후 이용해 주세요.");
    }
    const sourceType = couponTab === "partner" ? "PARTNER" : "KINO";
    const result = await getDownloadableCoupons(memberId, sourceType);
    return result.coupons ?? [];
  };

  const downloadSelectedCouponsForCurrentTab = async (
    couponIds: number[]
  ): Promise<DownloadSelectedCouponsResponse> => {
    if (memberId <= 0) {
      throw new Error("회원 로그인 후 이용해 주세요.");
    }
    const sourceType = couponTab === "partner" ? "PARTNER" : "KINO";
    const result = await downloadSelectedCoupons(memberId, sourceType, couponIds);
    await Promise.all([loadCoupons(), load()]);
    return result;
  };

  const formatCouponCodeForModal = (code: string) => {
    const normalized = (code ?? "").trim();
    return normalized || "-";
  };

  return {
    couponTab,
    setCouponTab,
    couponKindFilter,
    setCouponKindFilter,
    couponSourceFilter,
    setCouponSourceFilter,
    couponStatusFilter,
    setCouponStatusFilter,
    couponHiddenOnly,
    setCouponHiddenOnly,
    filteredCoupons,
    applyCouponFilters,
    showCouponRegisterModal,
    couponRegisterCode,
    setCouponRegisterCode,
    couponRegistering,
    couponRegisterError,
    setCouponRegisterError,
    selectedCoupon,
    openCouponRegisterModal,
    closeCouponRegisterModal,
    openCouponInfoModal,
    closeCouponInfoModal,
    handleCouponRegister,
    fetchDownloadableCouponsForCurrentTab,
    downloadSelectedCouponsForCurrentTab,
    formatCouponCodeForModal,
  };
}
