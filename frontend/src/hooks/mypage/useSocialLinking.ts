import { useEffect, useState } from "react";
import { GOOGLE_AUTH_URL, KAKAO_AUTH_URL, NAVER_AUTH_URL } from "../../constants/socialAuth";
import {
  linkSocialAccountApi,
  unlinkSocialAccountApi,
  type MemberProfile,
} from "../../api/myPageApi";

type SocialProvider = "naver" | "kakao" | "google";

type UseSocialLinkingOptions = {
  memberProfile: MemberProfile | null;
  loadMemberProfile: () => Promise<any>;
};

export function useSocialLinking({
  memberProfile,
  loadMemberProfile,
}: UseSocialLinkingOptions) {
  const [socialNaverLinked, setSocialNaverLinked] = useState(false);
  const [socialKakaoLinked, setSocialKakaoLinked] = useState(false);
  const [socialGoogleLinked, setSocialGoogleLinked] = useState(false);

  useEffect(() => {
    if (!memberProfile) return;
    setSocialNaverLinked(memberProfile.socialNaverLinked);
    setSocialKakaoLinked(memberProfile.socialKakaoLinked);
    setSocialGoogleLinked(memberProfile.socialGoogleLinked);
  }, [memberProfile]);

  const openSocialPopup = (provider: string, authUrl: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const popup = window.open(authUrl, "socialLoginPopup", "width=500,height=600");

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "SOCIAL_LINK" && event.data?.provider?.toUpperCase() === provider.toUpperCase()) {
          resolve(event.data.code);
          window.removeEventListener("message", messageListener);
        }
      };

      window.addEventListener("message", messageListener);

      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          window.removeEventListener("message", messageListener);
          reject(new Error("팝업이 닫혔습니다."));
        }
      }, 1000);
    });

  const toggleSocialLink = async (provider: SocialProvider) => {
    const isLinked =
      provider === "naver" ? socialNaverLinked : provider === "kakao" ? socialKakaoLinked : socialGoogleLinked;
    const providerKoName = provider === "naver" ? "네이버" : provider === "kakao" ? "카카오" : "구글";

    if (isLinked) {
      if (!window.confirm(`${providerKoName} 계정 연동을 해제하시겠습니까?`)) return;

      try {
        await unlinkSocialAccountApi(provider.toUpperCase());
        alert(`${providerKoName} 연동이 해제되었습니다.`);
        await loadMemberProfile();
      } catch (error: any) {
        alert(error.response?.data?.message || "해제 중 오류 발생");
      }
      return;
    }

    try {
      const authUrl =
        provider === "naver" ? NAVER_AUTH_URL : provider === "kakao" ? KAKAO_AUTH_URL : GOOGLE_AUTH_URL;
      const authCode = await openSocialPopup(provider.toUpperCase(), authUrl);

      if (!authCode) return;

      await linkSocialAccountApi(provider.toUpperCase(), authCode);
      alert("성공적으로 연동되었습니다!");
      await loadMemberProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || "연동 중 오류 발생");
    }
  };

  return {
    socialNaverLinked,
    setSocialNaverLinked,
    socialKakaoLinked,
    setSocialKakaoLinked,
    socialGoogleLinked,
    setSocialGoogleLinked,
    toggleSocialLink,
  };
}
