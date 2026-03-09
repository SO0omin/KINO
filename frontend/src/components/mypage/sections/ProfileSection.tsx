import type { MemberProfile } from "../../../api/myPageApi";

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
  return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">개인정보 수정</h1>
      <p className="mt-4 text-sm text-gray-600">· 회원님의 정보를 정확히 입력해주세요.</p>

      <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr_auto] items-center border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-5 text-base font-semibold text-[#000000]">프로필 사진</div>
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {profileImageUrl && profileImageUrl != "default" ? (
                <img src={profileImageUrl} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-white-600">K</div>
              )}
            </div>
            <label className="cursor-pointer rounded border border-gray-300 bg-[#ffffff] px-4 py-2 text-sm text-[#000000]">
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
            <span className="text-xs text-gray-400">개인정보가 포함된 이미지는 등록하지 마시기 바랍니다.</span>
          </div>
          <div className="px-4 text-right">
            <button className="rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]">회원탈퇴</button>
          </div>
        </div>

        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">아이디</div>
          <div className="px-4 py-4 text-base text-gray-700">{memberProfile?.username ?? "-"}</div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">기본정보</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">이름 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-10 w-[220px] border border-gray-300 px-3 text-base"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 disabled:opacity-60"
              onClick={handleSaveProfile}
              disabled={profileLoading || profileSaving}
            >
              이름변경
            </button>
            <span className="text-sm text-gray-500">개명으로 이름이 변경된 경우 회원정보의 이름을 변경하실 수 있습니다.</span>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">생년월일 <span className="text-[#eb4d32]">*</span></div>
          <div className="px-4 py-4 text-base text-gray-700">
            {profileBirthDate ? formatDateSimple(profileBirthDate) : "-"}
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">휴대폰 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="h-10 w-[220px] border border-gray-300 px-3 text-base"
              value={profileTel}
              onChange={(e) => setProfileTel(e.target.value)}
              disabled={profileLoading}
            />
            <button
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 disabled:opacity-60"
              onClick={handlePhoneChange}
              disabled={profileLoading || profileSaving}
            >
              휴대폰번호 변경
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr] border-b border-gray-200">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">이메일 <span className="text-[#eb4d32]">*</span></div>
          <div className="px-4 py-3">
            <input
              className="h-10 w-full max-w-[700px] border border-gray-300 px-3 text-base"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              disabled={profileLoading}
            />
          </div>
        </div>
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">비밀번호 <span className="text-[#eb4d32]">*</span></div>
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
            <button className="rounded border border-gray-300 px-3 py-2" onClick={() => setShowPasswordChangeModal(true)}>
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">포인트 비밀번호 설정</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">멤버십 포인트 사용시 비밀번호 설정</div>
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
          <button
            className="rounded border border-gray-300 px-3 py-2"
            onClick={openPointPhoneModal}
          >
            포인트 비밀번호 설정
          </button>
          
          {/* 💡 hasPointPassword 값에 따라 라디오 버튼 상태 결정 */}
          <label className="flex items-center gap-1 cursor-default">
            <input 
              type="radio" 
              name="pointuse" 
              // 💡 비밀번호가 null이면(false) '사용안함'이 true가 되어야 함
              checked={memberProfile?.hasPointPassword === false} 
              readOnly 
            />
            <span className={!memberProfile?.hasPointPassword ? "text-[#000000] font-semibold" : "text-gray-400"}>
              사용안함
            </span>
          </label>

          <label className="flex items-center gap-1 cursor-default">
            <input 
              type="radio" 
              name="pointuse" 
              // 💡 비밀번호가 존재하면(true) '사용함'이 true가 됨
              checked={memberProfile?.hasPointPassword === true} 
              readOnly 
            />
            <span className={memberProfile?.hasPointPassword ? "text-[#000000] font-semibold" : "text-gray-400"}>
              사용함
            </span>
          </label>
        </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">생년월일 로그인 설정</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr]">
          <div className="bg-[#ffffff] px-5 py-4 text-base font-semibold text-[#000000]">무인발권기(KIOSK) 기능설정</div>
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" defaultChecked />사용</label>
            <label className="flex items-center gap-1"><input type="radio" name="kiosk" />사용안함</label>
            <span className="text-gray-500">생년월일+휴대폰번호 티켓 출력 및 회원서비스 이용</span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">간편로그인 계정연동</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[120px_1fr_120px] border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#000000]">
          <span>구분</span>
          <span>연동정보</span>
          <span className="text-center">연결</span>
        </div>
        {["네이버", "카카오", "구글"].map((row) => {
          // 💡 매핑을 통해 코드를 훨씬 직관적으로 정리했습니다.
          const isLinked = 
            row === "네이버" ? socialNaverLinked : 
            row === "카카오" ? socialKakaoLinked : 
            socialGoogleLinked; // 부모 컴포넌트(props)에 socialGoogleLinked 추가 필수!

          const providerKey = 
            row === "네이버" ? "naver" : 
            row === "카카오" ? "kakao" : 
            "google";

          return (
            <div key={row} className="grid grid-cols-[120px_1fr_120px] border-b border-gray-200 px-4 py-3 text-sm">
              <span>{row}</span>
              <span className="text-gray-500">
                {isLinked ? `${row} 계정 연동됨` : "연결된 계정정보가 없습니다."}
              </span>
              <div className="text-center">
                <button
                  className="rounded bg-[#000000] px-3 py-1.5 text-xs text-[#ffffff]"
                  onClick={() => toggleSocialLink(providerKey)}
                >
                  {isLinked ? "해제" : "연동"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-4xl font-semibold text-[#eb4d32]">스페셜 멤버십 가입내역</h2>
      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[170px_1fr_auto] items-center px-4 py-3 text-sm">
          <span className="font-semibold">가입정보</span>
          <span className="text-gray-500">가입된 스페셜 멤버십이 없습니다.</span>
          <button className="rounded bg-[#000000] px-4 py-2 text-xs text-[#ffffff]">스페셜 멤버십 가입 안내</button>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          className="rounded border border-[#eb4d32] px-8 py-3 text-base font-semibold text-[#eb4d32]"
          onClick={() => loadMemberProfile()}
          disabled={profileLoading || profileSaving}
        >
          취소
        </button>
        <button
          className="rounded bg-[#eb4d32] px-8 py-3 text-base font-semibold text-[#ffffff] disabled:opacity-60"
          disabled={profileLoading || profileSaving}
          onClick={handleSaveProfile}
        >
          {profileSaving ? "저장 중..." : "등록"}
        </button>
      </div>
    </section>
  );
}
