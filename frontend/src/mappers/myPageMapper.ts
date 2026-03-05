import type {
  MyCouponItem,
  MyReservationItem,
  VoucherStatus,
} from "../api/myPageApi";

export type UiVoucherStatus = "available" | "used" | "expired";
export type CouponStatusFilter = "available" | "used" | "expired";
export type CouponTabFilter = "megabox" | "partner";
export type CouponKindFilter = "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타";
export type CouponSourceFilter = "전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스";

export type PurchaseSelectType = "all" | "movie";
export type PurchaseStatusType = "all" | "purchase" | "cancel";

export type PurchaseRow = {
  id: number;
  paymentDate: Date;
  category: string;
  productName: string;
  amount: number;
  statusLabel: string;
  isCancelled: boolean;
};

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

    const byKind = filters.kind === "전체" ? true : item.couponKind === filters.kind;

    const byStatus = normalizeCouponStatus(item.status) === filters.status;

    const bySource =
      filters.source === "전체"
        ? true
        : filters.source === "할인쿠폰"
          ? item.discountType === "FIXED" || item.discountType === "RATE"
          : filters.source === "VIP쿠폰"
            ? item.couponName.includes("VIP")
            : item.couponName.includes("패스");

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
      const paymentDate = new Date(item.startTime);
      const isCancelled =
        item.paymentStatus === "CANCELLED" || item.reservationStatus === "CANCELED";
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
