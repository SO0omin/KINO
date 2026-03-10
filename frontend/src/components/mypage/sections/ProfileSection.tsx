import { type MemberProfile, deleteMember} from "../../../api/myPageApi";
import { useAuth } from "../../../contexts/AuthContext";

type ProfileSectionProps = {
  profileImageUrl: string;
  setProfileImageUrl: (value: string) => void;
  memberProfile: MemberProfile | null;
  profileName: string;
  setProfileName: (value: string) => void;
  profileLoading: boolean;
  profileSaving: boolean;
  handleSaveProfile: () => Promise<void>;
  profileBirthDate: string;
  formatDateSimple: (value: string) => string;
  profileTel: string;
  setProfileTel: (value: string) => void;
  handlePhoneChange: () => Promise<void>;
  profileEmail: string;
  setProfileEmail: (value: string) => void;
  setShowPasswordChangeModal: (value: boolean) => void;
  openPointPhoneModal: () => void;
  hasPointPassword: boolean;
  socialNaverLinked: boolean;
  socialKakaoLinked: boolean;
  socialGoogleLinked: boolean;
  toggleSocialLink: (provider: "naver" | "kakao" | "google") => void;
  loadMemberProfile: () => Promise<void>;
};


export function ProfileSection({
  profileImageUrl,
  setProfileImageUrl,
  memberProfile,
  profileName,
  setProfileName,
  profileLoading,
  profileSaving,
  handleSaveProfile,
  profileBirthDate,
  formatDateSimple,
  profileTel,
  setProfileTel,
  handlePhoneChange,
  profileEmail,
  setProfileEmail,
  setShowPasswordChangeModal,
  openPointPhoneModal,
  hasPointPassword,
  socialNaverLinked,
  socialKakaoLinked,
  socialGoogleLinked,
  toggleSocialLink,
  loadMemberProfile,
}: ProfileSectionProps) {
  const { logout } = useAuth();

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?")) return;

    try {
      await deleteMember();

      logout();
      window.location.href = "/";
    } catch (error: any) {
      console.error("4. 에러 발생:", error);
      alert(error.message);
    }
  };
  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">개인정보 수정</h1>
      <p className="mt-4 text-sm text-black/55">· 회원님의 정보를 정확히 입력해주세요.</p>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[170px_1fr_auto] items-center border-b border-black/10">
          <div className="px-6 py-6 text-base font-semibold text-[#1A1A1A]">프로필 사진</div>
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-black/10 bg-black/5">
              {profileImageUrl && profileImageUrl != "default" ? (
                <img src={profileImageUrl} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#B91C1C]">K</div>
              )}
            </div>
            <label className="cursor-pointer rounded-sm border border-[#B91C1C] bg-white px-4 py-2 text-sm font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white">
              이미지 등록
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setProfileImageUrl(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <span className="text-xs text-black/40">개인정보가 포함된 이미지는 등록하지 마시기 바랍니다.</span>
          </div>
          <div className="px-4 text-right">
            <button
              onClick={handleWithdraw}
              className="rounded-sm border border-[#B91C1C] px-4 py-2 text-sm font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
            >
              회원탈퇴
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">아이디</div>
          <div className="px-4 py-4 text-base text-black/70">{memberProfile?.username ?? "-"}</div>
        </div>
      </div>

      <h2 className="mt-10 text-4xl font-semibold tracking-tight text-[#B91C1C]">기본정보</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">이름 <span className="text-[#B91C1C]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-11 w-[220px] rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded-sm border border-[#B91C1C] px-4 py-2 text-sm font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white disabled:opacity-60"
              onClick={handleSaveProfile}
              disabled={profileLoading || profileSaving}
            >
              이름변경
            </button>
            <span className="text-sm text-black/50">개명으로 이름이 변경된 경우 회원정보의 이름을 변경하실 수 있습니다.</span>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">생년월일 <span className="text-[#B91C1C]">*</span></div>
          <div className="px-4 py-4 text-base text-black/70">
            {profileBirthDate ? formatDateSimple(profileBirthDate) : "-"}
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">휴대폰 <span className="text-[#B91C1C]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-11 w-[220px] rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
              value={profileTel}
              onChange={(e) => setProfileTel(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded-sm border border-[#B91C1C] px-4 py-2 text-sm font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white disabled:opacity-60"
              onClick={handlePhoneChange}
              disabled={profileLoading || profileSaving}
            >
              휴대폰번호 변경
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">이메일 <span className="text-[#B91C1C]">*</span></div>
          <div className="px-4 py-3">
            <input
              className="h-11 w-full max-w-[700px] rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              disabled={profileLoading}
            />
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr]">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">비밀번호 <span className="text-[#B91C1C]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-black/60">
            <button
              className="rounded-sm border border-[#B91C1C] px-4 py-2 font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
              onClick={() => setShowPasswordChangeModal(true)}
            >
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-4xl font-semibold tracking-tight text-[#B91C1C]">포인트 비밀번호 설정</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">멤버십 포인트 사용시 비밀번호 설정</div>
          <div className="flex items-center gap-4 px-4 py-4 text-sm">
            <button
              className="rounded-sm border border-[#B91C1C] px-4 py-2 font-medium text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
              onClick={openPointPhoneModal}
            >
              포인트 비밀번호 설정
            </button>

            <label className="flex cursor-default items-center gap-1">
              <input
                type="radio"
                name="pointuse"
                checked={memberProfile?.hasPointPassword === false}
                readOnly
              />
              <span className={!memberProfile?.hasPointPassword ? "font-semibold text-[#1A1A1A]" : "text-black/35"}>
                사용안함
              </span>
            </label>

            <label className="flex cursor-default items-center gap-1">
              <input
                type="radio"
                name="pointuse"
                checked={memberProfile?.hasPointPassword === true}
                readOnly
              />
              <span className={memberProfile?.hasPointPassword ? "font-semibold text-[#1A1A1A]" : "text-black/35"}>
                사용함
              </span>
            </label>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-4xl font-semibold tracking-tight text-[#B91C1C]">생년월일 로그인 설정</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">무인발권기(KIOSK) 기능설정</div>
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" defaultChecked />사용</label>
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" />사용안함</label>
            <span className="text-black/50">생년월일+휴대폰번호 티켓 출력 및 회원서비스 이용</span>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-4xl font-semibold tracking-tight text-[#B91C1C]">간편로그인 계정연동</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[120px_1fr_120px] border-b border-black/10 px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
          <span>구분</span>
          <span>연동정보</span>
          <span className="text-center">연결</span>
        </div>
        {["네이버", "카카오", "구글"].map((row) => {
          const isLinked =
            row === "네이버" ? socialNaverLinked :
            row === "카카오" ? socialKakaoLinked :
            socialGoogleLinked;

          const providerKey =
            row === "네이버" ? "naver" :
            row === "카카오" ? "kakao" :
            "google";

          return (
            <div key={row} className="grid grid-cols-[120px_1fr_120px] border-b border-black/10 px-4 py-3 text-sm text-[#1A1A1A]">
              <span>{row}</span>
              <span className="text-black/50">
                {isLinked ? `${row} 계정 연동됨` : "연결된 계정정보가 없습니다."}
              </span>
              <div className="text-center">
                <button
                  className="rounded-sm bg-[#1A1A1A] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#B91C1C]"
                  onClick={() => toggleSocialLink(providerKey)}
                >
                  {isLinked ? "해제" : "연동"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          className="rounded-sm border border-[#B91C1C] px-8 py-3 text-base font-semibold text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
          onClick={() => loadMemberProfile()}
          disabled={profileLoading || profileSaving}
        >
          취소
        </button>
        <button
          className="rounded-sm bg-[#B91C1C] px-8 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(185,28,28,0.18)] transition-colors hover:bg-[#991B1B] disabled:opacity-60"
          disabled={profileLoading || profileSaving}
          onClick={handleSaveProfile}
        >
          {profileSaving ? "저장 중..." : "등록"}
        </button>
      </div>
    </section>
  );
}
