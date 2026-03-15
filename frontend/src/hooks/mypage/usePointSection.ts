import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePointPassword } from "../../api/myPageApi";
import { formatYmd, shiftDays } from "../../mappers/myPageMapper";
import { cinemaAlert } from "../../utils/alert";

type UsePointSectionOptions = {
  memberId: number;
  verificationToken: string;
};

export function usePointSection({
  memberId,
  verificationToken,
}: UsePointSectionOptions) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);

  const [pointRange, setPointRange] = useState<"week" | "month1" | "month3" | "month6">("week");
  const [pointFrom, setPointFrom] = useState(formatYmd(shiftDays(today, -7).toISOString()));
  const [pointTo, setPointTo] = useState(formatYmd(today.toISOString()));
  const [appliedPointFrom, setAppliedPointFrom] = useState(formatYmd(shiftDays(today, -7).toISOString()));
  const [appliedPointTo, setAppliedPointTo] = useState(formatYmd(today.toISOString()));
  const [pointPasswordInput, setPointPasswordInput] = useState("");
  const [pointPasswordConfirmInput, setPointPasswordConfirmInput] = useState("");

  const applyPointRange = (range: "week" | "month1" | "month3" | "month6") => {
    setPointRange(range);
    const to = new Date();
    const from = new Date(to);
    if (range === "week") from.setDate(to.getDate() - 7);
    if (range === "month1") from.setMonth(to.getMonth() - 1);
    if (range === "month3") from.setMonth(to.getMonth() - 3);
    if (range === "month6") from.setMonth(to.getMonth() - 6);
    setPointFrom(formatYmd(from.toISOString()));
    setPointTo(formatYmd(to.toISOString()));
  };

  const submitPointPassword = async () => {
    const newPassword = pointPasswordInput.replace(/\D/g, "");
    const confirmPassword = pointPasswordConfirmInput.replace(/\D/g, "");
    if (!verificationToken) {
      cinemaAlert("휴대폰 인증 정보가 없습니다. 다시 인증해 주세요.","알림");
      navigate(`/mypage/points?memberId=${memberId}`);
      return;
    }
    try {
      const response = await updatePointPassword(memberId, verificationToken, newPassword, confirmPassword);
      cinemaAlert(response?.message ?? "포인트 비밀번호가 설정되었습니다.","알림");
      navigate(`/mypage/points?memberId=${memberId}`);
    } catch (error: any) {
      cinemaAlert(error?.message ?? "포인트 비밀번호 설정에 실패했습니다.","알림");
    }
  };

  return {
    pointRange,
    pointFrom,
    setPointFrom,
    pointTo,
    setPointTo,
    appliedPointFrom,
    setAppliedPointFrom,
    appliedPointTo,
    setAppliedPointTo,
    pointPasswordInput,
    setPointPasswordInput,
    pointPasswordConfirmInput,
    setPointPasswordConfirmInput,
    applyPointRange,
    submitPointPassword,
  };
}
