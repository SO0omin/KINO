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

  const closeModal = () => {
    setShowCancelModal(false);
    setCancelTargetId(null);
    setCancelReason("");
  };

  return (
    <ModalFrame
      title="환불 사유 입력"
      subtitle="취소 사유를 남기면 해당 내용으로 환불 요청이 접수됩니다."
      onClose={closeModal}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
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
        </div>
      }
    >
      <ModalField label="환불 사유">
        <textarea
          className="h-36 w-full resize-none rounded-sm border border-black/10 bg-white p-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
          placeholder="예: 일정 변경으로 취소합니다."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ModalField>
    </ModalFrame>
  );
}
