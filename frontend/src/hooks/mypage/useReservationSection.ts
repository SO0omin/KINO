import { useEffect, useMemo, useState } from "react";
import { cancelReservation, type MyReservationItem } from "../../api/myPageApi";
import { formatYmd, shiftDays, splitReservations, toMonthKey, toPurchaseRows } from "../../mappers/myPageMapper";

type UseReservationSectionOptions = {
  memberId: number;
  guestId: number;
  pageKey: string;
  locationSearch: string;
  reservations: MyReservationItem[];
  load: () => Promise<any>;
};

export function useReservationSection({
  memberId,
  guestId,
  pageKey,
  locationSearch,
  reservations,
  load,
}: UseReservationSectionOptions) {
  const today = useMemo(() => new Date(), []);

  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reservationTab, setReservationTab] = useState<"reservation" | "purchase">("reservation");
  const [historyType, setHistoryType] = useState<"current" | "past">("current");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [appliedHistoryType, setAppliedHistoryType] = useState<"current" | "past">("current");
  const [appliedMonth, setAppliedMonth] = useState<string>("");
  const [purchaseSelectType, setPurchaseSelectType] = useState<"all" | "movie">("all");
  const [purchaseStatusType, setPurchaseStatusType] = useState<"all" | "purchase" | "cancel">("all");
  const [purchaseRange, setPurchaseRange] = useState<"week" | "month1" | "month3" | "month6">("month1");
  const [purchaseFrom, setPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
  const [purchaseTo, setPurchaseTo] = useState(formatYmd(today.toISOString()));
  const [appliedPurchaseSelectType, setAppliedPurchaseSelectType] = useState<"all" | "movie">("all");
  const [appliedPurchaseStatusType, setAppliedPurchaseStatusType] = useState<"all" | "purchase" | "cancel">("all");
  const [appliedPurchaseFrom, setAppliedPurchaseFrom] = useState(formatYmd(shiftDays(today, -30).toISOString()));
  const [appliedPurchaseTo, setAppliedPurchaseTo] = useState(formatYmd(today.toISOString()));

  const { active: activeReservations, cancelled: cancelledReservations } = splitReservations(reservations);

  useEffect(() => {
    if (pageKey !== "reservations") return;
    const tab = new URLSearchParams(locationSearch).get("tab");
    setReservationTab(tab === "purchase" ? "purchase" : "reservation");
  }, [pageKey, locationSearch]);

  const openCancelModal = (reservationId: number) => {
    setCancelTargetId(reservationId);
    setCancelReason("");
    setShowCancelModal(true);
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
      const historyMatched = appliedHistoryType === "current" ? start >= now : start < now;
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

  return {
    isCancelling,
    showCancelModal,
    cancelTargetId,
    cancelReason,
    setCancelReason,
    setCancelTargetId,
    setShowCancelModal,
    reservationTab,
    setReservationTab,
    historyType,
    setHistoryType,
    selectedMonth,
    setSelectedMonth,
    appliedHistoryType,
    setAppliedHistoryType,
    appliedMonth,
    setAppliedMonth,
    purchaseSelectType,
    setPurchaseSelectType,
    purchaseStatusType,
    setPurchaseStatusType,
    purchaseRange,
    purchaseFrom,
    setPurchaseFrom,
    purchaseTo,
    setPurchaseTo,
    setAppliedPurchaseSelectType,
    setAppliedPurchaseStatusType,
    setAppliedPurchaseFrom,
    setAppliedPurchaseTo,
    activeReservations,
    cancelledReservations,
    monthOptions,
    visibleReservations,
    purchaseRows,
    recentPaidPurchases,
    openCancelModal,
    handleCancel,
    applyPurchaseRange,
  };
}
