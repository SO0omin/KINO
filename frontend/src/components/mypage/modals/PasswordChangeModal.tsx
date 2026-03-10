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

  const closeModal = () => {
    if (passwordChanging) return;
    setShowPasswordChangeModal(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setNewPasswordConfirmInput("");
  };

  return (
    <ModalFrame
      title="비밀번호 변경"
      subtitle="계정 보안을 위해 현재 비밀번호와 새 비밀번호를 입력해 주세요."
      onClose={closeModal}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={closeModal} disabled={passwordChanging}>
            취소
          </SecondaryButton>
          <PrimaryButton onClick={handlePasswordChange} disabled={passwordChanging}>
            {passwordChanging ? "변경 중..." : "변경"}
          </PrimaryButton>
        </div>
      }
    >
      <ModalField label="현재 비밀번호">
        <input
          type="password"
          className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="현재 비밀번호"
          value={currentPasswordInput}
          onChange={(e) => setCurrentPasswordInput(e.target.value)}
        />
      </ModalField>
      <ModalField label="새 비밀번호">
        <input
          type="password"
          className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="새 비밀번호 (8자리 이상)"
          value={newPasswordInput}
          onChange={(e) => setNewPasswordInput(e.target.value)}
        />
      </ModalField>
      <ModalField label="새 비밀번호 확인">
        <input
          type="password"
          className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="새 비밀번호 확인"
          value={newPasswordConfirmInput}
          onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
        />
      </ModalField>
    </ModalFrame>
  );
}
