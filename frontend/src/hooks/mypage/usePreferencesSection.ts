import { useEffect, useState } from "react";
import { getMyCoupons, getMyVouchers } from "../../api/myPageApi";
import { ticketingApi } from "../../api/ticketingApi";

type PreferenceSnapshot = {
  marketingPolicyAgreed: boolean;
  marketingEmailAgreed: boolean;
  marketingSmsAgreed: boolean;
  marketingPushAgreed: boolean;
  preferredTheaterId: string;
  hasPointPassword: boolean;
  socialNaverLinked: boolean;
  socialKakaoLinked: boolean;
  socialGoogleLinked: boolean;
};

type UsePreferencesSectionOptions = {
  memberId: number;
  pageKey: string;
  hasPointPassword: boolean;
  socialNaverLinked: boolean;
  setSocialNaverLinked: (value: boolean) => void;
  socialKakaoLinked: boolean;
  setSocialKakaoLinked: (value: boolean) => void;
  socialGoogleLinked: boolean;
  setSocialGoogleLinked: (value: boolean) => void;
};

const emptySnapshot: PreferenceSnapshot = {
  marketingPolicyAgreed: false,
  marketingEmailAgreed: false,
  marketingSmsAgreed: false,
  marketingPushAgreed: false,
  preferredTheaterId: "",
  hasPointPassword: false,
  socialNaverLinked: false,
  socialKakaoLinked: false,
  socialGoogleLinked: false,
};

