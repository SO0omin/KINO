import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Search } from "lucide-react";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import {
  cancelReservation,
  getMyPageSummary,
  getMyReservations,
  type MyPageSummary,
  type MyReservationItem,
} from "../api/myPageApi";

type PageKey =
  | "dashboard"
  | "reservations"
  | "vouchers"
  | "coupons"
  | "points"
  | "movie-story"
  | "events"
  | "inquiries"
  | "payments"
  | "cards";

const PATH_TO_KEY: Record<string, PageKey> = {
  "/my-page": "dashboard",
  "/my-page/reservations": "reservations",
  "/my-page/vouchers": "vouchers",
  "/my-page/coupons": "coupons",
  "/my-page/points": "points",
  "/my-page/movie-story": "movie-story",
  "/my-page/events": "events",
  "/my-page/inquiries": "inquiries",
  "/my-page/payments": "payments",
  "/my-page/cards": "cards",
};

type MenuChild = {
  label: string;
  path: string;
};

type MenuItem = {
  label: string;
  key: Exclude<PageKey, "dashboard">;
  path: string;
  children?: MenuChild[];
};

const MENU_CONFIG: MenuItem[] = [
  { label: "예매/구매내역", key: "reservations", path: "/my-page/reservations" },
  {
    label: "영화/스토어 관람권",
    key: "vouchers",
    path: "/my-page/vouchers",
    children: [
      { label: "영화관람권", path: "/my-page/vouchers" },
      { label: "스토어 교환권", path: "/my-page/vouchers" },
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
      { label: "MiL.k 포인트", path: "/my-page/points" },
    ],
  },
  { label: "나의 무비스토리", key: "movie-story", path: "/my-page/movie-story" },
  { label: "나의 이벤트 응모내역", key: "events", path: "/my-page/events" },
  { label: "나의 문의내역", key: "inquiries", path: "/my-page/inquiries" },
  { label: "중앙페이 결제수단 관리", key: "payments", path: "/my-page/payments" },
  { label: "자주쓰는 카드 관리", key: "cards", path: "/my-page/cards" },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number) {
  return `${value.toLocaleString()}원`;
}

function splitReservations(items: MyReservationItem[]) {
  const active = items.filter((item) => item.paymentStatus !== "CANCELLED");
  const cancelled = items.filter((item) => item.paymentStatus === "CANCELLED");
  return { active, cancelled };
}

function breadcrumbLabels(pageKey: PageKey) {
  if (pageKey === "dashboard") return ["나의 메가박스"];
  const byPage: Record<PageKey, string[]> = {
    dashboard: ["나의 메가박스"],
    reservations: ["나의 메가박스", "예매/구매내역", "예매내역"],
    vouchers: ["나의 메가박스", "영화/스토어 관람권", "영화관람권"],
    coupons: ["나의 메가박스", "메가박스/제휴쿠폰", "메가박스 쿠폰"],
    points: ["나의 메가박스", "멤버십 포인트", "포인트 이용내역"],
    "movie-story": ["나의 메가박스", "나의 무비스토리", "무비타임라인"],
    events: ["나의 메가박스", "나의 이벤트 응모내역"],
    inquiries: ["나의 메가박스", "나의 문의내역", "1:1 문의내역"],
    payments: ["나의 메가박스", "중앙페이 결제수단 관리"],
    cards: ["나의 메가박스", "멤버십 포인트", "멤버십 카드관리"],
  };
  return byPage[pageKey];
}

