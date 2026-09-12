import React, { useState, useEffect } from 'react';
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
  username?: string;
  tel?: string;
  birth_date?: string;
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
  username = "",
  tel = "",
  birth_date = ""
}: PasswordChangeModalProps) {
  
  // 1. 실시간 검증 상태 관리 (대소문자, 개인정보 포함)
  const [pwValidation, setPwValidation] = useState({
    length: false,
    english: false, // 이제 대/소문자 모두 포함해야 true
    number: false,
    special: false,
    noPersonal: false, // 아이디, 전화번호, 생일 포함 여부
  });

  // 2. 비밀번호 실시간 검사 로직
  useEffect(() => {
    const validatePassword = (password: string) => {
      const specChars = /[`~!@#$%^&*|'";:\₩\\?]/;
      
      const isLength = password.length >= 8 && password.length <= 20;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasEnglish = hasUpper && hasLower;
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = specChars.test(password);

      // 개인정보(ID, 전화번호, 생년월일) 포함 여부 검사
      const cleanTel = tel ? tel.replace(/[^0-9]/g, "") : "";
      const cleanBirth = birth_date ? birth_date.replace(/-/g, "") : "";

      const isIdSafe = username ? !password.includes(username) : true;
      const isTelSafe = cleanTel.length >= 4 ? !password.includes(cleanTel.slice(-4)) : true;
      const isMidTelSafe = cleanTel.length >= 8 ? !password.includes(cleanTel.slice(3, 7)) : true;
      const isBirthSafe = cleanBirth ? !password.includes(cleanBirth) : true;

      const isNotEmpty = password.length > 0;

      setPwValidation({
        length: isLength,
        english: hasEnglish,
        number: hasNumber,
        special: hasSpecial,
        noPersonal: isNotEmpty && isIdSafe && isTelSafe && isMidTelSafe && isBirthSafe
      });
    };
    
    validatePassword(newPasswordInput);
  }, [newPasswordInput, username, tel, birth_date]); // 의존성 배열에 유저 정보 추가

  if (!isOpen) return null;

  const closeModal = () => {
    if (passwordChanging) return;
    setShowPasswordChangeModal(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setNewPasswordConfirmInput("");
  };

  // 버튼 활성화 여부 계산 (모든 조건 충족 + 비밀번호 일치)
  const isAllValid = 
    pwValidation.length && 
    pwValidation.english && 
    pwValidation.number && 
    pwValidation.special &&
    pwValidation.noPersonal && 
    newPasswordInput === newPasswordConfirmInput &&
    newPasswordInput.length > 0;

  return (
    <ModalFrame
      category="Security Protocol"
      title="비밀번호 변경"
      subtitle="계정 보안을 위해 현재 비밀번호와 새 비밀번호를 입력해 주세요."
      onClose={closeModal}
      size="md"
      footer={
        <>
          <SecondaryButton onClick={closeModal} disabled={passwordChanging}>
            취소
          </SecondaryButton>
          <PrimaryButton 
            onClick={handlePasswordChange} 
            disabled={passwordChanging || !isAllValid}
          >
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
        
        <div className="h-px w-full bg-black/5"></div>

        {/* 2. 새 비밀번호 입력 영역 */}
        <div className="space-y-6">
          <ModalField label="새 비밀번호 (New Password)">
            <input
              type="password"
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="새 비밀번호"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
            />
            
            {/* 확장된 체크리스트 UI */}
            <div className="mt-4 p-4 bg-black/5 border border-black/5 rounded-sm space-y-2 text-[10px] font-bold uppercase tracking-widest">
              <p className={pwValidation.length ? "text-[#03C75A]" : "text-black/40"}>
                {pwValidation.length ? "✓" : "○"} 8 ~ 20자 사이 입력
              </p>
              <p className={(pwValidation.english && pwValidation.number && pwValidation.special) ? "text-[#03C75A]" : "text-black/40"}>
                {(pwValidation.english && pwValidation.number && pwValidation.special) ? "✓" : "○"} 영문(대/소문자), 숫자, 특수문자 조합
              </p>
              <p className={pwValidation.noPersonal ? "text-[#03C75A]" : "text-black/40"}>
                {pwValidation.noPersonal ? "✓" : "○"} 아이디/전화/생일 포함 금지
              </p>
            </div>
          </ModalField>
          
          <ModalField label="새 비밀번호 확인 (Confirm New Password)">
            <input
              type="password"
              className="h-16 w-full rounded-sm border border-black/10 bg-[#FDFDFD] px-6 font-mono text-[15px] text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
              placeholder="비밀번호 재입력"
              value={newPasswordConfirmInput}
              onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
            />
            {newPasswordConfirmInput.length > 0 && (
              <div className="mt-2 px-1">
                {newPasswordInput === newPasswordConfirmInput ? (
                  <p className="text-[#03C75A] text-[10px] font-bold uppercase tracking-widest">
                    ✓ 비밀번호가 일치합니다
                  </p>
                ) : (
                  <p className="text-[#B91C1C] text-[10px] font-bold uppercase tracking-widest">
                    ✘ 비밀번호가 일치하지 않습니다
                  </p>
                )}
              </div>
            )}
          </ModalField>
        </div>
        
        <p className="font-mono text-[10px] text-black/50 text-center uppercase tracking-widest leading-relaxed">
          ※ 키노 시네마는 고객님의 소중한 개인정보를 암호화하여
          <br />
          안전하게 보호하고 있습니다.
        </p>
      </div>
    </ModalFrame>
  );
}