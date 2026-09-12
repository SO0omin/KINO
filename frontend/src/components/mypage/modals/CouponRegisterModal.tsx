import React from 'react';
import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type CouponRegisterModalProps = {
  isOpen: boolean;
  couponRegisterCode: string;
  setCouponRegisterCode: (value: string) => void;
  couponRegisterError: string;
  setCouponRegisterError: (value: string) => void;
  couponRegistering: boolean;
  handleCouponRegister: () => void;
  closeCouponRegisterModal: () => void;
};

export function CouponRegisterModal({
  isOpen,
  couponRegisterCode,
  setCouponRegisterCode,
  couponRegisterError,
  setCouponRegisterError,
  couponRegistering,
  handleCouponRegister,
  closeCouponRegisterModal,
}: CouponRegisterModalProps) {
  if (!isOpen) return null;

  return (
    <ModalFrame
      category="Voucher Entry"
      title="할인쿠폰 등록"
      subtitle="보유 중인 쿠폰 코드를 입력하면 즉시 등록됩니다."
      onClose={closeCouponRegisterModal}
      footer={
        <>
          <SecondaryButton onClick={closeCouponRegisterModal}>닫기</SecondaryButton>
          <PrimaryButton onClick={handleCouponRegister} disabled={couponRegistering}>
            {couponRegistering ? "등록 중..." : "등록"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-8">
        <ModalField label="할인쿠폰 번호 (Voucher Code)">
          <input
            value={couponRegisterCode}
            onChange={(e) => {
              setCouponRegisterCode(e.target.value.toUpperCase());
              if (couponRegisterError) setCouponRegisterError("");
            }}
            className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
            placeholder="쿠폰 번호를 입력해주세요."
          />
        </ModalField>

        {/* 에러 메시지 또는 안내 문구 */}
        {couponRegisterError ? (
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B91C1C] text-center animate-pulse">
            {couponRegisterError}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-black/50 text-center uppercase tracking-widest leading-relaxed">
            ※ 쿠폰 코드는 대소문자를 구분하며 정확하게 입력해 주세요.
          </p>
        )}
      </div>
    </ModalFrame>
  );
}