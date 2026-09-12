export type PageKey =
  | "dashboard"
  | "reservations"
  | "vouchers-movie"
  | "coupons"
  | "points"
  | "movie-story"
  | "cards"
  | "point-password"
  | "profile"
  | "profile-preferences";

export type MenuChild = {
  label: string;
  path: string;
};

export type MenuItem = {
  label: string;
  key: Exclude<PageKey, "dashboard"> | "vouchers";
  path: string;
  children?: MenuChild[];
};

export const PATH_TO_KEY: Record<string, PageKey> = {
  "/mypage": "dashboard",
  "/mypage/reservations": "reservations",
  "/mypage/vouchers": "vouchers-movie",
  "/mypage/vouchers/movie": "vouchers-movie",
  "/mypage/coupons": "coupons",
  "/mypage/points": "points",
  "/mypage/point-password": "point-password",
  "/mypage/movie-story": "movie-story",
  "/mypage/cards": "cards",
  "/mypage/profile": "profile",
  "/mypage/profile/preferences": "profile-preferences",
};

export const MENU_CONFIG: MenuItem[] = [
  { label: "예매/구매내역", key: "reservations", path: "/mypage/reservations" },
  {
    label: "영화 관람권",
    key: "vouchers",
    path: "/mypage/vouchers/movie",
    children: [
      { label: "영화관람권", path: "/mypage/vouchers/movie" },
    ],
  },
  { label: "키노/제휴쿠폰", key: "coupons", path: "/mypage/coupons" },
  {
    label: "멤버십 포인트",
    key: "points",
    path: "/mypage/points",
    children: [
      { label: "포인트 이용내역", path: "/mypage/points" },
      { label: "멤버십 카드관리", path: "/mypage/cards" },
    ],
  },
  { label: "나의 무비스토리", key: "movie-story", path: "/mypage/movie-story" },
];

export function breadcrumbLabels(pageKey: PageKey): string[] {
  if (pageKey === "dashboard") return ["나의 키노"];

  const byPage: Record<PageKey, string[]> = {
    dashboard: ["나의 키노"],
    reservations: ["나의 키노", "예매/구매내역", "예매내역"],
    "vouchers-movie": ["나의 키노", "영화 관람권", "영화관람권"],
    coupons: ["나의 키노", "키노/제휴쿠폰", "키노 쿠폰"],
    points: ["나의 키노", "멤버십 포인트", "포인트 이용내역"],
    "movie-story": ["나의 키노", "나의 무비스토리", "무비타임라인"],
    cards: ["나의 키노", "멤버십 포인트", "멤버십 카드관리"],
    "point-password": ["나의 키노", "멤버십 포인트", "포인트 비밀번호 설정"],
    profile: ["나의 키노", "회원정보", "개인정보 수정"],
    "profile-preferences": ["나의 키노", "회원정보", "선호정보 수정"],
  };

  return byPage[pageKey];
}
