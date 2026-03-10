import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type MembershipCardModalProps = {
  isOpen: boolean;
  closeCardRegisterModal: () => void;
  cardNumberInput: string;
  setCardNumberInput: (value: string) => void;
  cardRegisterError: string;
  setCardRegisterError: (value: string) => void;
  cardCvcInput: string;
  setCardCvcInput: (value: string) => void;
  cardRegistering: boolean;
  handleMembershipCardRegister: () => void;
};

export function MembershipCardModal({
  isOpen,
  closeCardRegisterModal,
  cardNumberInput,
  setCardNumberInput,
  cardRegisterError,
  setCardRegisterError,
  cardCvcInput,
  setCardCvcInput,
  cardRegistering,
  handleMembershipCardRegister,
}: MembershipCardModalProps) {
  if (!isOpen) return null;

  return (
    <ModalFrame
      title="멤버십카드 등록"
      subtitle="멤버십 카드번호와 CVC를 입력하면 마이페이지에 연결됩니다."
      onClose={closeCardRegisterModal}
      footer={
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={closeCardRegisterModal} disabled={cardRegistering}>
            취소
          </SecondaryButton>
          <PrimaryButton onClick={handleMembershipCardRegister} disabled={cardRegistering}>
            {cardRegistering ? "등록 중" : "등록"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
        <ModalField label="카드번호">
          <input
            className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
            value={cardNumberInput}
            onChange={(e) => {
              setCardNumberInput(e.target.value.replace(/\D/g, ""));
              if (cardRegisterError) setCardRegisterError("");
            }}
            maxLength={19}
            placeholder="숫자만 입력"
          />
        </ModalField>
        <ModalField label="CVC 번호">
          <input
            className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
            value={cardCvcInput}
            onChange={(e) => {
              setCardCvcInput(e.target.value.replace(/\D/g, ""));
              if (cardRegisterError) setCardRegisterError("");
            }}
            maxLength={4}
            placeholder="3~4자리"
          />
        </ModalField>
      </div>
      {cardRegisterError ? <p className="text-sm text-[#B91C1C]">{cardRegisterError}</p> : null}
    </ModalFrame>
  );
}
