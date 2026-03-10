import { Search } from "lucide-react";
import type { MyPageSummary, MyPointHistoryItem } from "../../../api/myPageApi";

type PointsSectionProps = {
  summary: MyPageSummary | null;
  openPointPhoneModal: () => void;
  pointRange: "week" | "month1" | "month3" | "month6";
  applyPointRange: (value: "week" | "month1" | "month3" | "month6") => void;
  pointFrom: string;
  setPointFrom: (value: string) => void;
  pointTo: string;
  setPointTo: (value: string) => void;
  setAppliedPointFrom: (value: string) => void;
  setAppliedPointTo: (value: string) => void;
  pointLoading: boolean;
  pointRows: MyPointHistoryItem[];
  formatDateTime: (value: string) => string;
};

export function PointsSection({
  summary,
  openPointPhoneModal,
  pointRange,
  applyPointRange,
  pointFrom,
  setPointFrom,
  pointTo,
  setPointTo,
  setAppliedPointFrom,
  setAppliedPointTo,
  pointLoading,
  pointRows,
  formatDateTime,
}: PointsSectionProps) {
  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">포인트 이용내역</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-[#FDFDFD] shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/35">나의 포인트 정보</h2>
          <button
            className="rounded-sm border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
            onClick={openPointPhoneModal}
          >
            포인트 비밀번호 설정
          </button>
        </div>

        <div>
          <div className="bg-[#1A1A1A] p-8 text-white">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-[#B91C1C]">Kino Membership</p>
            <h3 className="mt-4 text-center text-4xl font-semibold tracking-tight">사용가능 포인트</h3>
            <p className="mt-4 text-center font-display text-6xl font-semibold tracking-tight text-[#B91C1C]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-sm bg-white px-5 py-3 text-sm text-[#1A1A1A]">
                <span>· 적립예정</span><span>{(summary?.pendingPoints ?? 0).toLocaleString()} P</span>
              </div>
              <div className="flex items-center justify-between rounded-sm bg-white px-5 py-3 text-sm text-[#1A1A1A]">
                <span>· 당월소멸예정</span><span>{(summary?.expiringPointsThisMonth ?? 0).toLocaleString()} P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-3xl font-semibold tracking-tight text-[#B91C1C]">이용내역 조회</h2>
      <p className="mt-3 text-sm text-black/55">· 하단 내역은 상영일 및 구매일 기준이며, 해당일 익일(+1)에 사용 가능 포인트로 전환됩니다.</p>
      <p className="text-sm text-black/55">· 적립 예정 포인트는 사용 가능포인트에 포함되지 않으며, 환불 또는 거래 취소가 될 경우 내역에서 삭제됩니다.</p>

      <div className="mt-5 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 text-sm md:flex-nowrap">
          <span className="font-semibold text-[#1A1A1A]">조회기간</span>
          <button className={`rounded-sm border px-4 py-2 transition-colors ${pointRange === "week" ? "border-[#B91C1C] bg-white text-[#B91C1C]" : "border-black/10 bg-white text-black/55 hover:border-[#B91C1C] hover:text-[#B91C1C]"}`} onClick={() => applyPointRange("week")}>1주일</button>
          <button className={`rounded-sm border px-4 py-2 transition-colors ${pointRange === "month1" ? "border-[#B91C1C] bg-white text-[#B91C1C]" : "border-black/10 bg-white text-black/55 hover:border-[#B91C1C] hover:text-[#B91C1C]"}`} onClick={() => applyPointRange("month1")}>1개월</button>
          <button className={`rounded-sm border px-4 py-2 transition-colors ${pointRange === "month3" ? "border-[#B91C1C] bg-white text-[#B91C1C]" : "border-black/10 bg-white text-black/55 hover:border-[#B91C1C] hover:text-[#B91C1C]"}`} onClick={() => applyPointRange("month3")}>3개월</button>
          <button className={`rounded-sm border px-4 py-2 transition-colors ${pointRange === "month6" ? "border-[#B91C1C] bg-white text-[#B91C1C]" : "border-black/10 bg-white text-black/55 hover:border-[#B91C1C] hover:text-[#B91C1C]"}`} onClick={() => applyPointRange("month6")}>6개월</button>
          <input className="w-[170px] rounded-sm border border-black/10 bg-white px-3 py-2 text-[#1A1A1A]" type="date" value={pointFrom} onChange={(e) => setPointFrom(e.target.value)} />
          <span>~</span>
          <input className="w-[170px] rounded-sm border border-black/10 bg-white px-3 py-2 text-[#1A1A1A]" type="date" value={pointTo} onChange={(e) => setPointTo(e.target.value)} />
          <button
            className="flex items-center gap-1 rounded-sm border border-black/10 bg-white px-4 py-2 whitespace-nowrap font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
            onClick={() => {
              if (!pointFrom || !pointTo) {
                alert("조회 시작일/종료일을 선택해 주세요.");
                return;
              }
              if (new Date(pointFrom).getTime() > new Date(pointTo).getTime()) {
                alert("조회 시작일은 종료일보다 이후일 수 없습니다.");
                return;
              }
              setAppliedPointFrom(pointFrom);
              setAppliedPointTo(pointTo);
            }}
          >
            <Search className="h-4 w-4" /> 조회
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
        <div className="grid grid-cols-4 border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-black/35">
          <span>일자</span>
          <span>구분</span>
          <span>내용</span>
          {/*<span>지점</span>*/}
          <span>포인트</span>
        </div>
        {pointLoading ? (
          <div className="py-8 text-center text-black/45">불러오는 중...</div>
        ) : pointRows.length === 0 ? (
          <div className="py-8 text-center text-black/45">조회된 내역이 없습니다</div>
        ) : (
          pointRows.map((row) => (
            <div key={row.pointId} className="grid grid-cols-4 border-t border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]">
              <span className="text-black/65">{formatDateTime(row.createdAt)}</span>
              <span>{row.typeLabel}</span>
              <span className="font-medium">{row.content}</span>
              {/*<span>{row.branchName || "-"}</span>*/}
              <span className={row.point >= 0 ? "font-semibold text-[#B91C1C]" : "font-semibold text-[#1A1A1A]"}>
                {row.point > 0 ? `+${row.point.toLocaleString()}` : row.point.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
