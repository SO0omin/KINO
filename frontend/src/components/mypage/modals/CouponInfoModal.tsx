import React from 'react';
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
      category="Coupon Ledger"
      title="쿠폰 정보"
      subtitle="선택한 쿠폰의 상세 정보입니다."
      onClose={closeCouponInfoModal}
      footer={
        <SecondaryButton onClick={closeCouponInfoModal}>닫기</SecondaryButton>
      }
    >
      <div className="space-y-8">
        {/* 1. 쿠폰 이름 영역 (강조) */}
        <div className="rounded-sm border border-black/5 bg-[#FDFDFD] px-8 py-10 text-center shadow-inner">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-black/20 mb-4">Verified Benefit</p>
          <h4 className="text-3xl font-display uppercase tracking-tighter text-[#1A1A1A] leading-tight">
            {selectedCoupon.couponName}
          </h4>
        </div>
        
        {/* 2. 쿠폰 코드 영역 (레드 포인트) */}
        <div className="rounded-sm border border-[#B91C1C]/10 bg-[#B91C1C]/5 py-8 text-center text-2xl font-display uppercase tracking-widest text-[#B91C1C] shadow-sm">
          {formatCouponCodeForModal(selectedCoupon.couponCode)}
        </div>

        {/* 3. 상세 정보 그리드 */}
        <div className="grid gap-x-10 gap-y-6 rounded-sm border border-black/5 bg-white p-10 text-sm text-[#1A1A1A] md:grid-cols-[160px_1fr] shadow-sm">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/30">구분 (Category)</p>
          <p className="font-mono font-bold uppercase tracking-widest text-[10px]">{selectedCoupon.couponKind || "기타"}</p>
          
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/30">사용상태 (Status)</p>
          <p className={`font-mono font-bold uppercase tracking-widest text-[10px] ${selectedCoupon.status === 'USED' ? 'text-black/30' : 'text-[#B91C1C]'}`}>
            {mapCouponStatusLabel(selectedCoupon.status)}
          </p>
          
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/30">발급일 (Issued At)</p>
          <p className="font-mono text-xs text-black/60">{selectedCoupon.issuedAt ? formatDateTime(selectedCoupon.issuedAt) : "-"}</p>
          
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/30">유효기간 (Expires At)</p>
          <p className="font-mono text-xs text-black/60">{selectedCoupon.expiresAt ? formatDateTime(selectedCoupon.expiresAt) : "-"}</p>
          
          {/* 구분선 */}
          <div className="h-px w-full bg-black/5 md:col-span-2"></div>

          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/30">할인정보 (Benefit)</p>
          <p className="font-display uppercase tracking-tight text-[#B91C1C]">
            {selectedCoupon.discountType === "RATE"
              ? `${selectedCoupon.discountValue}% OFF`
              : `${selectedCoupon.discountValue.toLocaleString()} KRW OFF`}
          </p>
        </div>
      </div>
    </ModalFrame>
  );
}