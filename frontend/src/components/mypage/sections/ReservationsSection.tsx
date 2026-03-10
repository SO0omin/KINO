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
      body { margin: 0; padding: 32px; background: linear-gradient(180deg, #f7f7f7 0%, #efefef 100%); font-family: "Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; color: #1a1a1a; }
      .frame { max-width: 860px; margin: 0 auto; }
      .ticket { position: relative; overflow: hidden; border: 1px solid rgba(26, 26, 26, 0.08); border-radius: 22px; background: #fdfdfd; box-shadow: 0 28px 80px rgba(0, 0, 0, 0.12); }
      .ticket::before { content: ""; position: absolute; inset: 0; background:
        radial-gradient(circle at top right, rgba(185, 28, 28, 0.12), transparent 32%),
        radial-gradient(circle at bottom left, rgba(185, 28, 28, 0.08), transparent 28%);
        pointer-events: none; }
      .head { position: relative; padding: 26px 30px 24px; background: #1a1a1a; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #b91c1c; font-size: 10px; font-weight: 800; letter-spacing: 0.38em; text-transform: uppercase; }
      .eyebrow::before, .eyebrow::after { content: ""; width: 34px; height: 1px; background: rgba(185, 28, 28, 0.9); }
      .head h1 { margin: 14px 0 0; font-size: 44px; line-height: 0.95; letter-spacing: -0.04em; font-weight: 800; text-transform: uppercase; }
      .head p { margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.72); }
      .body { position: relative; padding: 30px; }
      .booking-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 1px solid rgba(26, 26, 26, 0.08); }
      .booking .label { font-size: 11px; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(26,26,26,0.38); }
      .booking .no { margin-top: 10px; font-size: 42px; font-weight: 800; letter-spacing: -0.04em; color: #b91c1c; }
      .stamp { padding: 10px 14px; border: 1px solid rgba(185, 28, 28, 0.28); color: #b91c1c; background: rgba(185, 28, 28, 0.05); border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; white-space: nowrap; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 26px; margin-top: 24px; }
      .item { padding: 14px 16px; border-radius: 14px; background: #ffffff; border: 1px solid rgba(26, 26, 26, 0.06); }
      .item .k { display: block; margin-bottom: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(26,26,26,0.38); }
      .item .v { display: block; font-size: 16px; font-weight: 700; line-height: 1.45; color: #1a1a1a; }
      .price { margin-top: 24px; padding: 18px 20px; border-radius: 18px; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
      .price .label { font-size: 11px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      .price .value { font-size: 34px; font-weight: 800; letter-spacing: -0.04em; color: #b91c1c; }
      .foot { margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(26,26,26,0.08); font-size: 12px; line-height: 1.7; color: rgba(26,26,26,0.56); }
      .actions { margin: 20px auto 0; max-width: 860px; display: flex; gap: 10px; justify-content: flex-end; }
      .btn { border: 1px solid rgba(26, 26, 26, 0.12); background: #fff; color: #1a1a1a; padding: 13px 18px; border-radius: 14px; font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; }
      .btn.primary { border-color: #b91c1c; background: #b91c1c; color: #fff; }
      .mono { font-family: "JetBrains Mono", monospace; }
      @media print {
        body { background: #fff; padding: 0; }
        .actions { display: none; }
        .ticket { box-shadow: none; border-color: rgba(26, 26, 26, 0.2); }
        .frame { max-width: none; }
      }
      @media (max-width: 720px) {
        body { padding: 16px; }
        .head h1 { font-size: 32px; }
        .booking-row { flex-direction: column; align-items: flex-start; }
        .booking .no { font-size: 30px; }
        .grid { grid-template-columns: 1fr; }
        .price { flex-direction: column; align-items: flex-start; }
        .price .value { font-size: 28px; }
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <section class="ticket">
        <header class="head">
          <div class="eyebrow">Kino Cinema</div>
          <h1>Movie Voucher</h1>
          <p>현장에서 직원에게 아래 교환권을 제시해 주세요.</p>
        </header>
        <div class="body">
          <div class="booking-row">
            <div class="booking">
              <div class="label">예매번호</div>
              <div class="no mono">${bookingNo}</div>
            </div>
          </div>
          <div class="grid">
            <div class="item"><span class="k">영화명</span><span class="v">${movieTitle}</span></div>
            <div class="item"><span class="k">관람인원</span><span class="v">${peopleText}</span></div>
            <div class="item"><span class="k">극장 / 상영관</span><span class="v">${theaterText}</span></div>
            <div class="item"><span class="k">관람좌석</span><span class="v">${seatsText}</span></div>
            <div class="item"><span class="k">관람일시</span><span class="v">${startTimeText}</span></div>
            <div class="item"><span class="k">결제일시</span><span class="v">${paidAtText}</span></div>
          </div>
          <div class="price">
            <div>
              <div class="label">결제금액</div>
              <div class="value">${amountText}</div>
            </div>
          </div>
          <div class="foot">
            <div>발행시각: ${issueAtText}</div>
            <div>본 교환권은 재출력이 가능하며, 유효 여부는 매표소 시스템 기준으로 판단됩니다.</div>
          </div>
        </div>
      </section>
    </div>

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
        <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">예매/취소내역</h1>

        <div className="mt-8 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-[#1A1A1A]">구분</span>
            <label className="flex items-center gap-2 text-[#1A1A1A]">
              <input
                type="radio"
                checked={historyType === "current"}
                onChange={() => setHistoryType("current")}
              />
              예매내역
            </label>
            <label className="flex items-center gap-2 text-[#1A1A1A]">
              <input
                type="radio"
                checked={historyType === "past"}
                onChange={() => setHistoryType("past")}
              />
              지난내역
            </label>
            <select
              className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm text-[#1A1A1A] disabled:bg-black/5 disabled:text-black/25"
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
              className="flex items-center gap-1 rounded-sm border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
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
          <p className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">총 {visibleReservations.length}건</p>
          {loading ? (
            <div className="mt-4 rounded-sm border border-black/5 bg-[#FDFDFD] py-12 text-center text-black/45 shadow-xl">불러오는 중...</div>
          ) : visibleReservations.length === 0 ? (
            <div className="mt-4 rounded-sm border border-black/5 bg-[#FDFDFD] py-12 text-center text-black/45 shadow-xl">예매 내역이 없습니다.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {visibleReservations.map((item) => {
                const canPay = isPayable(item.paymentStatus, item.holdExpiresAt); // ✨ 결제 가능 여부 체크

                return (
                  <div key={item.reservationId} className="rounded-sm border border-black/5 bg-[#FDFDFD] p-6 shadow-xl">
                    <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="h-[210px] w-[140px] shrink-0 overflow-hidden rounded-sm border border-black/10 bg-black/5">
                        {item.posterUrl ? <img src={item.posterUrl} alt={item.movieTitle} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-black/45">
                          예매번호 <span className="text-2xl font-semibold tracking-tight text-[#B91C1C]">{formatGuestBookingNo(item.reservationId, item.paidAt)}</span>
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-y-2 text-sm text-[#1A1A1A] lg:grid-cols-2">
                          <p><span className="font-semibold">영화명</span> {item.movieTitle}</p>
                          <p><span className="font-semibold">관람인원</span> 성인 {item.seatNames.length}명</p>
                          <p><span className="font-semibold">극장/상영관</span> {item.theaterName} / {item.screenName}</p>
                          <p><span className="font-semibold">관람좌석</span> {item.seatNames.join(", ") || "-"}</p>
                          <p><span className="font-semibold">관람일시</span> {formatDateTime(item.startTime)}</p>
                          <p><span className="font-semibold">결제일시</span> {canPay ? "-" : formatDateTime(item.paidAt ?? item.startTime)}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-sm bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                          <span>결제금액 {formatMoney(item.finalAmount)}</span>
                          {canPay && item.holdExpiresAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-normal text-black/40">남은 결제 시간</span>
                              <ReservationTimer expiresAt={item.holdExpiresAt} />
                            </div>
                          )}
                          {canPay && <span className="text-[#B91C1C]">(결제 대기 중)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {/* ✨ 결제하러 가기 버튼 (비회원 뷰) */}
                      {canPay && (
                        <button
                          className="rounded-sm bg-[#1A1A1A] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C]"
                          onClick={() => onClickPay(item.reservationId)}
                        >
                          결제하러 가기
                        </button>
                      )}
                      
                      {/* 결제가 안 된 상태면 교환권 출력 숨김 처리 */}
                      {!canPay && (
                        <button
                          className="rounded-sm border border-[#B91C1C] bg-white px-5 py-2 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
                          onClick={() => openPrintVoucher(item)}
                        >
                          교환권출력
                        </button>
                      )}

                      {item.cancellable ? (
                        <button
                          className="rounded-sm bg-[#B91C1C] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9f1919]"
                          disabled={isCancelling === item.reservationId}
                          onClick={() => openCancelModal(item.reservationId)}
                        >
                          {isCancelling === item.reservationId ? "처리 중..." : "예매취소"}
                        </button>
                      ) : (
                        <button className="cursor-not-allowed rounded-sm bg-black/15 px-5 py-2 text-sm font-semibold text-white" disabled>취소불가</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-semibold tracking-tight text-[#B91C1C]">예매취소내역</h2>
          <p className="mt-2 text-sm text-black/55">· 상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          <div className="mt-4 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
              <span>취소사유</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-6 text-center text-black/45">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => {
                const [cancelDate, cancelTime] = formatCompactDateTime(item.cancelledAt);
                const [screenDate, screenTime] = formatCompactDateTime(item.startTime);

                return (
                  <div
                    key={item.reservationId}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] items-center border-t border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]"
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
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/55">
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
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">예매/구매 내역</h1>

      <div className="mt-5 flex border-b border-black/10">
        <button
          className={`w-40 border border-b-0 px-4 py-3 text-sm font-semibold tracking-tight transition-colors ${reservationTab === "reservation" ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-black/10 bg-white text-black/40 hover:text-[#B91C1C]"}`}
          onClick={() => setReservationTab("reservation")}
        >
          예매
        </button>
        <button
          className={`w-40 border border-b-0 px-4 py-3 text-sm font-semibold tracking-tight transition-colors ${reservationTab === "purchase" ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-black/10 bg-white text-black/40 hover:text-[#B91C1C]"}`}
          onClick={() => setReservationTab("purchase")}
        >
          구매
        </button>
      </div>

      {reservationTab === "reservation" ? (
        <>
          <div className="mt-5 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold text-[#1A1A1A]">구분</span>
              <label className="flex items-center gap-2 text-[#1A1A1A]">
                <input
                  type="radio"
                  checked={historyType === "current"}
                  onChange={() => setHistoryType("current")}
                />
                예매내역
              </label>
              <label className="flex items-center gap-2 text-[#1A1A1A]">
                <input
                  type="radio"
                  checked={historyType === "past"}
                  onChange={() => setHistoryType("past")}
                />
                지난내역
            </label>
            <select
                className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm text-[#1A1A1A] disabled:bg-black/5 disabled:text-black/25"
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
                className="flex items-center gap-1 rounded-sm border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
                onClick={() => {
                  setAppliedHistoryType(historyType);
                  setAppliedMonth(historyType === "current" ? "" : selectedMonth);
                }}
              >
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm border border-black/5 bg-white shadow-xl">
            {loading ? (
              <div className="py-12 text-center text-black/45">불러오는 중...</div>
            ) : visibleReservations.length === 0 ? (
              <div className="py-12 text-center text-black/45">예매 내역이 없습니다.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {visibleReservations.map((item) => {
                  const canPay = isPayable(item.paymentStatus, item.holdExpiresAt); //결제 가능 여부 체크

                  return (
                    <div key={item.reservationId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-semibold tracking-tight text-[#1A1A1A]">{item.movieTitle}</p>
                          {canPay && <span className="rounded-sm bg-[#B91C1C]/10 px-2 py-0.5 text-xs font-bold text-[#B91C1C]">결제 대기</span>}
                          {!canPay && item.paymentStatus == "PAID" && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">결제 완료</span>}
                        </div>
                        <p className="mt-1 text-sm text-black/55">{item.theaterName} / {item.screenName}</p>
                        <p className="text-sm text-black/55">{formatDateTime(item.startTime)}</p>
                        <p className="text-sm text-black/55">좌석: {item.seatNames.join(", ") || "-"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        {canPay && item.holdExpiresAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-normal text-black/40">남은 결제 시간</span>
                              <ReservationTimer expiresAt={item.holdExpiresAt} />
                            </div>
                          )}
                        <p className="text-lg font-semibold text-[#1A1A1A]">{formatMoney(item.finalAmount)}</p>
                        
                        <div className="flex gap-2">
                          {/* ✨ 결제하러 가기 버튼 (환불하기 옆/위에 배치) */}
                          {canPay && (
                            <button
                              className="rounded-sm border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 text-sm text-white transition-colors hover:border-[#B91C1C] hover:bg-[#B91C1C]"
                              onClick={() => onClickPay(item.reservationId)}
                            >
                              결제하러 가기
                            </button>
                          )}

                          {/* 결제가 안 된 상태면 교환권 출력 숨김 처리 */}
                          {!canPay && (
                            <button
                              className="rounded-sm border border-[#B91C1C] bg-white px-5 py-2 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
                              onClick={() => openPrintVoucher(item)}
                            >
                              교환권출력
                            </button>
                          )}

                          {!canPay && item.cancellable ? (
                            <button
                              className="rounded-sm border border-[#B91C1C] px-4 py-2 text-sm text-[#B91C1C] transition-colors hover:bg-[#B91C1C]/5"
                              disabled={isCancelling === item.reservationId}
                              onClick={() => openCancelModal(item.reservationId)}
                            >
                              {isCancelling === item.reservationId ? "처리 중..." : "환불하기"}
                            </button>
                          ) : (
                            <span className="inline-block rounded-sm bg-black/5 px-4 py-2 text-sm text-black/35">환불 불가</span>
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
          <div className="mt-5 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="mr-2 font-semibold text-[#1A1A1A]">구분</span>
              <select
                className="rounded-sm border border-black/10 bg-white px-3 py-1.5 text-sm text-[#1A1A1A]"
                value={purchaseSelectType}
                onChange={(e) => setPurchaseSelectType(e.target.value as "all" | "movie")}
              >
                <option value="all">전체</option>
                <option value="movie">영화예매</option>
              </select>
              <label className="flex items-center gap-1.5 text-[#1A1A1A]">
                <input type="radio" checked={purchaseStatusType === "all"} onChange={() => setPurchaseStatusType("all")} />
                전체
              </label>
              <label className="flex items-center gap-1.5 text-[#1A1A1A]">
                <input type="radio" checked={purchaseStatusType === "purchase"} onChange={() => setPurchaseStatusType("purchase")} />
                구매내역
              </label>
              <label className="flex items-center gap-1.5 text-[#1A1A1A]">
                <input type="radio" checked={purchaseStatusType === "cancel"} onChange={() => setPurchaseStatusType("cancel")} />
                취소내역
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-2 font-semibold text-[#1A1A1A]">조회기간</span>
              <button className={`rounded-sm border border-black/10 px-3 py-1 transition-colors ${purchaseRange === "week" ? "text-[#B91C1C]" : "text-[#1A1A1A] hover:text-[#B91C1C]"}`} onClick={() => applyPurchaseRange("week")}>1주일</button>
              <button className={`rounded-sm border border-black/10 px-3 py-1 transition-colors ${purchaseRange === "month1" ? "text-[#B91C1C]" : "text-[#1A1A1A] hover:text-[#B91C1C]"}`} onClick={() => applyPurchaseRange("month1")}>1개월</button>
              <button className={`rounded-sm border border-black/10 px-3 py-1 transition-colors ${purchaseRange === "month3" ? "text-[#B91C1C]" : "text-[#1A1A1A] hover:text-[#B91C1C]"}`} onClick={() => applyPurchaseRange("month3")}>3개월</button>
              <button className={`rounded-sm border border-black/10 px-3 py-1 transition-colors ${purchaseRange === "month6" ? "text-[#B91C1C]" : "text-[#1A1A1A] hover:text-[#B91C1C]"}`} onClick={() => applyPurchaseRange("month6")}>6개월</button>
              <input type="date" className="rounded-sm border border-black/10 bg-white px-3 py-1 text-[#1A1A1A]" value={purchaseFrom} onChange={(e) => setPurchaseFrom(e.target.value)} />
              <span className="text-[#1A1A1A]">~</span>
              <input type="date" className="rounded-sm border border-black/10 bg-white px-3 py-1 text-[#1A1A1A]" value={purchaseTo} onChange={(e) => setPurchaseTo(e.target.value)} />
              <button
                className="flex items-center gap-1 rounded-sm border border-black/10 bg-white px-3 py-1 font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
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

          <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            <div className="p-5">
              <p className="text-base font-semibold text-[#1A1A1A]">전체 {purchaseRows.length}건</p>
              <div className="mt-2">
                <div className="grid grid-cols-6 border-y border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                  <span>예매번호</span>
                  <span>결제일시</span>
                  <span>구분</span>
                  <span>상품명</span>
                  <span>결제금액</span>
                  <span>상태</span>
                </div>
                {purchaseRows.length === 0 ? (
                  <div className="border-b border-black/5 py-10 text-center text-black/45">결제내역이 없습니다.</div>
                ) : (
                  purchaseRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-6 border-b border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]">
                      <span>{row.reservationNumber}</span>
                      <span>{formatDateTime(row.paymentDate.toISOString())}</span>
                      <span>{row.category}</span>
                      <span>{row.productName}</span>
                      <span>{formatMoney(row.amount)}</span>
                      <span className={row.isCancelled ? "text-[#B91C1C]" : "text-[#1A1A1A]"}>{row.statusLabel}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#FDFDFD] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
              <span>이용안내</span>
              <span>⌃</span>
            </div>
            <div className="p-4 text-sm leading-7 text-[#1A1A1A]">
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
          <h2 className="text-3xl font-semibold tracking-tight text-[#B91C1C]">예매취소내역</h2>
          <p className="mt-2 text-sm text-black/55">· 상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          <div className="mt-4 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
              <span>취소사유</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-6 text-center text-black/45">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => {
                const [cancelDate, cancelTime] = formatCompactDateTime(item.cancelledAt);
                const [screenDate, screenTime] = formatCompactDateTime(item.startTime);

                return (
                  <div
                    key={item.reservationId}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_1fr_0.9fr] items-center border-t border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]"
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
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/55">
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
        <div className="mt-8 rounded-sm border border-black/5 bg-[#FDFDFD] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35 shadow-xl">이용안내</div>
      ) : null}
    </section>
  );
}
