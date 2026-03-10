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
      title="할인쿠폰 등록"
      subtitle="보유 중인 쿠폰 코드를 입력하면 즉시 등록됩니다."
      onClose={closeCouponRegisterModal}
      footer={
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={closeCouponRegisterModal}>닫기</SecondaryButton>
          <PrimaryButton onClick={handleCouponRegister} disabled={couponRegistering}>
            {couponRegistering ? "등록 중..." : "등록"}
          </PrimaryButton>
        </div>
      }
    >
      <ModalField label="할인쿠폰 번호">
        <input
          value={couponRegisterCode}
          onChange={(e) => {
            setCouponRegisterCode(e.target.value.toUpperCase());
            if (couponRegisterError) setCouponRegisterError("");
          }}
          className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="쿠폰 번호를 입력해 주세요"
        />
      </ModalField>
      {couponRegisterError ? <p className="text-sm text-[#B91C1C]">{couponRegisterError}</p> : null}
    </ModalFrame>
  );
}