function EmptyLine({ message }: { message: string }) {
  return <div className="py-10 text-center text-base text-gray-300">{message}</div>;
}

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const memberId = useMemo(() => {
    const q = new URLSearchParams(location.search).get("memberId");
    return Number(q || 1);
  }, [location.search]);

  const pageKey = PATH_TO_KEY[location.pathname] ?? "dashboard";

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryData, reservationData] = await Promise.all([
        getMyPageSummary(memberId),
        getMyReservations(memberId),
      ]);
      setSummary(summaryData);
      setReservations(reservationData);
    } catch (error: any) {
      alert(error?.message ?? "마이페이지 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [memberId]);

  const handleCancel = async (reservationId: number) => {
    const ok = window.confirm("해당 예매를 환불(취소)하시겠습니까?");
    if (!ok) return;

    setIsCancelling(reservationId);
    try {
      await cancelReservation(memberId, reservationId);
      await load();
      alert("환불(취소) 처리가 완료되었습니다.");
    } catch (error: any) {
      alert(error?.message ?? "환불 처리 중 오류가 발생했습니다.");
    } finally {
      setIsCancelling(null);
    }
  };

  const moveMenu = (path: string) => {
    navigate(`${path}${location.search || ""}`);
  };

  const { active: activeReservations, cancelled: cancelledReservations } = splitReservations(reservations);
  const crumbs = breadcrumbLabels(pageKey);

  const renderDashboard = () => {
    const cardClass = "rounded-sm border border-gray-200 bg-white p-5";

    return (
      <>
        <section className="overflow-hidden rounded-md border border-[#000000] bg-[#000000] text-[#ffffff]">
          <div className="bg-[#000000] px-8 py-9">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#eb4d32] text-2xl font-bold">W</div>
                <div>
                  <h1 className="text-3xl font-semibold leading-none">안녕하세요!</h1>
                  <p className="mt-2 text-3xl font-semibold leading-none">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
                  <p className="mt-3 text-base font-semibold">{summary?.memberName ?? "회원"}님</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">현재등급 <span className="font-semibold text-[#eb4d32]">WELCOME</span></p>
                <div className="mt-3 inline-block rounded bg-[#eb4d32] px-4 py-1 text-sm font-semibold text-[#ffffff]">
                  다음 Friends 등급까지 6,000 P 남았어요!
                </div>
                <div className="mt-4 flex items-center justify-end gap-5 text-sm">
                  {["Welcome", "Friends", "VIP", "VVIP", "MVIP"].map((label, index) => (
                    <div key={label} className="flex items-center gap-2 text-white/85">
                      <span className={`h-3 w-3 rounded-full ${index === 0 ? "bg-[#eb4d32]" : "bg-[#ffffff]"}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 border-t border-[#000000] bg-[#ffffff] text-[#000000] lg:grid-cols-4">
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>포인트 이용내역</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm">적립예정 <span className="float-right font-semibold">0 P</span></p>
              <p className="mt-2 text-sm">당월소멸예정 <span className="float-right font-semibold">0 P</span></p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>선호하는 극장</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-[#eb4d32]">선호극장</p>
              <p>을 설정하세요.</p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>관람권/쿠폰</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm">영화관람권 <span className="float-right font-semibold">0 매</span></p>
              <p className="mt-2 text-sm">스토어교환권 <span className="float-right font-semibold">0 매</span></p>
              <p className="mt-2 text-sm">할인/제휴쿠폰 <span className="float-right font-semibold">{summary?.availableCouponCount ?? 0} 매</span></p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#eb4d32]">
                <span>클럽 멤버십</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <p>특별한 멤버십 혜택을 만나보세요!</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#eb4d32]">나의 무비스토리</h3>
              <button className="rounded border border-gray-300 px-4 py-1 text-sm">본 영화 등록</button>
            </div>
            <div className="grid grid-cols-3 text-center">
              <div>
                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.paidReservationCount ?? 0}</p>
                <p className="text-sm">본 영화</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.reviewCount ?? 0}</p>
                <p className="text-sm">관람평</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#eb4d32]">{summary?.likedMovieCount ?? 0}</p>
                <p className="text-sm">보고싶어</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#eb4d32]">선호관람정보</h3>
              <button className="rounded border border-gray-300 px-4 py-1 text-sm">설정</button>
            </div>
            <div className="space-y-4 text-base text-[#eb4d32]">
              <p>· 내 선호장르</p>
              <p>· 내 선호시간</p>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-sm border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
            <h3 className="text-2xl font-semibold text-[#eb4d32]">나의 예매내역</h3>
            <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/reservations")}>더보기 <ChevronRight className="h-5 w-5" /></button>
          </div>
          {activeReservations.length === 0 ? <EmptyLine message="예매 내역이 없습니다." /> : (
            <div className="divide-y">
              {activeReservations.slice(0, 2).map((item) => (
                <div key={item.reservationId} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{item.movieTitle}</p>
                    <p className="text-sm text-gray-600">{item.theaterName} · {formatDateTime(item.startTime)} · 좌석 {item.seatNames.join(", ") || "-"}</p>
                  </div>
                  <p className="font-semibold">{formatMoney(item.finalAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-sm border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
            <h3 className="text-2xl font-semibold text-[#eb4d32]">나의 구매내역</h3>
            <button className="flex items-center gap-1 text-base text-gray-600">더보기 <ChevronRight className="h-5 w-5" /></button>
          </div>
          <EmptyLine message="구매내역이 없습니다." />
        </section>

        <section className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-sm border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
              <h3 className="text-2xl font-semibold text-[#eb4d32]">참여이벤트</h3>
              <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/events")}>더보기 <ChevronRight className="h-5 w-5" /></button>
            </div>
            <EmptyLine message="참여한 이벤트가 없습니다." />
          </div>
          <div className="rounded-sm border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-3">
              <h3 className="text-2xl font-semibold text-[#eb4d32]">문의내역</h3>
              <button className="flex items-center gap-1 text-base text-gray-600" onClick={() => moveMenu("/my-page/inquiries")}>더보기 <ChevronRight className="h-5 w-5" /></button>
            </div>
            <EmptyLine message="문의내역이 없습니다." />
          </div>
        </section>
      </>
    );
  };

  const renderReservations = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">예매/구매 내역</h1>

      <div className="mt-5 flex border-b border-gray-300">
        <button className="w-40 border border-b-0 border-[#000000] bg-[#000000] px-4 py-2 text-[#ffffff]">예매</button>
        <button className="w-40 border border-b-0 border-gray-300 bg-white px-4 py-2 text-gray-500">구매</button>
      </div>

      <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-semibold">구분</span>
          <label className="flex items-center gap-2"><input type="radio" checked readOnly /> 예매내역</label>
          <label className="flex items-center gap-2"><input type="radio" readOnly /> 지난내역</label>
          <select className="rounded border border-gray-300 bg-white px-3 py-2 text-sm">
            <option>2026년 2월</option>
          </select>
          <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm"><Search className="h-4 w-4" /> 조회</button>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-gray-500">불러오는 중...</div>
        ) : activeReservations.length === 0 ? (
          <div className="py-12 text-center text-gray-500">예매 내역이 없습니다.</div>
        ) : (
          <div className="divide-y">
            {activeReservations.map((item) => (
              <div key={item.reservationId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold">{item.movieTitle}</p>
                  <p className="text-sm text-gray-600">{item.theaterName} / {item.screenName}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(item.startTime)}</p>
                  <p className="text-sm text-gray-600">좌석: {item.seatNames.join(", ") || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(item.finalAmount)}</p>
                  {item.cancellable ? (
                    <button
                      className="mt-2 rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32]"
                      disabled={isCancelling === item.reservationId}
                      onClick={() => handleCancel(item.reservationId)}
                    >
                      {isCancelling === item.reservationId ? "처리 중..." : "환불하기"}
                    </button>
                  ) : (
                    <span className="mt-2 inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-500">환불 불가</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-[#eb4d32]">예매취소내역</h2>
        <p className="mt-2 text-sm text-gray-600">· 상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
        <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-white">
          <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
            <span>취소일시</span>
            <span>영화명</span>
            <span>극장</span>
            <span>상영일시</span>
            <span>취소금액</span>
          </div>
          {cancelledReservations.length === 0 ? (
            <div className="py-6 text-center text-gray-500">취소내역이 없습니다.</div>
          ) : (
            cancelledReservations.map((item) => (
              <div key={item.reservationId} className="grid grid-cols-5 px-4 py-3 text-center text-sm border-t">
                <span>{formatDateTime(item.startTime)}</span>
                <span>{item.movieTitle}</span>
                <span>{item.theaterName}</span>
                <span>{formatDateTime(item.startTime)}</span>
                <span>{formatMoney(item.finalAmount)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3">이용안내</div>
    </section>
  );

  const renderVouchers = () => (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-[#000000]">영화관람권</h1>
          <p className="mt-5 text-sm text-gray-600">· 보유하신 영화관람권/예매권 내역입니다.</p>
          <p className="text-sm text-gray-600">· 소지하신 지류(종이)관람권은 등록 후 이용하실 수 있습니다.</p>
        </div>
        <button className="rounded border border-[#eb4d32] px-5 py-3 text-sm text-[#eb4d32]">관람권등록</button>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-lg font-semibold">총 <span className="text-[#eb4d32]">0</span>매</p>
        <select className="rounded border border-gray-300 px-4 py-2 text-sm"><option>사용가능</option></select>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-3 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>관람권명</span>
          <span>유효기간</span>
          <span>사용상태</span>
        </div>
        <div className="py-8 text-center text-gray-500">조회된 관람권 내역이 없습니다.</div>
      </div>

      <div className="mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3">이용안내</div>
    </section>
  );

  const renderCoupons = () => (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-[#000000]">메가박스/제휴쿠폰</h1>
          <p className="mt-5 text-sm text-gray-600">· 보유하신 쿠폰 내역입니다.</p>
          <p className="text-sm text-gray-600">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
        </div>
        <button className="rounded border border-[#eb4d32] px-5 py-3 text-sm text-[#eb4d32]">할인쿠폰 등록</button>
      </div>

      <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">유형</span>
          {["전체", "매표", "매점", "포인트", "포토카드", "기타"].map((type, index) => (
            <button key={type} className={`rounded border px-4 py-2 ${index === 0 ? "border-[#eb4d32] bg-white text-[#eb4d32]" : "border-gray-300 bg-white"}`}>{type}</button>
          ))}
          <span className="ml-4 font-semibold">구분</span>
          <select className="rounded border border-gray-300 px-3 py-2"><option>전체</option></select>
          <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2"><Search className="h-4 w-4" /> 조회</button>
        </div>
        <div className="mt-4 flex items-center gap-6 text-base">
          <label className="flex items-center gap-2"><input type="radio" checked readOnly /> 사용가능</label>
          <label className="flex items-center gap-2"><input type="radio" readOnly /> 사용완료</label>
          <label className="flex items-center gap-2"><input type="radio" readOnly /> 기간만료</label>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>구분</span>
          <span>쿠폰명</span>
          <span>유효기간</span>
          <span>사용상태</span>
          <span>액션</span>
        </div>
        {[1, 2].map((row) => (
          <div key={row} className="grid grid-cols-5 items-center border-t px-4 py-4 text-center text-sm">
            <span>매표</span>
            <div>
              <p>[즉시할인] 영화 3천원 할인쿠폰</p>
              <p className="text-gray-500">4762-8487-6768-2863</p>
            </div>
            <span>2026.01.02 ~ 2026.03.02</span>
            <span>사용가능</span>
            <button className="mx-auto rounded border border-gray-300 px-3 py-1 text-sm">쿠폰정보</button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3">이용안내</div>
    </section>
  );

  const renderPoints = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">포인트 이용내역</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b bg-[#ffffff] px-5 py-4">
          <h2 className="text-lg font-semibold">나의 포인트 정보</h2>
          <button className="rounded border border-gray-300 bg-white px-4 py-2 text-sm">포인트 비밀번호 설정</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-[#000000] p-6 text-white">
            <h3 className="text-center text-3xl font-semibold">사용가능 포인트</h3>
            <p className="mt-3 text-center text-5xl font-bold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 적립예정</span><span>0 P</span>
              </div>
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 당월소멸예정</span><span>0 P</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-center text-xl font-semibold text-gray-700">VIP 선정 누적 포인트 현황</h3>
            <div className="mt-4 rounded bg-[#ffffff] py-2 text-center text-base font-semibold">포인트</div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>· 매표 <span className="float-right">0</span></p>
              <p>· 매점 <span className="float-right">0</span></p>
              <p>· 이벤트(VIP등급대상) <span className="float-right">0</span></p>
            </div>
            <p className="mt-8 text-right text-3xl font-semibold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
          </div>
        </div>
      </div>

      <h2 className="mt-9 text-3xl font-semibold text-[#eb4d32]">이용내역 조회</h2>
      <p className="mt-2 text-sm text-gray-600">· 하단 내역은 상영일 및 구매일 기준이며, 해당일 익일(+1)에 사용 가능 포인트로 전환됩니다.</p>
      <p className="text-sm text-gray-600">· 적립 예정 포인트는 사용 가능포인트에 포함되지 않으며, 환불 또는 거래 취소가 될 경우 내역에서 삭제됩니다.</p>

      <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">조회기간</span>
          {['1주일', '1개월', '3개월', '6개월'].map((item, index) => (
            <button key={item} className={`rounded border px-4 py-2 ${index === 0 ? 'border-[#eb4d32] bg-white text-[#eb4d32]' : 'border-gray-300 bg-white'}`}>{item}</button>
          ))}
          <input className="rounded border border-gray-300 px-3 py-2" value="2026.02.18" readOnly />
          <span>~</span>
          <input className="rounded border border-gray-300 px-3 py-2" value="2026.02.25" readOnly />
          <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2"><Search className="h-4 w-4" /> 조회</button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>일자</span>
          <span>구분</span>
          <span>내용</span>
          <span>지점</span>
          <span>포인트</span>
        </div>
        <div className="py-8 text-center text-gray-500">조회된 내역이 없습니다</div>
      </div>
    </section>
  );

  const renderCards = () => (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-[#000000]">멤버십 카드관리</h1>
          <p className="mt-5 text-sm text-gray-600">· 메가박스 계정에 등록된 멤버십 카드를 관리할 수 있습니다.</p>
        </div>
        <button className="rounded border border-[#eb4d32] px-5 py-3 text-sm text-[#eb4d32]">멤버십 카드 등록</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>구분</span>
          <span>카드번호</span>
          <span>카드명</span>
          <span>발급처</span>
          <span>발급일</span>
        </div>
        <div className="grid grid-cols-5 border-t px-4 py-4 text-center text-sm">
          <span>온라인</span>
          <span>6003-1279-****-4098</span>
          <span>메가박스 멤버십</span>
          <span>메가박스 멤버십</span>
          <span>2025.12.31</span>
        </div>
      </div>

      <div className="mt-8 rounded-sm border border-gray-200 bg-white">
        <div className="border-b bg-[#ffffff] px-4 py-3 font-semibold">이용안내</div>
        <div className="p-4 text-base text-gray-600">
          <p>· 앞 혹은 뒷면의 카드 번호와 CVC코드가 있는 카드로만 온라인 등록이 가능합니다.</p>
          <p>· 등록된 멤버십 카드는 온라인 및 극장에서 사용하실 수 있습니다.</p>
          <p>· 한 번 삭제하신 카드번호는 재등록이 불가합니다.</p>
        </div>
      </div>
    </section>
  );

  const renderMovieStory = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 무비스토리</h1>

      <div className="mt-5 grid grid-cols-2 border border-gray-300 md:grid-cols-4">
        {["무비타임라인", "관람평", "본영화", "보고싶어"].map((tab, index) => (
          <button key={tab} className={`px-5 py-3 text-sm ${index === 0 ? "bg-[#000000] text-white" : "bg-white text-gray-600"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3 text-lg">
          <button className="text-gray-400">‹</button>
          <div className="flex gap-8"><span>2025</span><span className="border-b-4 border-[#eb4d32] pb-1">2026</span></div>
          <button className="text-gray-400">›</button>
        </div>
        <div className="py-14 text-center text-gray-500">나의 무비타임라인을 만들어 보세요.</div>
      </div>
    </section>
  );

  const renderEvents = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 응모 내역</h1>
      <p className="mt-5 text-sm text-gray-600">· 개인정보 처리방침에 따라 당첨자 발표일로 부터 6개월간 당첨자 발표내역을 확인할 수 있습니다.</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-semibold">전체 (0건)</p>
        <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
          <span>검색어를 입력해 주세요.</span>
          <Search className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>번호</span>
          <span>분류</span>
          <span>이벤트명</span>
          <span>응모일</span>
          <span>당첨자발표</span>
        </div>
        <div className="py-8 text-center text-gray-500">조회된 내역이 없습니다.</div>
      </div>
    </section>
  );

  const renderInquiries = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">나의 문의내역</h1>

      <div className="mt-5 grid grid-cols-1 border border-gray-300 md:grid-cols-3">
        {["1:1 문의내역", "단체관람/대관 문의내역", "분실물 문의내역"].map((tab, index) => (
          <button key={tab} className={`px-5 py-3 text-sm ${index === 0 ? "bg-[#000000] text-white" : "bg-white text-gray-600"}`}>
            {tab}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-600">· 고객센터를 통해 남기신 1:1 문의내역을 확인하실 수 있습니다.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold">전체 (0건)</p>
        <div className="flex items-center gap-2">
          <button className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]">1:1 문의하기</button>
          <select className="rounded border border-gray-300 px-3 py-2 text-sm"><option>전체</option></select>
          <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
            <span>검색어를 입력해 주세요.</span>
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-6 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>번호</span>
          <span>극장</span>
          <span>유형</span>
          <span>제목</span>
          <span>답변상태</span>
          <span>등록일</span>
        </div>
        <div className="py-8 text-center text-gray-500">목록이 없습니다.</div>
      </div>
    </section>
  );

  const renderPayments = () => (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">중앙페이 결제수단 관리</h1>
      <div className="mt-6 rounded-sm border border-gray-200 bg-white p-6 text-gray-600">
        결제수단 관리 기능은 준비 중입니다.
      </div>
    </section>
  );

  const renderContent = () => {
    if (pageKey === "dashboard") return renderDashboard();
    if (pageKey === "reservations") return renderReservations();
    if (pageKey === "vouchers") return renderVouchers();
    if (pageKey === "coupons") return renderCoupons();
    if (pageKey === "points") return renderPoints();
    if (pageKey === "cards") return renderCards();
    if (pageKey === "movie-story") return renderMovieStory();
    if (pageKey === "events") return renderEvents();
    if (pageKey === "inquiries") return renderInquiries();
    return renderPayments();
  };

  return (
    <div className="min-h-screen bg-[#fdf4e3] text-[#000000]">
      <Header />

      <div className="border-y border-[#000000] bg-[#ffffff]">
        <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-2 px-4 text-sm text-gray-500">
          <Home className="h-4 w-4" />
          {crumbs.map((crumb, index) => (
            <div key={`${crumb}-${index}`} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className={index === crumbs.length - 1 ? "text-gray-700" : ""}>{crumb}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] gap-8 px-4 py-10">
        <aside className="w-[220px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white">
          <button
            type="button"
            className="w-full bg-[#000000] px-6 py-8 text-center text-xl font-semibold text-white"
            onClick={() => moveMenu("/my-page")}
          >
            나의 메가박스
          </button>

          {MENU_CONFIG.map((item) => {
            const active = item.key === pageKey;
            return (
              <div key={item.key} className="border-t border-gray-200">
                <button
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-base ${active ? "font-semibold text-[#eb4d32]" : "text-gray-700"}`}
                  onClick={() => moveMenu(item.path)}
                >
                  <span>{item.label}</span>
                  {active ? <ChevronRight className="h-5 w-5" /> : null}
                </button>
                {item.children ? (
                  <div className="space-y-1 px-5 pb-3 text-sm text-gray-500">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        className={`block w-full text-left ${location.pathname === child.path ? "font-semibold text-[#eb4d32]" : ""}`}
                        onClick={() => moveMenu(child.path)}
                      >
                        · {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="border-t border-gray-200 bg-[#ffffff] px-4 py-3 text-base text-gray-700">회원정보</div>
          <div className="px-5 pb-4 pt-2 text-sm text-gray-500">
            <p>· 개인정보 수정</p>
            <p>· 선호정보 수정</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {renderContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
}
