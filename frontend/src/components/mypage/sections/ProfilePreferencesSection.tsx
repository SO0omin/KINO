import { useEffect, useMemo, useState } from "react";
import { ticketingApi } from "../../../api/ticketingApi";
import type { Theater } from "../../../types/ticketing";

type ProfilePreferencesSectionProps = {
  marketingPolicyAgreed: boolean;
  setMarketingPolicyAgreed: (value: boolean) => void;
  marketingEmailAgreed: boolean;
  setMarketingEmailAgreed: (value: boolean) => void;
  marketingSmsAgreed: boolean;
  setMarketingSmsAgreed: (value: boolean) => void;
  marketingPushAgreed: boolean;
  setMarketingPushAgreed: (value: boolean) => void;
  preferredTheaterId: string;
  setPreferredTheaterId: (value: string) => void;
  onReset: () => void;
  onSubmit: () => void;
};

export function ProfilePreferencesSection({
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
  onReset,
  onSubmit,
}: ProfilePreferencesSectionProps) {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [theaterLoading, setTheaterLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setTheaterLoading(true);
    ticketingApi
      .getTheaters()
      .then((response) => {
        if (!mounted) return;
        setTheaters(response.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setTheaters([]);
      })
      .finally(() => {
        if (!mounted) return;
        setTheaterLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const theaterOptions = useMemo(
    () => [...theaters].sort((a, b) => a.name.localeCompare(b.name, "ko-KR")),
    [theaters]
  );

  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">선호정보 수정</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h3 className="text-xl font-semibold text-[#1A1A1A]">마케팅 활용을 위한 개인정보 수집 이용 안내</h3>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="radio" checked={!marketingPolicyAgreed} onChange={() => setMarketingPolicyAgreed(false)} />미동의</label>
            <label className="flex items-center gap-1"><input type="radio" checked={marketingPolicyAgreed} onChange={() => setMarketingPolicyAgreed(true)} />동의</label>
          </div>
        </div>
        <div className="px-6 py-5 text-sm leading-7 text-black/65">
          <p>[수집 목적]</p>
          <p>고객 맞춤형 상품 및 서비스 추천, 이벤트/사은/할인 정보 안내</p>
          <p className="mt-2">[수집 항목]</p>
          <p>이메일, 휴대폰번호, 주소, 생년월일, 선호극장, 문자/이메일/앱푸시 수신동의여부</p>
          <p className="mt-2">[보유 및 이용 기간]</p>
          <p>회원 탈퇴 시 혹은 이용 목적 달성 시까지</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-black/10 px-6 py-5 text-xl font-semibold text-[#1A1A1A]">마케팅정보 수신동의</div>
        <div className="px-6 py-5 text-sm text-black/65">
          <p>거래정보와 관련된 내용(예매완료/취소)과 소멸포인트 안내는 수신동의 여부와 관계없이 발송됩니다.</p>
          <p className="mt-1">· 수신동의 여부를 선택해 주세요.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">이메일</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingEmailAgreed} onChange={() => setMarketingEmailAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingEmailAgreed} onChange={() => setMarketingEmailAgreed(false)} />수신거부</label>
            </div>
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">SMS</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingSmsAgreed} onChange={() => setMarketingSmsAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingSmsAgreed} onChange={() => setMarketingSmsAgreed(false)} />수신거부</label>
            </div>
            <div className="flex items-center gap-5">
              <span className="w-20 font-semibold">PUSH</span>
              <label className="flex items-center gap-1"><input type="radio" checked={marketingPushAgreed} onChange={() => setMarketingPushAgreed(true)} />수신동의</label>
              <label className="flex items-center gap-1"><input type="radio" checked={!marketingPushAgreed} onChange={() => setMarketingPushAgreed(false)} />수신거부</label>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-4xl font-semibold tracking-tight text-[#B91C1C]">부가정보</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-black/10 bg-[#FDFDFD] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[170px_1fr] border-b border-black/10">
          <div className="px-6 py-4 text-base font-semibold text-[#1A1A1A]">선호극장</div>
          <div className="space-y-3 px-4 py-4">
            <p className="text-sm text-black/50">선호 극장은 1개만 선택할 수 있습니다.</p>
            <select
              className="h-11 w-[320px] rounded-sm border border-black/10 bg-white px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#B91C1C]"
              value={preferredTheaterId}
              onChange={(e) => setPreferredTheaterId(e.target.value)}
              disabled={theaterLoading}
            >
              <option value="">선호극장을 선택하세요</option>
              {theaterOptions.map((theater) => (
                <option key={theater.id} value={String(theater.id)}>
                  {theater.name}
                </option>
              ))}
            </select>
            {theaterLoading && <p className="text-xs text-black/35">극장 목록을 불러오는 중...</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded-sm border border-[#B91C1C] px-8 py-3 text-base font-semibold text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
          onClick={onReset}
        >
          취소
        </button>
        <button
          className="rounded-sm bg-[#B91C1C] px-8 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(185,28,28,0.18)] transition-colors hover:bg-[#991B1B]"
          onClick={onSubmit}
        >
          수정
        </button>
      </div>
    </section>
  );
}
