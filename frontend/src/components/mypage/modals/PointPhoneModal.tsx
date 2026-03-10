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
      title="휴대폰 인증"
      subtitle="포인트 비밀번호 설정을 위해 본인 인증을 진행해 주세요."
      onClose={closePointPhoneModal}
      footer={
        <div className="flex justify-end">
          <SecondaryButton onClick={closePointPhoneModal}>닫기</SecondaryButton>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <ModalField label="휴대폰 번호">
          <input
            value={pointPhoneNumber}
            onChange={(e) => setPointPhoneNumber(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
            className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
            placeholder="01012345678"
          />
        </ModalField>
        <PrimaryButton className="h-12" onClick={sendPointPhoneAuthCode} disabled={pointAuthSending}>
          {pointAuthSending ? "발송 중..." : "인증번호 발송"}
        </PrimaryButton>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <ModalField label="인증번호">
          <input
            value={pointAuthCodeInput}
            onChange={(e) => setPointAuthCodeInput(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
            placeholder="6자리 입력"
          />
        </ModalField>
        <PrimaryButton className="h-12" onClick={verifyPointPhoneAuthCode} disabled={pointAuthVerifying}>
          {pointAuthVerifying ? "확인 중..." : "인증 확인"}
        </PrimaryButton>
      </div>
    </ModalFrame>
  );
}
