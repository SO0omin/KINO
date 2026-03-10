import { ChevronRight, Home } from "lucide-react";

type BreadcrumbBarProps = {
  crumbs: string[];
  onMoveMenu?: (path: string) => void;
};

const CRUMB_PATH_MAP: Record<string, string> = {
  "나의 키노": "/mypage",
  "예매/구매내역": "/mypage/reservations",
  "예매내역": "/mypage/reservations",
  "영화 관람권": "/mypage/vouchers/movie",
  "영화관람권": "/mypage/vouchers/movie",
  "키노/제휴쿠폰": "/mypage/coupons",
  "키노 쿠폰": "/mypage/coupons",
  "멤버십 포인트": "/mypage/points",
  "포인트 이용내역": "/mypage/points",
  "멤버십 카드관리": "/mypage/cards",
  "나의 무비스토리": "/mypage/movie-story",
  "무비타임라인": "/mypage/movie-story",
  "회원정보": "/mypage/profile",
  "개인정보 수정": "/mypage/profile",
  "선호정보 수정": "/mypage/profile/preferences",
  "포인트 비밀번호 설정": "/mypage/point-password",
};

export function BreadcrumbBar({ crumbs, onMoveMenu }: BreadcrumbBarProps) {
  const goToCrumb = (label: string) => {
    const path = CRUMB_PATH_MAP[label];
    if (!path || !onMoveMenu) return;
    onMoveMenu(path);
  };

  return (
    <div className="border-b border-black/10 bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-2 px-6 text-[11px] font-bold uppercase tracking-[0.22em] text-black/30">
        <button
          type="button"
          onClick={() => onMoveMenu?.("/mypage")}
          className="text-black/30 transition-colors hover:text-[#B91C1C]"
        >
          <Home className="h-4 w-4" />
        </button>
        {crumbs.map((crumb, index) => (
          <div key={`${crumb}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-black/20" />
            <button
              type="button"
              onClick={() => goToCrumb(crumb)}
              className={`${index === crumbs.length - 1 ? "text-[#1A1A1A]" : "text-black/35"} transition-colors hover:text-[#B91C1C]`}
            >
              {crumb}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
