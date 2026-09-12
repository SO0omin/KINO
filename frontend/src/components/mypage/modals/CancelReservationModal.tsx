import React from 'react';
import { ModalField, ModalFrame, PrimaryButton, SecondaryButton } from "./modalPrimitives";

type CancelReservationModalProps = {
  isOpen: boolean;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  isCancelling: number | null;
  setCancelTargetId: (value: number | null) => void;
  setShowCancelModal: (value: boolean) => void;
  cancelTargetId: number | null;
  handleCancel: (reservationId: number, reason: string) => void;
};

export function CancelReservationModal({
  isOpen,
  cancelReason,
  setCancelReason,
  isCancelling,
  setCancelTargetId,
  setShowCancelModal,
  cancelTargetId,
  handleCancel,
}: CancelReservationModalProps) {
  if (!isOpen) return null;

  // 닫을 때 상태 리셋 기능 유지
  const closeModal = () => {
    setShowCancelModal(false);
    setCancelTargetId(null);
    setCancelReason("");
  };

  return (
    <ModalFrame
      category="Refund Request"
      title="환불 사유 입력"
      subtitle="취소 사유를 남기면 해당 내용으로 환불 요청이 접수됩니다."
      onClose={closeModal}
      size="md"
      footer={
        <>
          <SecondaryButton disabled={isCancelling !== null} onClick={closeModal}>
            닫기
          </SecondaryButton>
          <PrimaryButton
            disabled={cancelTargetId === null || isCancelling !== null}
            onClick={() => {
              if (cancelTargetId === null) return;
              handleCancel(cancelTargetId, cancelReason);
            }}
          >
            {isCancelling !== null ? "처리 중..." : "환불 확정"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-6">
        <ModalField label="환불 사유 (Cancellation Reason)">
          <textarea
            className="h-40 w-full resize-none rounded-sm border border-black/10 bg-[#FDFDFD] p-6 font-mono text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#B91C1C] shadow-inner"
            placeholder="예매를 취소하시는 사유를 입력해 주세요."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </ModalField>

        <p className="font-mono text-[10px] text-black/50 text-center uppercase tracking-widest leading-relaxed">
          ※ 환불 처리는 영업일 기준 3-5일 정도 소요될 수 있습니다.<br/>
          * Refund processing may take 3-5 business days.
        </p>
      </div>
    </ModalFrame>
  );
}