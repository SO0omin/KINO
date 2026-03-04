import { Search } from "lucide-react";
import type { MyReservationItem } from "../../../api/myPageApi";

type PurchaseRow = {
  id: number;
  paymentDate: Date;
  category: string;
  productName: string;
  amount: number;
  statusLabel: string;
  isCancelled: boolean;
};

type ReservationsSectionProps = {
  reservationTab: "reservation" | "purchase";
  setReservationTab: (value: "reservation" | "purchase") => void;
  historyType: "current" | "past";
  setHistoryType: (value: "current" | "past") => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  monthOptions: string[];
  monthLabel: (monthKey: string) => string;
  setAppliedHistoryType: (value: "current" | "past") => void;
  setAppliedMonth: (value: string) => void;
  loading: boolean;
  visibleReservations: MyReservationItem[];
  formatDateTime: (value: string) => string;
  formatMoney: (value: number) => string;
  isCancelling: number | null;
  openCancelModal: (reservationId: number) => void;
  purchaseSelectType: "all" | "movie";
  setPurchaseSelectType: (value: "all" | "movie") => void;
  purchaseStatusType: "all" | "purchase" | "cancel";
  setPurchaseStatusType: (value: "all" | "purchase" | "cancel") => void;
  purchaseRange: "week" | "month1" | "month3" | "month6";
  applyPurchaseRange: (value: "week" | "month1" | "month3" | "month6") => void;
  purchaseFrom: string;
  setPurchaseFrom: (value: string) => void;
  purchaseTo: string;
  setPurchaseTo: (value: string) => void;
  setAppliedPurchaseSelectType: (value: "all" | "movie") => void;
  setAppliedPurchaseStatusType: (value: "all" | "purchase" | "cancel") => void;
  setAppliedPurchaseFrom: (value: string) => void;
  setAppliedPurchaseTo: (value: string) => void;
  purchaseRows: PurchaseRow[];
  cancelledReservations: MyReservationItem[];
};

