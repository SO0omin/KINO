import { ChevronRight } from "lucide-react";
import type { MyPageSummary, MyReservationItem } from "../../../api/myPageApi";

type DashboardSectionProps = {
  summary: MyPageSummary | null;
  preferredTheaterName: string;
  availableMovieVoucherCount: number;
  availableCouponCount: number;
  activeReservations: MyReservationItem[];
  recentPaidPurchases: MyReservationItem[];
  locationSearch: string;
  moveMenu: (path: string) => void;
  navigate: (path: string) => void;
  formatDateTime: (value: string) => string;
  formatMoney: (value: number) => string;
};

function EmptyLine({ message }: { message: string }) {
  return <div className="py-10 text-center text-base text-gray-300">{message}</div>;
}

export function DashboardSection({
  summary,
  preferredTheaterName,
  availableMovieVoucherCount,
  availableCouponCount,
  activeReservations,
  recentPaidPurchases,
  locationSearch,
  moveMenu,
  navigate,
  formatDateTime,
  formatMoney,
}: DashboardSectionProps) {
  const cardClass = "rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl";
  const tierSteps = ["WELCOME", "FRIENDS", "VIP", "VVIP", "MVIP"] as const;
  const currentTier = (summary?.pointTier ?? "WELCOME").toUpperCase();
  const currentTierIndex = Math.max(0, tierSteps.indexOf(currentTier as (typeof tierSteps)[number]));
  const nextTier = summary?.nextPointTier;
  const pointsToNextTier = summary?.pointsToNextTier ?? 0;

  return (
    <>
      <section className="overflow-hidden rounded-sm border border-black/5 bg-[#1A1A1A] text-white shadow-2xl">
        <div className="bg-[#1A1A1A] px-8 py-9">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-[#B91C1C] text-2xl font-bold text-white">
                {summary?.profileImage && summary.profileImage !== "default" ? (
                  <img src={summary.profileImage} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white-600">K</div>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#B91C1C]">Kino Membership</p>
                <h1 className="mt-3 text-4xl font-semibold leading-none tracking-tight">안녕하세요!</h1>
                <p className="mt-3 font-display text-5xl font-semibold leading-none tracking-tight text-[#B91C1C]">
                  {(summary?.availablePoints ?? 0).toLocaleString()} P
                </p>
                <p className="mt-4 text-base font-semibold text-white/85">{summary?.memberName ?? "회원"}님</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                현재등급 <span className="font-semibold text-[#B91C1C]">{currentTier}</span>
              </p>
              {nextTier ? (
                <div className="mt-3 inline-block rounded-sm bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white">
                  다음 {nextTier} 등급까지 {pointsToNextTier.toLocaleString()} P 남았어요!
                </div>
              ) : (
                <div className="mt-3 inline-block rounded-sm bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white">
                  최고 등급을 달성했어요!
                </div>
              )}
              <div className="mt-5 flex items-center justify-end gap-5 text-sm">
                {tierSteps.map((label, index) => (
                  <div key={label} className="flex items-center gap-2 text-white/85">
                    <span className={`h-3 w-3 rounded-full ${index === currentTierIndex ? "bg-[#B91C1C]" : "bg-white"}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-0 border-t border-white/10 bg-[#FDFDFD] text-[#1A1A1A] lg:grid-cols-3">
          <button type="button" className="p-5 text-left transition-colors hover:bg-white" onClick={() => moveMenu("/mypage/points")}>
            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#B91C1C]">
              <span>포인트 이용내역</span>
              <ChevronRight className="h-5 w-5 text-black/25" />
            </div>
            <p className="text-sm text-black/65">적립예정 <span className="float-right font-semibold text-[#1A1A1A]">{(summary?.pendingPoints ?? 0).toLocaleString()} P</span></p>
            <p className="mt-2 text-sm text-black/65">당월소멸예정 <span className="float-right font-semibold text-[#1A1A1A]">{(summary?.expiringPointsThisMonth ?? 0).toLocaleString()} P</span></p>
          </button>
          <button type="button" className="p-5 text-left transition-colors hover:bg-white" onClick={() => moveMenu("/mypage/profile/preferences")}>
            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#B91C1C]">
              <span>선호하는 극장</span>
              <ChevronRight className="h-5 w-5 text-black/25" />
            </div>
            {preferredTheaterName ? (
              <p className="font-medium text-[#B91C1C]">{preferredTheaterName}</p>
            ) : (
              <>
                <p className="font-medium text-[#B91C1C]">선호극장</p>
                <p className="text-black/65">을 설정하세요.</p>
              </>
            )}
          </button>
          <button type="button" className="p-5 text-left transition-colors hover:bg-white" onClick={() => moveMenu("/mypage/vouchers/movie")}>
            <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#B91C1C]">
              <span>관람권/쿠폰</span>
              <ChevronRight className="h-5 w-5 text-black/25" />
            </div>
            <p className="text-sm text-black/65">영화관람권 <span className="float-right font-semibold text-[#1A1A1A]">{availableMovieVoucherCount} 매</span></p>
            <p className="mt-2 text-sm text-black/65">할인/제휴쿠폰 <span className="float-right font-semibold text-[#1A1A1A]">{availableCouponCount} 매</span></p>
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4">
        <div className={cardClass}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-2xl font-semibold tracking-tight text-[#B91C1C]">나의 무비스토리</h3>
            <button
              className="rounded-sm border border-black/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
              onClick={() => {
                const params = new URLSearchParams(locationSearch);
                params.set("movieTab", "watched");
                navigate(`/mypage/movie-story?${params.toString()}`);
              }}
            >
              본 영화 등록
            </button>
          </div>
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-semibold tracking-tight text-[#B91C1C]">{summary?.paidReservationCount ?? 0}</p>
              <p className="text-sm text-black/65">본 영화</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tracking-tight text-[#B91C1C]">{summary?.reviewCount ?? 0}</p>
              <p className="text-sm text-black/65">관람평</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tracking-tight text-[#B91C1C]">{summary?.likedMovieCount ?? 0}</p>
              <p className="text-sm text-black/65">보고싶어</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-4">
          <h3 className="text-3xl font-semibold tracking-tight text-[#B91C1C]">나의 예매내역</h3>
          <button className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-[#B91C1C]" onClick={() => moveMenu("/mypage/reservations")}>
            더보기 <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        {activeReservations.length === 0 ? <EmptyLine message="예매 내역이 없습니다." /> : (
          <div className="divide-y">
            {activeReservations.slice(0, 2).map((item) => (
              <div key={item.reservationId} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[#1A1A1A]">{item.movieTitle}</p>
                  <p className="text-sm text-black/55">{item.theaterName} · {formatDateTime(item.startTime)} · 좌석 {item.seatNames.join(", ") || "-"}</p>
                </div>
                <p className="text-lg font-semibold text-[#1A1A1A]">{formatMoney(item.finalAmount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-4">
          <h3 className="text-3xl font-semibold tracking-tight text-[#B91C1C]">나의 구매내역</h3>
          <button
            className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-[#B91C1C]"
            onClick={() => {
              const params = new URLSearchParams(locationSearch);
              params.set("tab", "purchase");
              navigate(`/mypage/reservations?${params.toString()}`);
            }}
          >
            더보기 <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        {recentPaidPurchases.length === 0 ? <EmptyLine message="구매내역이 없습니다." /> : (
          <div className="divide-y">
            {recentPaidPurchases.map((item) => (
              <div key={item.reservationId} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[#1A1A1A]">{item.movieTitle}</p>
                  <p className="text-sm text-black/55">{item.theaterName} · 결제일시 {formatDateTime(item.paidAt ?? item.startTime)}</p>
                </div>
                <p className="text-lg font-semibold text-[#1A1A1A]">{formatMoney(item.finalAmount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
