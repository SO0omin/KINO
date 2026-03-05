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
      <h1 className="text-4xl font-semibold text-[#000000]">포인트 이용내역</h1>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b bg-[#ffffff] px-5 py-4">
          <h2 className="text-lg font-semibold">나의 포인트 정보</h2>
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm"
            onClick={openPointPhoneModal}
          >
            포인트 비밀번호 설정
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-[#000000] p-6 text-white">
            <h3 className="text-center text-3xl font-semibold">사용가능 포인트</h3>
            <p className="mt-3 text-center text-5xl font-bold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 적립예정</span><span>{(summary?.pendingPoints ?? 0).toLocaleString()} P</span>
              </div>
              <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 text-sm text-gray-700">
                <span>· 당월소멸예정</span><span>{(summary?.expiringPointsThisMonth ?? 0).toLocaleString()} P</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-center text-xl font-semibold text-gray-700">VIP 선정 누적 포인트 현황</h3>
            <div className="mt-4 rounded bg-[#ffffff] py-2 text-center text-base font-semibold">포인트</div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>· 매표 <span className="float-right">{(summary?.vipTicketPoints ?? 0).toLocaleString()}</span></p>
              <p>· 매점 <span className="float-right">{(summary?.vipStorePoints ?? 0).toLocaleString()}</span></p>
              <p>· 이벤트(VIP등급대상) <span className="float-right">{(summary?.vipEventPoints ?? 0).toLocaleString()}</span></p>
            </div>
            <p className="mt-8 text-right text-3xl font-semibold text-[#eb4d32]">{(summary?.availablePoints ?? 0).toLocaleString()} P</p>
          </div>
        </div>
      </div>

      <h2 className="mt-9 text-3xl font-semibold text-[#eb4d32]">이용내역 조회</h2>
      <p className="mt-2 text-sm text-gray-600">· 하단 내역은 상영일 및 구매일 기준이며, 해당일 익일(+1)에 사용 가능 포인트로 전환됩니다.</p>
      <p className="text-sm text-gray-600">· 적립 예정 포인트는 사용 가능포인트에 포함되지 않으며, 환불 또는 거래 취소가 될 경우 내역에서 삭제됩니다.</p>

      <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm md:flex-nowrap">
          <span className="font-semibold">조회기간</span>
          <button className={`rounded border px-4 py-2 ${pointRange === "week" ? "border-[#eb4d32] bg-white text-[#eb4d32]" : "border-gray-300 bg-white"}`} onClick={() => applyPointRange("week")}>1주일</button>
          <button className={`rounded border px-4 py-2 ${pointRange === "month1" ? "border-[#eb4d32] bg-white text-[#eb4d32]" : "border-gray-300 bg-white"}`} onClick={() => applyPointRange("month1")}>1개월</button>
          <button className={`rounded border px-4 py-2 ${pointRange === "month3" ? "border-[#eb4d32] bg-white text-[#eb4d32]" : "border-gray-300 bg-white"}`} onClick={() => applyPointRange("month3")}>3개월</button>
          <button className={`rounded border px-4 py-2 ${pointRange === "month6" ? "border-[#eb4d32] bg-white text-[#eb4d32]" : "border-gray-300 bg-white"}`} onClick={() => applyPointRange("month6")}>6개월</button>
          <input className="w-[170px] rounded border border-gray-300 px-3 py-2" type="date" value={pointFrom} onChange={(e) => setPointFrom(e.target.value)} />
          <span>~</span>
          <input className="w-[170px] rounded border border-gray-300 px-3 py-2" type="date" value={pointTo} onChange={(e) => setPointTo(e.target.value)} />
          <button
            className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 whitespace-nowrap"
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

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="grid grid-cols-5 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
          <span>일자</span>
          <span>구분</span>
          <span>내용</span>
          <span>지점</span>
          <span>포인트</span>
        </div>
        {pointLoading ? (
          <div className="py-8 text-center text-gray-500">불러오는 중...</div>
        ) : pointRows.length === 0 ? (
          <div className="py-8 text-center text-gray-500">조회된 내역이 없습니다</div>
        ) : (
          pointRows.map((row) => (
            <div key={row.pointId} className="grid grid-cols-5 border-t border-gray-200 px-4 py-3 text-center text-sm">
              <span>{formatDateTime(row.createdAt)}</span>
              <span>{row.typeLabel}</span>
              <span>{row.content}</span>
              <span>{row.branchName || "-"}</span>
              <span className={row.point >= 0 ? "text-[#eb4d32] font-semibold" : "font-semibold"}>
                {row.point > 0 ? `+${row.point.toLocaleString()}` : row.point.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
