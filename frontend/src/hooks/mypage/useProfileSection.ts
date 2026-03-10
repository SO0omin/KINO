import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPointPasswordSms,
  updateMemberPassword,
  updateMemberProfile,
  verifyPointPasswordSms,
  type MemberProfile,
} from "../../api/myPageApi";

type UseProfileSectionOptions = {
  memberId: number;
  memberProfile: MemberProfile | null;
  loadMemberProfile: () => Promise<any>;
};

export function useProfileSection({
  memberId,
  memberProfile,
  loadMemberProfile,
}: UseProfileSectionOptions) {
  const navigate = useNavigate();

  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileTel, setProfileTel] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showPointPhoneModal, setShowPointPhoneModal] = useState(false);
  const [pointPhoneNumber, setPointPhoneNumber] = useState("");
  const [pointAuthCodeInput, setPointAuthCodeInput] = useState("");
  const [pointAuthSending, setPointAuthSending] = useState(false);
  const [pointAuthVerifying, setPointAuthVerifying] = useState(false);

  useEffect(() => {
    if (!memberProfile) return;
    setProfileName(memberProfile.name ?? "");
    setProfileTel(memberProfile.tel ?? "");
    setProfileEmail(memberProfile.email ?? "");
    setProfileBirthDate(memberProfile.birthDate ?? "");
    if (memberProfile.profileImage) {
      setProfileImageUrl(memberProfile.profileImage);
    }
  }, [memberProfile]);

  const openPointPhoneModal = () => {
    setPointPhoneNumber("");
    setPointAuthCodeInput("");
    setShowPointPhoneModal(true);
  };

  const closePointPhoneModal = () => {
    setShowPointPhoneModal(false);
    setPointPhoneNumber("");
    setPointAuthCodeInput("");
  };

  const sendPointPhoneAuthCode = async () => {
    const phoneDigits = pointPhoneNumber.replace(/\D/g, "");
    if (!/^01\d{8,9}$/.test(phoneDigits)) {
      alert("휴대폰 번호를 올바르게 입력해 주세요. (예: 01012345678)");
      return;
    }
    setPointAuthSending(true);
    try {
      const response = await sendPointPasswordSms(memberId, phoneDigits);
      alert(response?.message ?? "인증번호가 발송되었습니다.");
    } catch (error: any) {
      alert(error?.message ?? "인증번호 발송에 실패했습니다.");
    } finally {
      setPointAuthSending(false);
    }
  };

  const verifyPointPhoneAuthCode = async () => {
    const phoneDigits = pointPhoneNumber.replace(/\D/g, "");
    const codeDigits = pointAuthCodeInput.replace(/\D/g, "");
    if (!/^01\d{8,9}$/.test(phoneDigits)) {
      alert("휴대폰 번호를 올바르게 입력해 주세요.");
      return;
    }
    if (codeDigits.length !== 6) {
      alert("인증번호 6자리를 입력해 주세요.");
      return;
    }
    setPointAuthVerifying(true);
    try {
      const response = await verifyPointPasswordSms(memberId, phoneDigits, codeDigits);
      closePointPhoneModal();
      navigate(`/mypage/point-password?memberId=${memberId}&verifyToken=${encodeURIComponent(response.verificationToken)}`);
    } catch (error: any) {
      alert(error?.message ?? "휴대폰 인증에 실패했습니다.");
    } finally {
      setPointAuthVerifying(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    setProfileSaving(true);
    try {
      const response = await updateMemberProfile({
        memberId,
        name: profileName.trim(),
        tel: profileTel.trim(),
        email: profileEmail.trim(),
        birthDate: profileBirthDate || undefined,
        profileImage: profileImageUrl,
        pointPasswordUsing: false,
      });
      alert(response?.message ?? "개인정보가 수정되었습니다.");
      await loadMemberProfile();
    } catch (error: any) {
      alert(error?.message ?? "개인정보 수정에 실패했습니다.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhoneChange = async () => {
    const digits = profileTel.replace(/\D/g, "");
    if (!/^01\d{8,9}$/.test(digits)) {
      alert("휴대폰 번호 형식을 확인해 주세요. (예: 01012345678)");
      return;
    }
    setProfileTel(digits);
    await handleSaveProfile();
  };

  const handlePasswordChange = async () => {
    if (!currentPasswordInput.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPasswordInput.length < 8) {
      alert("새 비밀번호는 8자리 이상 입력해 주세요.");
      return;
    }
    if (newPasswordInput !== newPasswordConfirmInput) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    setPasswordChanging(true);
    try {
      const response = await updateMemberPassword({
        memberId,
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
        confirmPassword: newPasswordConfirmInput,
      });
      alert(response?.message ?? "비밀번호가 변경되었습니다.");
      setShowPasswordChangeModal(false);
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setNewPasswordConfirmInput("");
    } catch (error: any) {
      alert(error?.message ?? "비밀번호 변경에 실패했습니다.");
    } finally {
      setPasswordChanging(false);
    }
  };

  return {
    profileSaving,
    showPasswordChangeModal,
    setShowPasswordChangeModal,
    currentPasswordInput,
    setCurrentPasswordInput,
    newPasswordInput,
    setNewPasswordInput,
    newPasswordConfirmInput,
    setNewPasswordConfirmInput,
    passwordChanging,
    profileName,
    setProfileName,
    profileTel,
    setProfileTel,
    profileEmail,
    setProfileEmail,
    profileBirthDate,
    profileImageUrl,
    setProfileImageUrl,
    showPointPhoneModal,
    pointPhoneNumber,
    setPointPhoneNumber,
    pointAuthCodeInput,
    setPointAuthCodeInput,
    pointAuthSending,
    pointAuthVerifying,
    openPointPhoneModal,
    closePointPhoneModal,
    sendPointPhoneAuthCode,
    verifyPointPhoneAuthCode,
    handleSaveProfile,
    handlePhoneChange,
    handlePasswordChange,
  };
}
