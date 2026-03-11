import React from 'react';
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
      category="Asset Entry" // AI 스튜디오의 자산 등록 테마
      title="영화관람권 등록"      // 1번 기본 코드 텍스트 유지
      subtitle="보유하신 영화관람권 번호를 입력해 등록할 수 있습니다." // 1번 기본 코드 텍스트 유지
      onClose={closeVoucherRegisterModal}
      footer={
        <>
          <SecondaryButton onClick={closeVoucherRegisterModal}>닫기</SecondaryButton>
          <PrimaryButton onClick={handleVoucherRegister} disabled={voucherRegistering}>
            {voucherRegistering ? "등록 중..." : "등록"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-8">
        {/* 관람권 번호 입력 필드 */}
        <ModalField label="관람권 번호 (Voucher Serial Number)">
          <input
            value={voucherRegisterCode}
            onChange={(e) => {
              // 💡 1번 코드 로직: 숫자만 추출 및 에러 초기화
              const digits = e.target.value.replace(/\D/g, "");
              setVoucherRegisterCode(digits);
              if (voucherRegisterError) setVoucherRegisterError("");
            }}
            maxLength={16}
            // AI 스튜디오 스타일: h-16의 웅장한 높이와 24px 크기의 폰트
            className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
            placeholder="12자리 또는 16자리 입력"
          />
        </ModalField>

        {/* 에러 피드백 및 안내 문구 */}
        {voucherRegisterError ? (
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B91C1C] text-center animate-pulse">
            {voucherRegisterError}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-black/50 text-center uppercase tracking-widest leading-relaxed">
            ※ 관람권은 등록 후 타인에게 양도가 불가하며, 아카이브에 영구 귀속됩니다.
          </p>
        )}
      </div>
    </ModalFrame>
  );
}