import React from 'react';
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
      category="Asset Linking"
      title="멤버십카드 등록"
      subtitle="멤버십 카드번호와 CVC를 입력하면 마이페이지에 연결됩니다."
      onClose={closeCardRegisterModal}
      footer={
        <>
          <SecondaryButton onClick={closeCardRegisterModal} disabled={cardRegistering}>
            닫기
          </SecondaryButton>
          <PrimaryButton onClick={handleMembershipCardRegister} disabled={cardRegistering}>
            {cardRegistering ? "등록 중..." : "등록"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-10">
        {/* 카드번호와 CVC를 한 줄에 배치하되, CVC 너비를 고정 */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
          
          {/* 카드번호 필드 */}
          <ModalField label="카드번호 (Card Number)">
            <input
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              value={cardNumberInput}
              onChange={(e) => {
                setCardNumberInput(e.target.value.replace(/\D/g, ""));
                if (cardRegisterError) setCardRegisterError("");
              }}
              maxLength={19}
              placeholder="숫자만 입력"
            />
          </ModalField>

          {/* CVC 필드 */}
          <ModalField label="CVC 번호 (CVC Code)">
            <input
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
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

        {/* 에러 메시지 및 보안 안내 문구 */}
        {cardRegisterError ? (
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B91C1C] text-center animate-pulse">
            {cardRegisterError}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-black/50 text-center uppercase tracking-widest leading-relaxed">
            ※ 입력하신 카드 정보는 암호화되어 안전하게 처리됩니다.
          </p>
        )}
      </div>
    </ModalFrame>
  );
}