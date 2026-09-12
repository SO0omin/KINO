import React from 'react';
import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type PointPhoneModalProps = {
  isOpen: boolean;
  closePointPhoneModal: () => void;
  pointPhoneNumber: string;
  setPointPhoneNumber: (value: string) => void;
  pointAuthSending: boolean;
  sendPointPhoneAuthCode: () => void;
  pointAuthCodeInput: string;
  setPointAuthCodeInput: (value: string) => void;
  pointAuthVerifying: boolean;
  verifyPointPhoneAuthCode: () => void;
};

export function PointPhoneModal({
  isOpen,
  closePointPhoneModal,
  pointPhoneNumber,
  setPointPhoneNumber,
  pointAuthSending,
  sendPointPhoneAuthCode,
  pointAuthCodeInput,
  setPointAuthCodeInput,
  pointAuthVerifying,
  verifyPointPhoneAuthCode,
}: PointPhoneModalProps) {
  if (!isOpen) return null;

  return (
    <ModalFrame
      category="Identity Verification"
      title="휴대폰 인증"
      subtitle="포인트 비밀번호 설정을 위해 본인 인증을 진행해 주세요."
      onClose={closePointPhoneModal}
      footer={
        <SecondaryButton onClick={closePointPhoneModal}>닫기</SecondaryButton>
      }
    >
      <div className="space-y-10">
        {/* 1. 휴대폰 번호 입력 및 발송 섹션 */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <ModalField label="휴대폰 번호 (Mobile Number)">
            <input
              value={pointPhoneNumber}
              // 숫자만 입력 가능하게 처리
              onChange={(e) => setPointPhoneNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={11}
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="01012345678"
            />
          </ModalField>
          <PrimaryButton className="h-16 px-10" onClick={sendPointPhoneAuthCode} disabled={pointAuthSending}>
            {pointAuthSending ? "발송 중..." : "인증번호 발송"}
          </PrimaryButton>
        </div>

        {/* 섹션 구분선 */}
        <div className="h-px w-full bg-black/5"></div>

        {/* 2. 인증번호 입력 및 확인 섹션 */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <ModalField label="인증번호 (Verification Code)">
            <input
              value={pointAuthCodeInput}
              onChange={(e) => setPointAuthCodeInput(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="6자리 입력"
            />
          </ModalField>
          <PrimaryButton className="h-16 px-10" onClick={verifyPointPhoneAuthCode} disabled={pointAuthVerifying}>
            {pointAuthVerifying ? "확인 중..." : "인증 확인"}
          </PrimaryButton>
        </div>
        
        <p className="font-mono text-[10px] text-black/50 text-center uppercase tracking-widest leading-relaxed">
          ※ 인증번호는 발송 후 3분 이내에 입력해 주셔야 합니다.<br/>
          * Standard messaging rates may apply. 
        </p>
      </div>
    </ModalFrame>
  );
}