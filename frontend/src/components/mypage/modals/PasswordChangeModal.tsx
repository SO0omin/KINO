import React from 'react';
import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type PasswordChangeModalProps = {
  isOpen: boolean;
  currentPasswordInput: string;
  setCurrentPasswordInput: (value: string) => void;
  newPasswordInput: string;
  setNewPasswordInput: (value: string) => void;
  newPasswordConfirmInput: string;
  setNewPasswordConfirmInput: (value: string) => void;
  passwordChanging: boolean;
  setShowPasswordChangeModal: (value: boolean) => void;
  handlePasswordChange: () => void;
};

export function PasswordChangeModal({
  isOpen,
  currentPasswordInput,
  setCurrentPasswordInput,
  newPasswordInput,
  setNewPasswordInput,
  newPasswordConfirmInput,
  setNewPasswordConfirmInput,
  passwordChanging,
  setShowPasswordChangeModal,
  handlePasswordChange,
}: PasswordChangeModalProps) {
  if (!isOpen) return null;

  // 💡 1번 코드의 로직: 모달 닫을 때 입력값 초기화 기능 유지
  const closeModal = () => {
    if (passwordChanging) return;
    setShowPasswordChangeModal(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setNewPasswordConfirmInput("");
  };

  return (
    <ModalFrame
      category="Security Protocol" // AI 스튜디오의 보안 테마 카테고리
      title="비밀번호 변경"         // 1번 기본 코드 텍스트 유지
      subtitle="계정 보안을 위해 현재 비밀번호와 새 비밀번호를 입력해 주세요." // 1번 기본 코드 텍스트 유지
      onClose={closeModal}
      size="md"
      footer={
        <>
          <SecondaryButton onClick={closeModal} disabled={passwordChanging}>
            취소
          </SecondaryButton>
          <PrimaryButton onClick={handlePasswordChange} disabled={passwordChanging}>
            {passwordChanging ? "변경 중..." : "비밀번호 변경"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-8">
        {/* 1. 현재 비밀번호 필드 */}
        <ModalField label="현재 비밀번호 (Current Password)">
          <input
            type="password"
            className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-lg text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
            placeholder="••••••••"
            value={currentPasswordInput}
            onChange={(e) => setCurrentPasswordInput(e.target.value)}
          />
        </ModalField>
        
        {/* 구분선: 현재 비밀번호와 새 비밀번호 영역 분리 */}
        <div className="h-px w-full bg-black/5"></div>

        {/* 2. 새 비밀번호 입력 영역 */}
        <div className="space-y-6">
          <ModalField label="새 비밀번호 (New Password)">
            <input
              type="password"
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="8자리 이상 입력"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
            />
          </ModalField>
          
          <ModalField label="새 비밀번호 확인 (Confirm New Password)">
            <input
              type="password"
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="비밀번호 재입력"
              value={newPasswordConfirmInput}
              onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
            />
          </ModalField>
        </div>
        
        {/* 보안 안내 문구 (AI 스튜디오 스타일) */}
        <p className="font-mono text-[10px] text-black/50 text-center uppercase tracking-widest leading-relaxed">
          ※ 키노 시네마는 고객님의 소중한 개인정보를 암호화하여
          <br />
          안전하게 보호하고 있습니다.
        </p>
      </div>
    </ModalFrame>
  );
}