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
    <div className="border-y border-[#000000] bg-[#ffffff]">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-2 px-4 text-sm text-gray-500">
        <button type="button" onClick={() => onMoveMenu?.("/mypage")} className="text-gray-500 hover:text-gray-700">
          <Home className="h-4 w-4" />
        </button>
        {crumbs.map((crumb, index) => (
          <div key={`${crumb}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <button
              type="button"
              onClick={() => goToCrumb(crumb)}
              className={`${index === crumbs.length - 1 ? "text-gray-700" : ""} hover:text-gray-700`}
            >
              {crumb}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