export function usePreferencesSection({
  memberId,
  pageKey,
  hasPointPassword,
  socialNaverLinked,
  setSocialNaverLinked,
  socialKakaoLinked,
  setSocialKakaoLinked,
  socialGoogleLinked,
  setSocialGoogleLinked,
}: UsePreferencesSectionOptions) {
  const [marketingPolicyAgreed, setMarketingPolicyAgreed] = useState(false);
  const [marketingEmailAgreed, setMarketingEmailAgreed] = useState(false);
  const [marketingSmsAgreed, setMarketingSmsAgreed] = useState(false);
  const [marketingPushAgreed, setMarketingPushAgreed] = useState(false);
  const [preferredTheaterId, setPreferredTheaterId] = useState("");
  const [preferredTheaterName, setPreferredTheaterName] = useState("");
  const [availableMovieVoucherCount, setAvailableMovieVoucherCount] = useState(0);
  const [availableCouponCount, setAvailableCouponCount] = useState(0);
  const [savedPreferences, setSavedPreferences] = useState<PreferenceSnapshot | null>(null);

  useEffect(() => {
    const savedPreferencesRaw = localStorage.getItem(`mypage-preferences-${memberId}`);

    if (!savedPreferencesRaw) {
      setSavedPreferences(emptySnapshot);
      return;
    }

    try {
      const parsed = JSON.parse(savedPreferencesRaw);
      const legacyPreferredCinemas = Array.isArray(parsed.preferredCinemas) ? parsed.preferredCinemas : [];
      const firstLegacyTheater =
        legacyPreferredCinemas.find((value: unknown) => typeof value === "string" && value.trim()) ?? "";
      const nextSnapshot = {
        marketingPolicyAgreed: Boolean(parsed.marketingPolicyAgreed),
        marketingEmailAgreed: Boolean(parsed.marketingEmailAgreed),
        marketingSmsAgreed: Boolean(parsed.marketingSmsAgreed),
        marketingPushAgreed: Boolean(parsed.marketingPushAgreed),
        preferredTheaterId: String(parsed.preferredTheaterId ?? firstLegacyTheater ?? ""),
        hasPointPassword: Boolean(parsed.hasPointPassword),
        socialNaverLinked: Boolean(parsed.socialNaverLinked),
        socialKakaoLinked: Boolean(parsed.socialKakaoLinked),
        socialGoogleLinked: Boolean(parsed.socialGoogleLinked),
      };

      setMarketingPolicyAgreed(nextSnapshot.marketingPolicyAgreed);
      setMarketingEmailAgreed(nextSnapshot.marketingEmailAgreed);
      setMarketingSmsAgreed(nextSnapshot.marketingSmsAgreed);
      setMarketingPushAgreed(nextSnapshot.marketingPushAgreed);
      setPreferredTheaterId(nextSnapshot.preferredTheaterId);
      setSocialNaverLinked(nextSnapshot.socialNaverLinked);
      setSocialKakaoLinked(nextSnapshot.socialKakaoLinked);
      setSocialGoogleLinked(nextSnapshot.socialGoogleLinked);
      setSavedPreferences(nextSnapshot);
    } catch {
      setSavedPreferences(emptySnapshot);
    }
  }, [memberId, setSocialGoogleLinked, setSocialKakaoLinked, setSocialNaverLinked]);

  useEffect(() => {
    if (!preferredTheaterId) {
      setPreferredTheaterName("");
      return;
    }

    let mounted = true;

    ticketingApi
      .getTheaters()
      .then((response) => {
        if (!mounted) return;
        const target = (response.data ?? []).find((theater) => String(theater.id) === String(preferredTheaterId));
        setPreferredTheaterName(target?.name ?? "");
      })
      .catch(() => {
        if (!mounted) return;
        setPreferredTheaterName("");
      });

    return () => {
      mounted = false;
    };
  }, [preferredTheaterId]);

  useEffect(() => {
    if (pageKey !== "dashboard") return;
    if (memberId <= 0) {
      setAvailableMovieVoucherCount(0);
      setAvailableCouponCount(0);
      return;
    }

    let mounted = true;

    Promise.all([getMyVouchers(memberId, "MOVIE", "AVAILABLE"), getMyCoupons(memberId)])
      .then(([movieRows, couponRows]) => {
        if (!mounted) return;
        setAvailableMovieVoucherCount(movieRows.length);
        setAvailableCouponCount(
          couponRows.filter((coupon) => String(coupon.status).toUpperCase() === "AVAILABLE").length
        );
      })
      .catch(() => {
        if (!mounted) return;
        setAvailableMovieVoucherCount(0);
        setAvailableCouponCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [memberId, pageKey]);

  const resetPreferences = () => {
    const snapshot = savedPreferences ?? emptySnapshot;
    setMarketingPolicyAgreed(snapshot.marketingPolicyAgreed);
    setMarketingEmailAgreed(snapshot.marketingEmailAgreed);
    setMarketingSmsAgreed(snapshot.marketingSmsAgreed);
    setMarketingPushAgreed(snapshot.marketingPushAgreed);
    setPreferredTheaterId(snapshot.preferredTheaterId);
    setSocialNaverLinked(snapshot.socialNaverLinked);
    setSocialKakaoLinked(snapshot.socialKakaoLinked);
    setSocialGoogleLinked(snapshot.socialGoogleLinked);
  };

  const submitPreferences = () => {
    const nextSnapshot: PreferenceSnapshot = {
      marketingPolicyAgreed,
      marketingEmailAgreed,
      marketingSmsAgreed,
      marketingPushAgreed,
      preferredTheaterId,
      hasPointPassword,
      socialNaverLinked,
      socialKakaoLinked,
      socialGoogleLinked,
    };

    setSavedPreferences(nextSnapshot);
    localStorage.setItem(
      `mypage-preferences-${memberId}`,
      JSON.stringify({
        ...nextSnapshot,
        preferredCinemas: nextSnapshot.preferredTheaterId ? [nextSnapshot.preferredTheaterId] : [],
      })
    );
    alert("선호정보가 저장되었습니다.");
  };

  return {
    marketingPolicyAgreed,
    setMarketingPolicyAgreed,
    marketingEmailAgreed,
    setMarketingEmailAgreed,
    marketingSmsAgreed,
    setMarketingSmsAgreed,
    marketingPushAgreed,
    setMarketingPushAgreed,
    preferredTheaterId,
    setPreferredTheaterId,
    preferredTheaterName,
    availableMovieVoucherCount,
    availableCouponCount,
    resetPreferences,
    submitPreferences,
  };
}
