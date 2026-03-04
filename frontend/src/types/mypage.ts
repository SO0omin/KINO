export type PageKey =
  | "dashboard"
  | "reservations"
  | "vouchers-movie"
  | "vouchers-store"
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
  "/my-page": "dashboard",
  "/my-page/reservations": "reservations",
  "/my-page/vouchers": "vouchers-movie",
  "/my-page/vouchers/movie": "vouchers-movie",
  "/my-page/vouchers/store": "vouchers-store",
  "/my-page/coupons": "coupons",
  "/my-page/points": "points",
  "/my-page/point-password": "point-password",
  "/my-page/movie-story": "movie-story",
  "/my-page/cards": "cards",
  "/my-page/profile": "profile",
  "/my-page/profile/preferences": "profile-preferences",
};

export const MENU_CONFIG: MenuItem[] = [
  { label: "예매/구매내역", key: "reservations", path: "/my-page/reservations" },
  {
    label: "영화/스토어 관람권",
    key: "vouchers",
    path: "/my-page/vouchers/movie",
    children: [
      { label: "영화관람권", path: "/my-page/vouchers/movie" },
      { label: "스토어 교환권", path: "/my-page/vouchers/store" },
    ],
  },
  { label: "메가박스/제휴쿠폰", key: "coupons", path: "/my-page/coupons" },
  {
    label: "멤버십 포인트",
    key: "points",
    path: "/my-page/points",
    children: [
      { label: "포인트 이용내역", path: "/my-page/points" },
      { label: "멤버십 카드관리", path: "/my-page/cards" },
    ],
  },
  { label: "나의 무비스토리", key: "movie-story", path: "/my-page/movie-story" },
  { label: "자주쓰는 카드 관리", key: "cards", path: "/my-page/cards" },
];

export function breadcrumbLabels(pageKey: PageKey): string[] {
  if (pageKey === "dashboard") return ["나의 메가박스"];

  const byPage: Record<PageKey, string[]> = {
    dashboard: ["나의 메가박스"],
    reservations: ["나의 메가박스", "예매/구매내역", "예매내역"],
    "vouchers-movie": ["나의 메가박스", "영화/스토어 관람권", "영화관람권"],
    "vouchers-store": ["나의 메가박스", "영화/스토어 관람권", "스토어 교환권"],
    coupons: ["나의 메가박스", "메가박스/제휴쿠폰", "메가박스 쿠폰"],
    points: ["나의 메가박스", "멤버십 포인트", "포인트 이용내역"],
    "movie-story": ["나의 메가박스", "나의 무비스토리", "무비타임라인"],
    cards: ["나의 메가박스", "멤버십 포인트", "멤버십 카드관리"],
    "point-password": ["나의 메가박스", "멤버십 포인트", "포인트 비밀번호 설정"],
    profile: ["나의 메가박스", "회원정보", "개인정보 수정"],
    "profile-preferences": ["나의 메가박스", "회원정보", "선호정보 수정"],
  };

  return byPage[pageKey];
}