export function ReservationsSection({
  reservationTab,
  setReservationTab,
  historyType,
  setHistoryType,
  selectedMonth,
  setSelectedMonth,
  monthOptions,
  monthLabel,
  setAppliedHistoryType,
  setAppliedMonth,
  loading,
  visibleReservations,
  formatDateTime,
  formatMoney,
  isCancelling,
  openCancelModal,
  purchaseSelectType,
  setPurchaseSelectType,
  purchaseStatusType,
  setPurchaseStatusType,
  purchaseRange,
  applyPurchaseRange,
  purchaseFrom,
  setPurchaseFrom,
  purchaseTo,
  setPurchaseTo,
  setAppliedPurchaseSelectType,
  setAppliedPurchaseStatusType,
  setAppliedPurchaseFrom,
  setAppliedPurchaseTo,
  purchaseRows,
  cancelledReservations,
}: ReservationsSectionProps) {
  return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">예매/구매 내역</h1>

      <div className="mt-5 flex border-b border-gray-300">
        <button
          className={`w-40 border border-b-0 px-4 py-2 ${reservationTab === "reservation" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`}
          onClick={() => setReservationTab("reservation")}
        >
          예매
        </button>
        <button
          className={`w-40 border border-b-0 px-4 py-2 ${reservationTab === "purchase" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-300 bg-white text-gray-500"}`}
          onClick={() => setReservationTab("purchase")}
        >
          구매
        </button>
      </div>

      {reservationTab === "reservation" ? (
        <>
          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold">구분</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={historyType === "current"}
                  onChange={() => setHistoryType("current")}
                />
                예매내역
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={historyType === "past"}
                  onChange={() => setHistoryType("past")}
                />
                지난내역
              </label>
              <select
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={historyType === "current"}
              >
                {monthOptions.length === 0 ? (
                  <option value="">월 데이터 없음</option>
                ) : (
                  monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {monthLabel(month)}
                    </option>
                  ))
                )}
              </select>
              <button
                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm"
                onClick={() => {
                  setAppliedHistoryType(historyType);
                  setAppliedMonth(historyType === "current" ? "" : selectedMonth);
                }}
              >
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white">
            {loading ? (
              <div className="py-12 text-center text-gray-500">불러오는 중...</div>
            ) : visibleReservations.length === 0 ? (
              <div className="py-12 text-center text-gray-500">예매 내역이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {visibleReservations.map((item) => (
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
                          onClick={() => openCancelModal(item.reservationId)}
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
        </>
      ) : (
        <>
          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="mr-2 font-semibold text-[#000000]">구분</span>
              <select
                className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1.5 text-sm text-[#000000]"
                value={purchaseSelectType}
                onChange={(e) => setPurchaseSelectType(e.target.value as "all" | "movie")}
              >
                <option value="all">전체</option>
                <option value="movie">영화예매</option>
              </select>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "all"} onChange={() => setPurchaseStatusType("all")} />
                전체
              </label>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "purchase"} onChange={() => setPurchaseStatusType("purchase")} />
                구매내역
              </label>
              <label className="flex items-center gap-1.5 text-[#000000]">
                <input type="radio" checked={purchaseStatusType === "cancel"} onChange={() => setPurchaseStatusType("cancel")} />
                취소내역
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-2 font-semibold text-[#000000]">조회기간</span>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "week" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("week")}>1주일</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month1" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month1")}>1개월</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month3" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month3")}>3개월</button>
              <button className={`rounded border border-gray-200 px-3 py-1 ${purchaseRange === "month6" ? "text-[#eb4d32]" : "text-[#000000]"}`} onClick={() => applyPurchaseRange("month6")}>6개월</button>
              <input type="date" className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1" value={purchaseFrom} onChange={(e) => setPurchaseFrom(e.target.value)} />
              <span className="text-[#000000]">~</span>
              <input type="date" className="rounded border border-gray-200 bg-[#ffffff] px-3 py-1" value={purchaseTo} onChange={(e) => setPurchaseTo(e.target.value)} />
              <button
                className="flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-3 py-1 text-[#000000]"
                onClick={() => {
                  setAppliedPurchaseSelectType(purchaseSelectType);
                  setAppliedPurchaseStatusType(purchaseStatusType);
                  setAppliedPurchaseFrom(purchaseFrom);
                  setAppliedPurchaseTo(purchaseTo);
                }}
              >
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm bg-[#ffffff]">
            <div className="p-5">
              <p className="text-base font-semibold text-[#000000]">전체 {purchaseRows.length}건</p>
              <div className="mt-2">
                <div className="grid grid-cols-5 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
                  <span>결제일시</span>
                  <span>구분</span>
                  <span>상품명</span>
                  <span>결제금액</span>
                  <span>상태</span>
                </div>
                {purchaseRows.length === 0 ? (
                  <div className="border-b border-gray-200 py-10 text-center text-[#000000]">결제내역이 없습니다.</div>
                ) : (
                  purchaseRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-5 border-b border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
                      <span>{formatDateTime(row.paymentDate.toISOString())}</span>
                      <span>{row.category}</span>
                      <span>{row.productName}</span>
                      <span>{formatMoney(row.amount)}</span>
                      <span className={row.isCancelled ? "text-[#eb4d32]" : "text-[#000000]"}>{row.statusLabel}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-sm bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#000000]">
              <span>이용안내</span>
              <span>⌃</span>
            </div>
            <div className="p-4 text-sm leading-7 text-[#000000]">
              <p className="font-semibold">[스토어 구매/취소 안내]</p>
              <p>· 스토어 상품은 구매 후 취소가능기간 내 100% 환불이 가능하며, 부분환불은 불가 합니다.</p>
              <p>· (ex. 3개의 쿠폰 합 번에 구매하신 경우, 3개 모두 취소만 가능하며 그 중 사용하신 쿠폰이 있는 경우 환불이 불가합니다)</p>
              <p>· 스토어 교환권은 MMS로 최대 1회 재전송 하실 수 있습니다.</p>
              <p className="mt-3 font-semibold">[모바일오더 구매/취소 안내]</p>
              <p>· 모바일오더는 모바일앱을 통해 이용하실 수 있습니다.</p>
              <p>· 모바일오더는 구매 후 즉시 조리되는 상품으로 취소가 불가합니다.</p>
              <p>· 극장 매점에서 주문번호가 호출되면 상품을 수령하실 수 있습니다.</p>
              <p>· 극장 상황에 따라 상품준비시간이 다소 길어질 수 있습니다.</p>
            </div>
          </div>
        </>
      )}

      {reservationTab === "reservation" ? (
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
                <div key={item.reservationId} className="grid grid-cols-5 border-t border-gray-200 px-4 py-3 text-center text-sm">
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
      ) : null}

      {reservationTab === "reservation" ? (
        <div className="mt-8 rounded border border-gray-300 bg-[#ffffff] px-4 py-3">이용안내</div>
      ) : null}
    </section>
  );
}
