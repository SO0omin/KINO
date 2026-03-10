import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type VoucherRegisterModalProps = {
  isOpen: boolean;
  closeVoucherRegisterModal: () => void;
  voucherRegisterCode: string;
  setVoucherRegisterCode: (value: string) => void;
  voucherRegisterError: string;
  setVoucherRegisterError: (value: string) => void;
  voucherRegistering: boolean;
  handleVoucherRegister: () => void;
};

export function VoucherRegisterModal({
  isOpen,
  closeVoucherRegisterModal,
  voucherRegisterCode,
  setVoucherRegisterCode,
  voucherRegisterError,
  setVoucherRegisterError,
  voucherRegistering,
  handleVoucherRegister,
}: VoucherRegisterModalProps) {
  if (!isOpen) return null;

  return (
    <ModalFrame
      title="영화관람권 등록"
      subtitle="보유하신 영화관람권 번호를 입력해 등록할 수 있습니다."
      onClose={closeVoucherRegisterModal}
      footer={
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={closeVoucherRegisterModal}>닫기</SecondaryButton>
          <PrimaryButton onClick={handleVoucherRegister} disabled={voucherRegistering}>
            {voucherRegistering ? "등록 중..." : "등록"}
          </PrimaryButton>
        </div>
      }
    >
      <ModalField label="관람권 번호">
        <input
          value={voucherRegisterCode}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            setVoucherRegisterCode(digits);
            if (voucherRegisterError) setVoucherRegisterError("");
          }}
          maxLength={16}
          className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="12자리 또는 16자리 입력"
        />
      </ModalField>
      {voucherRegisterError ? <p className="text-sm text-[#B91C1C]">{voucherRegisterError}</p> : null}
    </ModalFrame>
  );
}
