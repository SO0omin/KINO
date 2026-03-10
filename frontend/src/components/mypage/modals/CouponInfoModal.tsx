import type { MyCouponItem } from "../../../api/myPageApi";
import { ModalFrame, SecondaryButton } from "./modalPrimitives";

type CouponInfoModalProps = {
  selectedCoupon: MyCouponItem | null;
  closeCouponInfoModal: () => void;
  formatCouponCodeForModal: (code: string) => string;
  mapCouponStatusLabel: (status: string) => string;
  formatDateTime: (value: string) => string;
};

export function CouponInfoModal({
  selectedCoupon,
  closeCouponInfoModal,
  formatCouponCodeForModal,
  mapCouponStatusLabel,
  formatDateTime,
}: CouponInfoModalProps) {
  if (!selectedCoupon) return null;

  return (
    <ModalFrame
      title="쿠폰 정보"
      subtitle="선택한 쿠폰의 상세 정보입니다."
      onClose={closeCouponInfoModal}
      footer={
        <div className="flex justify-end">
          <SecondaryButton onClick={closeCouponInfoModal}>닫기</SecondaryButton>
        </div>
      }
    >
      <div className="rounded-sm border border-black/5 bg-white px-6 py-7 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">Coupon Name</p>
        <h4 className="mt-3 text-4xl font-semibold tracking-tight text-[#1A1A1A]">{selectedCoupon.couponName}</h4>
      </div>
      <div className="rounded-sm border border-[#B91C1C]/15 bg-[#B91C1C]/5 py-5 text-center text-3xl font-semibold tracking-[0.08em] text-[#B91C1C]">
        {formatCouponCodeForModal(selectedCoupon.couponCode)}
      </div>
      <div className="grid gap-x-8 gap-y-4 rounded-sm border border-black/5 bg-white p-5 text-base text-[#1A1A1A] md:grid-cols-[140px_1fr]">
        <p className="font-semibold text-black/45">구분</p><p>{selectedCoupon.couponKind || "기타"}</p>
        <p className="font-semibold text-black/45">사용상태</p><p>{mapCouponStatusLabel(selectedCoupon.status)}</p>
        <p className="font-semibold text-black/45">발급일</p><p>{selectedCoupon.issuedAt ? formatDateTime(selectedCoupon.issuedAt) : "-"}</p>
        <p className="font-semibold text-black/45">유효기간</p><p>{selectedCoupon.expiresAt ? formatDateTime(selectedCoupon.expiresAt) : "-"}</p>
        <p className="font-semibold text-black/45">할인정보</p>
        <p>
          {selectedCoupon.discountType === "RATE"
            ? `${selectedCoupon.discountValue}% 할인`
            : `${selectedCoupon.discountValue.toLocaleString()}원 할인`}
        </p>
      </div>
    </ModalFrame>
  );
}
