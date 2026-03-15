import { useState } from "react";
import { registerMembershipCard } from "../../api/myPageApi";
import { cinemaAlert } from "../../utils/alert";

type UseMembershipSectionOptions = {
  memberId: number;
  loadMembershipCards: () => Promise<any>;
};

export function useMembershipSection({
  memberId,
  loadMembershipCards,
}: UseMembershipSectionOptions) {
  const [showCardRegisterModal, setShowCardRegisterModal] = useState(false);
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [cardCvcInput, setCardCvcInput] = useState("");
  const [cardRegistering, setCardRegistering] = useState(false);
  const [cardRegisterError, setCardRegisterError] = useState("");

  const openCardRegisterModal = () => {
    setCardNumberInput("");
    setCardCvcInput("");
    setCardRegisterError("");
    setShowCardRegisterModal(true);
  };

  const closeCardRegisterModal = () => {
    setShowCardRegisterModal(false);
    setCardNumberInput("");
    setCardCvcInput("");
    setCardRegisterError("");
  };

  const handleMembershipCardRegister = async () => {
    const cardNumber = cardNumberInput.replace(/\D/g, "");
    const cvc = cardCvcInput.replace(/\D/g, "");

    if (cardNumber.length < 12 || cardNumber.length > 19) {
      setCardRegisterError("카드번호는 12~19자리 숫자만 가능합니다.");
      return;
    }
    if (cvc.length < 3 || cvc.length > 4) {
      setCardRegisterError("CVC 번호는 3~4자리 숫자만 가능합니다.");
      return;
    }

    setCardRegistering(true);
    setCardRegisterError("");
    try {
      const response = await registerMembershipCard({
        memberId,
        cardNumber,
        cvc,
      });
      await loadMembershipCards();
      closeCardRegisterModal();
      cinemaAlert(response.message || "멤버십 카드가 등록되었습니다.","알림");
    } catch (error: any) {
      setCardRegisterError(error?.message ?? "멤버십 카드 등록에 실패했습니다.");
    } finally {
      setCardRegistering(false);
    }
  };

  return {
    showCardRegisterModal,
    cardNumberInput,
    setCardNumberInput,
    cardCvcInput,
    setCardCvcInput,
    cardRegistering,
    cardRegisterError,
    setCardRegisterError,
    openCardRegisterModal,
    closeCardRegisterModal,
    handleMembershipCardRegister,
  };
}
