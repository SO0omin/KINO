import type {
  MyCouponItem,
  MyReservationItem,
  VoucherStatus,
} from "../api/myPageApi";

export type UiVoucherStatus = "available" | "used" | "expired";
export type CouponStatusFilter = "available" | "used" | "expired";
export type CouponTabFilter = "megabox" | "partner";
export type CouponKindFilter = "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타";
export type CouponSourceFilter = "전체" | "사용가능" | "사용완료" | "기간만료";

export type PurchaseSelectType = "all" | "movie";
export type PurchaseStatusType = "all" | "purchase" | "cancel";

export type PurchaseRow = {
  id: number;
  reservationNumber: string;
  paymentDate: Date;
  category: string;
  productName: string;
  amount: number;
  statusLabel: string;
  isCancelled: boolean;
};

export function formatDateTime(value: string) {
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

export function formatMoney(value: number) {
  return `${value.toLocaleString()}원`;
}

export function formatYmd(value: string) {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateSimple(value: string) {
  const date = new Date(value?.includes(" ") ? value.replace(" ", "T") : value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function formatDateDot(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function shiftDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function toMonthKey(value: string) {
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}년 ${Number(month)}월`;
}

export function splitReservations(items: MyReservationItem[]) {
  const active = items.filter((item) => item.reservationStatus !== "CANCELED");
  const cancelled = items.filter((item) => item.reservationStatus === "CANCELED");
  return { active, cancelled };
}

export function mapVoucherStatusToApi(status: UiVoucherStatus): VoucherStatus {
  if (status === "available") return "AVAILABLE";
  if (status === "used") return "USED";
  return "EXPIRED";
}

export function mapVoucherStatusLabel(status: string, isMovieVoucher: boolean): string {
  if (status === "USED") return isMovieVoucher ? "사용완료" : "교환완료";
  if (status === "EXPIRED") return "기간만료";
  return "사용가능";
}

export function mapCouponStatusLabel(status: string): string {
  if (status === "USED") return "사용완료";
  if (status === "EXPIRED") return "기간만료";
  return "사용가능";
}

export function normalizeCouponStatus(status: string): CouponStatusFilter {
  if (status === "USED") return "used";
  if (status === "EXPIRED") return "expired";
  return "available";
}

export function filterCoupons(
  items: MyCouponItem[],
  filters: {
    tab: CouponTabFilter;
    kind: CouponKindFilter;
    source: CouponSourceFilter;
    status: CouponStatusFilter;
    hiddenOnly: boolean;
  }
): MyCouponItem[] {
  return items.filter((item) => {
    const byTab =
      filters.tab === "megabox"
        ? item.sourceType !== "PARTNER"
        : item.sourceType === "PARTNER";

    const effectiveKind = filters.kind;
    const byKind = effectiveKind === "전체" ? true : item.couponKind === effectiveKind;

    const sourceStatus =
      filters.source === "사용가능"
        ? "available"
        : filters.source === "사용완료"
          ? "used"
          : filters.source === "기간만료"
            ? "expired"
            : null;
    const byStatus =
      sourceStatus === null
        ? true
        : normalizeCouponStatus(item.status) === sourceStatus;

    const bySource = true;

    const byHidden = filters.hiddenOnly
      ? normalizeCouponStatus(item.status) !== "available"
      : true;

    return byTab && byKind && byStatus && bySource && byHidden;
  });
}

export function toPurchaseRows(
  reservations: MyReservationItem[],
  filters: {
    selectType: PurchaseSelectType;
    statusType: PurchaseStatusType;
    from: string;
    to: string;
  }
): PurchaseRow[] {
  const fromTime = new Date(`${filters.from}T00:00:00`).getTime();
  const toTime = new Date(`${filters.to}T23:59:59`).getTime();

  return reservations
    .map((item) => {
      const paymentDate = new Date(item.paidAt ?? item.startTime);
      const isCancelled =
        item.paymentStatus === "CANCELLED" || item.reservationStatus === "CANCELED";
      return {
        id: item.reservationId,
        reservationNumber: item.reservationNumber,
        paymentDate,
        category: "영화예매",
        productName: item.movieTitle,
        amount: item.finalAmount,
        statusLabel: isCancelled ? "취소" : "결제완료",
        isCancelled,
      };
    })
    .filter((row) => {
      const dateMatched =
        row.paymentDate.getTime() >= fromTime && row.paymentDate.getTime() <= toTime;
      const selectMatched =
        filters.selectType === "all" ? true : row.category === "영화예매";
      const statusMatched =
        filters.statusType === "all"
          ? true
          : filters.statusType === "purchase"
            ? !row.isCancelled
            : row.isCancelled;
      return dateMatched && selectMatched && statusMatched;
    })
    .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
}
