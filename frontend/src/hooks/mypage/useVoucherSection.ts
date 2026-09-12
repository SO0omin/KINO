import { useState } from "react";
import { registerVoucher } from "../../api/myPageApi";
import { cinemaAlert } from "../../utils/alert";

type UseVoucherSectionOptions = {
  memberId: number;
  loadVouchers: () => Promise<any>;
};

export function useVoucherSection({
  memberId,
  loadVouchers,
}: UseVoucherSectionOptions) {
  const [showVoucherRegisterModal, setShowVoucherRegisterModal] = useState(false);
  const [voucherRegisterCode, setVoucherRegisterCode] = useState("");
  const [voucherRegisterError, setVoucherRegisterError] = useState("");
  const [voucherRegistering, setVoucherRegistering] = useState(false);

  const openVoucherRegisterModal = () => {
    setVoucherRegisterCode("");
    setVoucherRegisterError("");
    setShowVoucherRegisterModal(true);
  };

  const closeVoucherRegisterModal = () => {
    setShowVoucherRegisterModal(false);
    setVoucherRegisterCode("");
    setVoucherRegisterError("");
  };

  const handleVoucherRegister = async () => {
    const digits = voucherRegisterCode.replace(/\D/g, "");
    const valid = digits.length === 12 || digits.length === 16;

    if (!valid) {
      setVoucherRegisterError("영화관람권 번호는 12자리 또는 16자리 숫자만 가능합니다.");
      return;
    }

    setVoucherRegisterError("");
    setVoucherRegistering(true);

    try {
      const response = await registerVoucher({
        memberId,
        voucherType: "MOVIE",
        code: digits,
      });
      await loadVouchers();
      cinemaAlert(response.message || "등록이 완료되었습니다.","알림");
      closeVoucherRegisterModal();
    } catch (error: any) {
      setVoucherRegisterError(error?.message ?? "등록 처리 중 오류가 발생했습니다.");
    } finally {
      setVoucherRegistering(false);
    }
  };

  return {
    showVoucherRegisterModal,
    voucherRegisterCode,
    setVoucherRegisterCode,
    voucherRegisterError,
    setVoucherRegisterError,
    voucherRegistering,
    openVoucherRegisterModal,
    closeVoucherRegisterModal,
    handleVoucherRegister,
  };
}
