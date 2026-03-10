import { Search } from "lucide-react";
import type { MyReservationItem } from "../../../api/myPageApi";
import {ReservationTimer} from "../modals/ReservationTimer";

type PurchaseRow = {
  id: number;
  reservationNumber: string;
  paymentDate: Date;
  category: string;
  productName: string;
  amount: number;
  statusLabel: string;
  isCancelled: boolean;
};

type ReservationsSectionProps = {
  guestView?: boolean;
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
  onClickPay: (reservationId: number) => void; // 결제하러 가기 클릭 핸들러 추가
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

function mapCancelReasonLabel(reason?: string | null) {
  if (reason === "TIMEOUT") return "시간만료";
  if (reason === "USER") return "사용자취소";
  return "취소";
}

function formatCompactDateTime(value?: string) {
  if (!value) return ["-", ""];
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return ["-", ""];

  const dateText = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const hour = date.getHours();
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeText = `${period} ${String(hour12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return [dateText, timeText];
}

export function ReservationsSection({
  guestView = false,
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
  onClickPay,
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
  const parseDateTime = (value?: string) => {
    if (!value) return new Date();
    const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  };

  const formatGuestBookingNo = (reservationId: number, paidAt?: string) => {
    const d = parseDateTime(paidAt);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const seq = String(reservationId).padStart(6, "0");
    return `KINO-${yy}${mm}${dd}-${seq}`;
  };
  
  const isPayable = (paymentStatus?: string, holdExpiresAt?: string) => {
    if (paymentStatus !== "READY" || !holdExpiresAt) return false;
    return new Date(holdExpiresAt).getTime() > Date.now();
  };

  const openPrintVoucher = (item: MyReservationItem) => {
    const bookingNo = formatGuestBookingNo(item.reservationId, item.paidAt);
    const paidAtText = formatDateTime(item.paidAt ?? item.startTime);
    const startTimeText = formatDateTime(item.startTime);
    const seatsText = item.seatNames.join(", ") || "-";
    const movieTitle = item.movieTitle;
    const theaterText = `${item.theaterName} / ${item.screenName}`;
    const peopleText = `성인 ${item.seatNames.length}명`;
    const amountText = formatMoney(item.finalAmount);
    const issueAtText = formatDateTime(new Date().toISOString());

    const printWindow = window.open("", "_blank", "width=860,height=900");
    if (!printWindow) {
      alert("팝업이 차단되어 교환권을 열 수 없습니다. 팝업을 허용해 주세요.");
      return;
    }

    const html = `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>${bookingNo} 교환권</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 28px; background: #f3f4f6; font-family: "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; color: #111827; }
      .ticket { max-width: 760px; margin: 0 auto; background: #ffffff; border: 2px solid #eb4d32; border-radius: 16px; overflow: hidden; }
      .head { padding: 18px 22px; background: linear-gradient(135deg, #eb4d32, #d43d22); color: #fff; }
      .head h1 { margin: 0; font-size: 22px; letter-spacing: 0.02em; }
      .head p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; }
      .body { padding: 20px 22px 24px; }
      .booking { margin-bottom: 16px; }
      .booking .label { font-size: 12px; color: #6b7280; }
      .booking .no { margin-top: 3px; font-size: 28px; font-weight: 800; color: #eb4d32; letter-spacing: 0.02em; }
      .barcode { margin-top: 10px; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-family: monospace; letter-spacing: 0.2em; font-weight: 700; text-align: center; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; margin-top: 14px; }
      .item { font-size: 14px; line-height: 1.45; }
      .item b { color: #111827; margin-right: 6px; }
      .price { margin-top: 16px; padding: 12px; border-radius: 10px; background: #fff7f5; border: 1px solid #ffd8d0; font-size: 16px; font-weight: 700; color: #9a3412; }
      .foot { margin-top: 18px; font-size: 12px; color: #6b7280; line-height: 1.5; }
      .actions { margin: 18px auto 0; max-width: 760px; display: flex; gap: 8px; justify-content: flex-end; }
      .btn { border: 1px solid #d1d5db; background: #fff; color: #111827; padding: 10px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; }
      .btn.primary { border-color: #eb4d32; background: #eb4d32; color: #fff; }
      @media print {
        body { background: #fff; padding: 0; }
        .actions { display: none; }
        .ticket { border-color: #111827; }
      }
    </style>
  </head>
  <body>
    <section class="ticket">
      <header class="head">
        <h1>KINO MOVIE VOUCHER</h1>
        <p>현장에서 직원에게 아래 교환권을 제시해 주세요.</p>
      </header>
      <div class="body">
        <div class="booking">
          <div class="label">예매번호</div>
          <div class="no">${bookingNo}</div>
        </div>
        <div class="grid">
          <div class="item"><b>영화명</b>${movieTitle}</div>
          <div class="item"><b>관람인원</b>${peopleText}</div>
          <div class="item"><b>극장/상영관</b>${theaterText}</div>
          <div class="item"><b>관람좌석</b>${seatsText}</div>
          <div class="item"><b>관람일시</b>${startTimeText}</div>
          <div class="item"><b>결제일시</b>${paidAtText}</div>
        </div>
        <div class="price">결제금액 ${amountText}</div>
        <div class="foot">
          <div>발행시각: ${issueAtText}</div>
          <div>본 교환권은 재출력이 가능하며, 유효 여부는 매표소 시스템 기준으로 판단됩니다.</div>
        </div>
      </div>
    </section>

    <div class="actions">
      <button class="btn" onclick="window.close()">닫기</button>
      <button class="btn primary" onclick="window.print()">인쇄하기</button>
    </div>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  if (guestView) {
    return (
      <section>
        <h1 className="text-4xl font-semibold text-[#000000]">예매/취소내역</h1>

        <div className="mt-8 rounded-sm bg-[#f1f2f5] p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-[#000000]">구분</span>
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
          <div className="mt-8">
          <p className="text-2xl font-semibold text-[#000000]">총 {visibleReservations.length}건</p>
          {loading ? (
            <div className="mt-4 rounded border border-gray-200 bg-white py-12 text-center text-gray-500">불러오는 중...</div>
          ) : visibleReservations.length === 0 ? (
            <div className="mt-4 rounded border border-gray-200 bg-white py-12 text-center text-gray-500">예매 내역이 없습니다.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {visibleReservations.map((item) => {
                const canPay = isPayable(item.paymentStatus, item.holdExpiresAt); // ✨ 결제 가능 여부 체크

                return (
                  <div key={item.reservationId} className="rounded-xl border border-gray-300 bg-white p-6">
                    <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="h-[210px] w-[140px] shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                        {item.posterUrl ? <img src={item.posterUrl} alt={item.movieTitle} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          예매번호 <span className="text-2xl font-semibold text-[#eb4d32]">{formatGuestBookingNo(item.reservationId, item.paidAt)}</span>
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-y-2 text-sm text-[#000000] lg:grid-cols-2">
                          <p><span className="font-semibold">영화명</span> {item.movieTitle}</p>
                          <p><span className="font-semibold">관람인원</span> 성인 {item.seatNames.length}명</p>
                          <p><span className="font-semibold">극장/상영관</span> {item.theaterName} / {item.screenName}</p>
                          <p><span className="font-semibold">관람좌석</span> {item.seatNames.join(", ") || "-"}</p>
                          <p><span className="font-semibold">관람일시</span> {formatDateTime(item.startTime)}</p>
                          <p><span className="font-semibold">결제일시</span> {canPay ? "-" : formatDateTime(item.paidAt ?? item.startTime)}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded bg-[#f3f4f6] px-4 py-3 text-sm font-semibold text-[#000000]">
                          <span>결제금액 {formatMoney(item.finalAmount)}</span>
                          {canPay && item.holdExpiresAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-xs font-normal">남은 결제 시간</span>
                              <ReservationTimer expiresAt={item.holdExpiresAt} />
                            </div>
                          )}
                          {canPay && <span className="text-[#eb4d32]">(결제 대기 중)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {/* ✨ 결제하러 가기 버튼 (비회원 뷰) */}
                      {canPay && (
                        <button
                          className="rounded bg-[#111827] px-5 py-2 text-sm font-semibold text-white hover:bg-black"
                          onClick={() => onClickPay(item.reservationId)}
                        >
                          결제하러 가기
                        </button>
                      )}
                      
                      {/* 결제가 안 된 상태면 교환권 출력 숨김 처리 */}
                      {!canPay && (
                        <button
                          className="rounded border border-[#eb4d32] bg-white px-5 py-2 text-sm font-semibold text-[#eb4d32]"
                          onClick={() => openPrintVoucher(item)}
                        >
                          교환권출력
                        </button>
                      )}

                      {item.cancellable ? (
                        <button
                          className="rounded bg-[#eb4d32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d43d22]"
                          disabled={isCancelling === item.reservationId}
                          onClick={() => openCancelModal(item.reservationId)}
                        >
                          {isCancelling === item.reservationId ? "처리 중..." : "예매취소"}
                        </button>
                      ) : (
                        <button className="cursor-not-allowed rounded bg-gray-300 px-5 py-2 text-sm font-semibold text-white" disabled>취소불가</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[#eb4d32]">예매취소내역</h2>
          <p className="mt-2 text-sm text-gray-600">· 상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
              <span>취소사유</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-6 text-center text-gray-500">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => {
                const [cancelDate, cancelTime] = formatCompactDateTime(item.cancelledAt);
                const [screenDate, screenTime] = formatCompactDateTime(item.startTime);

                return (
                  <div
                    key={item.reservationId}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] items-center border-t border-gray-200 px-4 py-4 text-center text-sm"
                  >
                    <span className="leading-relaxed">
                      <span className="block">{cancelDate}</span>
                      <span className="block">{cancelTime}</span>
                    </span>
                    <span className="truncate px-2">{item.movieTitle}</span>
                    <span className="truncate px-2">{item.theaterName}</span>
                    <span className="leading-relaxed">
                      <span className="block">{screenDate}</span>
                      <span className="block">{screenTime}</span>
                    </span>
                    <span className="whitespace-nowrap font-medium">{formatMoney(item.finalAmount)}</span>
                    <span className="flex justify-center">
                      <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-gray-700">
                        {mapCancelReasonLabel(item.cancelReason)}
                      </span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    );
  }

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
                {visibleReservations.map((item) => {
                  const canPay = isPayable(item.paymentStatus, item.holdExpiresAt); //결제 가능 여부 체크

                  return (
                    <div key={item.reservationId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold">{item.movieTitle}</p>
                          {canPay && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">결제 대기</span>}
                          {!canPay && item.paymentStatus == "PAID" && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">결제 완료</span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{item.theaterName} / {item.screenName}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(item.startTime)}</p>
                        <p className="text-sm text-gray-600">좌석: {item.seatNames.join(", ") || "-"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        {canPay && item.holdExpiresAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-xs font-normal">남은 결제 시간</span>
                              <ReservationTimer expiresAt={item.holdExpiresAt} />
                            </div>
                          )}
                        <p className="font-semibold">{formatMoney(item.finalAmount)}</p>
                        
                        <div className="flex gap-2">
                          {/* ✨ 결제하러 가기 버튼 (환불하기 옆/위에 배치) */}
                          {canPay && (
                            <button
                              className="rounded border border-[#111827] bg-[#111827] px-4 py-2 text-sm text-white hover:bg-black"
                              onClick={() => onClickPay(item.reservationId)}
                            >
                              결제하러 가기
                            </button>
                          )}

                          {/* 결제가 안 된 상태면 교환권 출력 숨김 처리 */}
                          {!canPay && (
                            <button
                              className="rounded border border-[#eb4d32] bg-white px-5 py-2 text-sm font-semibold text-[#eb4d32]"
                              onClick={() => openPrintVoucher(item)}
                            >
                              교환권출력
                            </button>
                          )}

                          {!canPay && item.cancellable ? (
                            <button
                              className="rounded border border-[#eb4d32] px-4 py-2 text-sm text-[#eb4d32] hover:bg-red-50"
                              disabled={isCancelling === item.reservationId}
                              onClick={() => openCancelModal(item.reservationId)}
                            >
                              {isCancelling === item.reservationId ? "처리 중..." : "환불하기"}
                            </button>
                          ) : (
                            <span className="inline-block rounded bg-gray-100 px-4 py-2 text-sm text-gray-500">환불 불가</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <div className="grid grid-cols-6 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
                  <span>예매번호</span>
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
                    <div key={row.id} className="grid grid-cols-6 border-b border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
                      <span>{row.reservationNumber}</span>
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
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
              <span>취소사유</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-6 text-center text-gray-500">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => {
                const [cancelDate, cancelTime] = formatCompactDateTime(item.cancelledAt);
                const [screenDate, screenTime] = formatCompactDateTime(item.startTime);

                return (
                  <div
                    key={item.reservationId}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] items-center border-t border-gray-200 px-4 py-4 text-center text-sm"
                  >
                    <span className="leading-relaxed">
                      <span className="block">{cancelDate}</span>
                      <span className="block">{cancelTime}</span>
                    </span>
                    <span className="truncate px-2">{item.movieTitle}</span>
                    <span className="truncate px-2">{item.theaterName}</span>
                    <span className="leading-relaxed">
                      <span className="block">{screenDate}</span>
                      <span className="block">{screenTime}</span>
                    </span>
                    <span className="whitespace-nowrap font-medium">{formatMoney(item.finalAmount)}</span>
                    <span className="flex justify-center">
                      <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-gray-700">
                        {mapCancelReasonLabel(item.cancelReason)}
                      </span>
                    </span>
                  </div>
                );
              })
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
