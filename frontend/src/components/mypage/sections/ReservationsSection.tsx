import { useState } from "react";
import { Search } from "lucide-react";
import type { MyReservationItem } from "../../../api/myPageApi";
import { ReservationTimer } from "../modals/ReservationTimer";

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
  onClickPay: (reservationId: number) => void;
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
  
  // ✨ 핵심 추가: 만료된 예약 번호들을 기억하는 상태값 (화면 새로고침 없이 버튼을 숨기기 위함)
  const [expiredList, setExpiredList] = useState<number[]>([]);

  const handleExpire = (reservationId: number) => {
    // 타이머에서 시간이 다 됐다고 알려주면, 만료 목록에 추가하여 컴포넌트를 다시 렌더링시킴
    setExpiredList((prev) => [...prev, reservationId]);
  };
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
  
  const isPayable = (paymentStatus?: string, holdExpiresAt?: string, reservationId?: number) => {
    if (paymentStatus !== "READY" || !holdExpiresAt) return false;
    
    // ✨ 이미 로컬에서 만료되었다고 체크된 예약이면 무조건 false 반환
    if (reservationId && expiredList.includes(reservationId)) return false;

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

    // 티켓 영수증 디자인도 Kino 테마로 변경
    const html = `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>${bookingNo} 교환권</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 28px; background: #f3f4f6; font-family: "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; color: #111827; }
      .ticket { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #1A1A1A; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      .head { padding: 24px; background: #1A1A1A; color: #fff; text-align: center; }
      .head h1 { margin: 0; font-size: 24px; letter-spacing: 0.3em; text-transform: uppercase; }
      .head p { margin: 8px 0 0 0; font-size: 11px; opacity: 0.6; letter-spacing: 0.1em; }
      .body { padding: 30px; }
      .booking { margin-bottom: 24px; text-align: center; border-bottom: 1px dashed #e5e7eb; padding-bottom: 24px; }
      .booking .label { font-size: 10px; color: #B91C1C; letter-spacing: 0.2em; font-weight: bold; text-transform: uppercase; }
      .booking .no { margin-top: 8px; font-size: 32px; font-weight: 800; color: #1A1A1A; letter-spacing: 0.05em; font-family: monospace; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 14px; }
      .item { font-size: 14px; line-height: 1.5; }
      .item b { display: block; font-size: 10px; color: #9ca3af; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
      .price { margin-top: 30px; padding: 20px; background: #fafafa; border: 1px solid #f3f4f6; font-size: 20px; font-weight: 800; color: #B91C1C; text-align: right; }
      .foot { margin-top: 24px; font-size: 11px; color: #9ca3af; line-height: 1.6; text-align: center; }
      .actions { margin: 24px auto 0; max-width: 760px; display: flex; gap: 12px; justify-content: center; }
      .btn { border: 1px solid #e5e7eb; background: #fff; color: #111827; padding: 12px 24px; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
      .btn.primary { border-color: #B91C1C; background: #B91C1C; color: #fff; }
      @media print {
        body { background: #fff; padding: 0; }
        .actions { display: none; }
        .ticket { border-color: #111827; box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <section class="ticket">
      <header class="head">
        <h1>Kino Cinema</h1>
        <p>MOVIE VOUCHER</p>
      </header>
      <div class="body">
        <div class="booking">
          <div class="label">Booking Number</div>
          <div class="no">${bookingNo}</div>
        </div>
        <div class="grid">
          <div class="item"><b>Movie</b>${movieTitle}</div>
          <div class="item"><b>Audience</b>${peopleText}</div>
          <div class="item"><b>Venue</b>${theaterText}</div>
          <div class="item"><b>Seats</b>${seatsText}</div>
          <div class="item"><b>Date / Time</b>${startTimeText}</div>
          <div class="item"><b>Paid At</b>${paidAtText}</div>
        </div>
        <div class="price">TOTAL ${amountText}</div>
        <div class="foot">
          <div>Issued: ${issueAtText}</div>
          <div>본 교환권은 재출력이 가능하며, 유효 여부는 매표소 시스템 기준으로 판단됩니다.</div>
        </div>
      </div>
    </section>
    <div class="actions">
      <button class="btn" onclick="window.close()">Close</button>
      <button class="btn primary" onclick="window.print()">Print Voucher</button>
    </div>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  // ==========================================
  // [1] 비회원 (Guest) 뷰
  // ==========================================
  if (guestView) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
            <div className="w-8 h-px bg-[#B91C1C]"></div>
            <span>Guest Booking History</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-[#1A1A1A] mb-8">
            예매/취소내역
        </h1>

        {/* 필터 영역 */}
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 shadow-xl mb-10">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category</span>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                <input type="radio" className="accent-[#B91C1C]" checked={historyType === "current"} onChange={() => setHistoryType("current")} />
                예매내역
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                <input type="radio" className="accent-[#B91C1C]" checked={historyType === "past"} onChange={() => setHistoryType("past")} />
                지난내역
                </label>
            </div>
            <select
              className="border border-black/10 bg-white px-4 py-2 text-xs font-bold rounded-sm outline-none focus:border-[#B91C1C] disabled:bg-black/5 disabled:text-black/20"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={historyType === "current"}
            >
              {monthOptions.length === 0 ? (
                <option value="">월 데이터 없음</option>
              ) : (
                monthOptions.map((month) => (
                  <option key={month} value={month}>{monthLabel(month)}</option>
                ))
              )}
            </select>
            <button
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#B91C1C] transition-colors"
              onClick={() => {
                setAppliedHistoryType(historyType);
                setAppliedMonth(historyType === "current" ? "" : selectedMonth);
              }}
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>

        {/* 리스트 영역 */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total <span className="text-[#1A1A1A]">{visibleReservations.length}</span></p>
          </div>
          
          {loading ? (
            <div className="py-20 flex justify-center border border-dashed border-black/10 rounded-sm bg-[#FDFDFD]">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] animate-pulse">Loading...</span>
            </div>
          ) : visibleReservations.length === 0 ? (
            <div className="py-20 flex justify-center border border-dashed border-black/10 rounded-sm bg-[#FDFDFD]">
                <span className="text-xs font-bold uppercase tracking-widest text-black/20">예매 내역이 없습니다.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleReservations.map((item) => {
                const canPay = isPayable(item.paymentStatus, item.holdExpiresAt, item.reservationId); // ✨ 만료 로직 적용

                return (
                  <div key={item.reservationId} className="bg-white border border-black/5 rounded-sm p-6 shadow-xl hover:border-black/10 transition-colors group">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      
                      {/* 포스터 */}
                      <div className="h-[210px] w-[140px] shrink-0 overflow-hidden rounded-sm border border-black/5 bg-black/5">
                        {item.posterUrl ? <img src={item.posterUrl} alt={item.movieTitle} className="h-full w-full object-cover" /> : null}
                      </div>
                      
                      {/* 상세 정보 */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                                Booking No. <span className="font-mono text-sm tracking-normal text-[#B91C1C] ml-2">{formatGuestBookingNo(item.reservationId, item.paidAt)}</span>
                                </p>
                                {canPay && <span className="px-2 py-1 bg-[#B91C1C]/10 text-[#B91C1C] text-[9px] font-bold uppercase tracking-widest rounded-sm border border-[#B91C1C]/20">Payment Pending</span>}
                                {!canPay && item.paymentStatus === "PAID" && <span className="px-2 py-1 bg-black/5 text-[#1A1A1A] text-[9px] font-bold uppercase tracking-widest rounded-sm border border-black/10">Confirmed</span>}
                                {!canPay && item.paymentStatus === "PENDING" && <span className="px-2 py-1 bg-black/5 text-black/40 text-[9px] font-bold uppercase tracking-widest rounded-sm border border-black/10">Expired</span>}
                            </div>
                            
                            <h3 className="font-display text-2xl uppercase tracking-tight text-[#1A1A1A] mb-4 group-hover:text-[#B91C1C] transition-colors">{item.movieTitle}</h3>
                            
                            <div className="grid grid-cols-1 gap-y-3 text-xs md:grid-cols-2">
                                <p><span className="inline-block w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Audience</span> 성인 {item.seatNames.length}명</p>
                                <p><span className="inline-block w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Venue</span> {item.theaterName} / {item.screenName}</p>
                                <p><span className="inline-block w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Seats</span> <span className="font-bold text-[#B91C1C]">{item.seatNames.join(", ") || "-"}</span></p>
                                <p><span className="inline-block w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Date</span> {formatDateTime(item.startTime)}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between bg-black/[0.02] border border-black/5 rounded-sm p-4 gap-4">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total Amount</span>
                            <span className="font-display text-xl">{formatMoney(item.finalAmount)}</span>
                          </div>
                          
                          {/* 타이머 영역 */}
                          {canPay && item.holdExpiresAt && (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Time Left</span>
                              {/* ✨ onExpire 콜백 연결! */}
                              <ReservationTimer expiresAt={item.holdExpiresAt} onExpire={() => handleExpire(item.reservationId)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 영역 */}
                    <div className="mt-6 pt-6 border-t border-black/5 flex justify-end gap-3">
                      {canPay && (
                        <button
                          className="px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#B91C1C] transition-colors shadow-md"
                          onClick={() => onClickPay(item.reservationId)}
                        >
                          Proceed to Payment
                        </button>
                      )}
                      
                      {!canPay && item.paymentStatus === "PAID" && (
                        <button
                          className="px-6 py-3 bg-white border border-[#B91C1C] text-[#B91C1C] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#B91C1C]/5 transition-colors"
                          onClick={() => openPrintVoucher(item)}
                        >
                          Print Voucher
                        </button>
                      )}

                      {item.cancellable ? (
                        <button
                          className="px-6 py-3 bg-white border border-black/10 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:border-black/30 transition-colors"
                          disabled={isCancelling === item.reservationId}
                          onClick={() => openCancelModal(item.reservationId)}
                        >
                          {isCancelling === item.reservationId ? "Processing..." : "Cancel Booking"}
                        </button>
                      ) : (
                        <button className="px-6 py-3 bg-black/5 text-black/20 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm cursor-not-allowed" disabled>
                            Cannot Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 취소 내역 */}
        <div className="mt-16">
          <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>Cancellation History</span>
          </div>
          <h2 className="font-display text-3xl uppercase tracking-tight text-[#1A1A1A] mb-2">예매취소내역</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-6">상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl overflow-hidden">
            <div className="grid grid-cols-5 bg-black/[0.02] px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-black/40 border-b border-black/5">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => (
                <div key={item.reservationId} className="grid grid-cols-5 border-b border-black/5 last:border-0 px-4 py-4 text-center text-xs text-[#1A1A1A] items-center">
                  <span className="text-black/60">{formatDateTime(item.cancelledAt ?? "")}</span>
                  <span className="font-bold">{item.movieTitle}</span>
                  <span>{item.theaterName}</span>
                  <span className="text-black/60">{formatDateTime(item.startTime)}</span>
                  <span className="font-display text-lg text-[#B91C1C]">{formatMoney(item.finalAmount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // [2] 회원 (Member) 뷰
  // ==========================================
  return (
    <section className="py-8">
      <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
          <div className="w-8 h-px bg-[#B91C1C]"></div>
          <span>My History</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-[#1A1A1A] mb-8">
          예매/구매 내역
      </h1>

      {/* 탭 네비게이션 */}
      <div className="flex mb-8 border-b border-black/10">
        <button
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${reservationTab === "reservation" ? "text-[#B91C1C]" : "text-black/40 hover:text-black"}`}
          onClick={() => setReservationTab("reservation")}
        >
          예매 내역
          {reservationTab === "reservation" && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>}
        </button>
        <button
          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${reservationTab === "purchase" ? "text-[#B91C1C]" : "text-black/40 hover:text-black"}`}
          onClick={() => setReservationTab("purchase")}
        >
          구매 내역
          {reservationTab === "purchase" && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>}
        </button>
      </div>

      {reservationTab === "reservation" ? (
        <>
          {/* 예매내역 필터 */}
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 shadow-xl mb-10">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <input type="radio" className="accent-[#B91C1C]" checked={historyType === "current"} onChange={() => setHistoryType("current")} />
                  예매내역
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <input type="radio" className="accent-[#B91C1C]" checked={historyType === "past"} onChange={() => setHistoryType("past")} />
                  지난내역
                </label>
              </div>
              <select
                className="border border-black/10 bg-white px-4 py-2 text-xs font-bold rounded-sm outline-none focus:border-[#B91C1C] disabled:bg-black/5 disabled:text-black/20"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={historyType === "current"}
              >
                {monthOptions.length === 0 ? (
                  <option value="">월 데이터 없음</option>
                ) : (
                  monthOptions.map((month) => (
                    <option key={month} value={month}>{monthLabel(month)}</option>
                  ))
                )}
              </select>
              <button
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#B91C1C] transition-colors"
                onClick={() => {
                  setAppliedHistoryType(historyType);
                  setAppliedMonth(historyType === "current" ? "" : selectedMonth);
                }}
              >
                <Search size={14} /> Search
              </button>
            </div>
          </div>

          {/* 예매내역 리스트 */}
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl p-8 mb-16">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total <span className="text-[#1A1A1A]">{visibleReservations.length}</span></p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center border border-dashed border-black/10 rounded-sm bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] animate-pulse">Loading...</span>
              </div>
            ) : visibleReservations.length === 0 ? (
              <div className="py-20 flex justify-center border border-dashed border-black/10 rounded-sm bg-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-black/20">예매 내역이 없습니다.</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {visibleReservations.map((item) => {
                  const canPay = isPayable(item.paymentStatus, item.holdExpiresAt, item.reservationId); // ✨ 만료 로직 적용

                  return (
                    <div key={item.reservationId} className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between py-6 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-display text-2xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors">{item.movieTitle}</p>
                          {canPay && <span className="px-2 py-0.5 bg-[#B91C1C]/10 text-[#B91C1C] text-[9px] font-bold uppercase tracking-widest rounded-sm border border-[#B91C1C]/20">결제 대기</span>}
                          {!canPay && item.paymentStatus === "PAID" && <span className="px-2 py-0.5 bg-black/5 text-[#1A1A1A] text-[9px] font-bold uppercase tracking-widest rounded-sm border border-black/10">결제 완료</span>}
                          {!canPay && item.paymentStatus === "PENDING" && <span className="px-2 py-0.5 bg-black/5 text-black/40 text-[9px] font-bold uppercase tracking-widest rounded-sm border border-black/10">시간 만료</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">
                            <span>{item.theaterName} / {item.screenName}</span>
                            <span className="text-black/20">|</span>
                            <span>{formatDateTime(item.startTime)}</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">좌석: <span className="text-[#1A1A1A]">{item.seatNames.join(", ") || "-"}</span></p>
                      </div>
                      
                      <div className="flex flex-col items-start lg:items-end gap-3 mt-4 lg:mt-0">
                        <div className="flex items-center gap-4">
                            {canPay && item.holdExpiresAt && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-black/10 rounded-sm">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Time Left</span>
                                {/* ✨ onExpire 콜백 연결! */}
                                <ReservationTimer expiresAt={item.holdExpiresAt} onExpire={() => handleExpire(item.reservationId)} />
                                </div>
                            )}
                            <p className="font-display text-2xl text-[#1A1A1A]">{formatMoney(item.finalAmount)}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {canPay && (
                            <button
                              className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#B91C1C] transition-colors shadow-sm"
                              onClick={() => onClickPay(item.reservationId)}
                            >
                              결제 하러가기
                            </button>
                          )}

                          {!canPay && item.paymentStatus === "PAID" && (
                            <button
                              className="px-6 py-2 bg-white border border-[#B91C1C] text-[#B91C1C] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#B91C1C]/5 transition-colors"
                              onClick={() => openPrintVoucher(item)}
                            >
                              교환권 발급
                            </button>
                          )}

                          {!canPay && item.cancellable ? (
                            <button
                              className="px-6 py-2 bg-white border border-black/10 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:border-black/30 transition-colors"
                              disabled={isCancelling === item.reservationId}
                              onClick={() => openCancelModal(item.reservationId)}
                            >
                              {isCancelling === item.reservationId ? "처리중..." : "환불하기"}
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-black/5 text-black/20 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">환불 불가</span>
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
          {/* 스토어 구매내역 필터 */}
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-6 shadow-xl mb-10">
            <div className="flex flex-wrap items-center gap-6 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category</span>
              <select
                className="border border-black/10 bg-white px-4 py-2 text-xs font-bold rounded-sm outline-none focus:border-[#B91C1C]"
                value={purchaseSelectType}
                onChange={(e) => setPurchaseSelectType(e.target.value as "all" | "movie")}
              >
                <option value="all">전체보기</option>
                <option value="movie">영화예매권</option>
              </select>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <input type="radio" className="accent-[#B91C1C]" checked={purchaseStatusType === "all"} onChange={() => setPurchaseStatusType("all")} /> 전체
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <input type="radio" className="accent-[#B91C1C]" checked={purchaseStatusType === "purchase"} onChange={() => setPurchaseStatusType("purchase")} /> 구매내역
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  <input type="radio" className="accent-[#B91C1C]" checked={purchaseStatusType === "cancel"} onChange={() => setPurchaseStatusType("cancel")} /> 취소내역
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mr-3">Period</span>
              <button className={`px-4 py-1.5 border rounded-sm text-xs font-bold transition-colors ${purchaseRange === "week" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white border-black/10 text-black/60 hover:border-black/30"}`} onClick={() => applyPurchaseRange("week")}>1주일</button>
              <button className={`px-4 py-1.5 border rounded-sm text-xs font-bold transition-colors ${purchaseRange === "month1" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white border-black/10 text-black/60 hover:border-black/30"}`} onClick={() => applyPurchaseRange("month1")}>1개월</button>
              <button className={`px-4 py-1.5 border rounded-sm text-xs font-bold transition-colors ${purchaseRange === "month3" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white border-black/10 text-black/60 hover:border-black/30"}`} onClick={() => applyPurchaseRange("month3")}>3개월</button>
              <button className={`px-4 py-1.5 border rounded-sm text-xs font-bold transition-colors ${purchaseRange === "month6" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white border-black/10 text-black/60 hover:border-black/30"}`} onClick={() => applyPurchaseRange("month6")}>6개월</button>
              
              <div className="flex items-center gap-2 ml-4">
                  <input type="date" className="border border-black/10 bg-white px-3 py-1.5 text-xs rounded-sm outline-none focus:border-[#B91C1C]" value={purchaseFrom} onChange={(e) => setPurchaseFrom(e.target.value)} />
                  <span className="text-black/40">~</span>
                  <input type="date" className="border border-black/10 bg-white px-3 py-1.5 text-xs rounded-sm outline-none focus:border-[#B91C1C]" value={purchaseTo} onChange={(e) => setPurchaseTo(e.target.value)} />
              </div>
              
              <button
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#B91C1C] transition-colors ml-2"
                onClick={() => {
                  setAppliedPurchaseSelectType(purchaseSelectType);
                  setAppliedPurchaseStatusType(purchaseStatusType);
                  setAppliedPurchaseFrom(purchaseFrom);
                  setAppliedPurchaseTo(purchaseTo);
                }}
              >
                <Search size={14} /> Search
              </button>
            </div>
          </div>

          {/* 스토어 구매내역 리스트 */}
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl overflow-hidden mb-10">
            <div className="p-8 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Total <span className="text-[#1A1A1A]">{purchaseRows.length}</span></p>
            </div>
            <div className="grid grid-cols-6 bg-black/[0.02] border-y border-black/5 px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-black/40">
                <span>예매번호</span>
                <span>결제일시</span>
                <span>구분</span>
                <span>상품명</span>
                <span>결제금액</span>
                <span>상태</span>
            </div>
            {purchaseRows.length === 0 ? (
                <div className="py-20 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">결제내역이 없습니다.</div>
            ) : (
                <div className="flex flex-col">
                {purchaseRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-6 border-b border-black/5 last:border-0 px-4 py-5 text-center text-xs text-[#1A1A1A] items-center hover:bg-black/[0.01]">
                    <span className="font-mono">{row.reservationNumber}</span>
                    <span className="text-black/60">{formatDateTime(row.paymentDate.toISOString())}</span>
                    <span className="font-bold">{row.category}</span>
                    <span className="font-bold">{row.productName}</span>
                    <span className="font-display text-lg text-[#B91C1C]">{formatMoney(row.amount)}</span>
                    <span className={`font-bold ${row.isCancelled ? "text-[#B91C1C]" : "text-[#1A1A1A]"}`}>{row.statusLabel}</span>
                    </div>
                ))}
                </div>
            )}
          </div>

          {/* 이용안내 (스토어) */}
          <div className="bg-black/5 border border-black/10 rounded-sm p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-6">Notice</h3>
            
            <p className="text-xs font-bold text-[#1A1A1A] mb-3">[스토어 구매/취소 안내]</p>
            <ul className="space-y-2 text-[10px] font-bold tracking-widest text-black/60 leading-relaxed list-disc list-inside marker:text-black/20 mb-6">
                <li>스토어 상품은 구매 후 취소가능기간 내 100% 환불이 가능하며, 부분환불은 불가 합니다.</li>
                <li className="list-none pl-4 text-black/40">(ex. 3개의 쿠폰 합 번에 구매하신 경우, 3개 모두 취소만 가능하며 그 중 사용하신 쿠폰이 있는 경우 환불 불가)</li>
                <li>스토어 교환권은 MMS로 최대 1회 재전송 하실 수 있습니다.</li>
            </ul>

            <p className="text-xs font-bold text-[#1A1A1A] mb-3">[모바일오더 구매/취소 안내]</p>
            <ul className="space-y-2 text-[10px] font-bold tracking-widest text-black/60 leading-relaxed list-disc list-inside marker:text-black/20">
                <li>모바일오더는 모바일앱을 통해 이용하실 수 있습니다.</li>
                <li>모바일오더는 구매 후 즉시 조리되는 상품으로 취소가 불가합니다.</li>
                <li>극장 매점에서 주문번호가 호출되면 상품을 수령하실 수 있습니다.</li>
                <li>극장 상황에 따라 상품준비시간이 다소 길어질 수 있습니다.</li>
            </ul>
          </div>
        </>
      )}

      {/* 예매 취소 내역 (하단 공통) */}
      {reservationTab === "reservation" ? (
        <div className="mt-16">
          <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-4">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>Cancellation History</span>
          </div>
          <h2 className="font-display text-3xl uppercase tracking-tight text-[#1A1A1A] mb-2">예매취소내역</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-6">상영일 기준 7일간 취소내역을 확인하실 수 있습니다.</p>
          
          <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl overflow-hidden mb-10">
            <div className="grid grid-cols-5 bg-black/[0.02] px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-black/40 border-b border-black/5">
              <span>취소일시</span>
              <span>영화명</span>
              <span>극장</span>
              <span>상영일시</span>
              <span>취소금액</span>
            </div>
            {cancelledReservations.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-black/20">취소내역이 없습니다.</div>
            ) : (
              cancelledReservations.map((item) => (
                <div key={item.reservationId} className="grid grid-cols-5 border-b border-black/5 last:border-0 px-4 py-4 text-center text-xs text-[#1A1A1A] items-center">
                  <span className="text-black/60">{formatDateTime(item.cancelledAt ?? "")}</span>
                  <span className="font-bold">{item.movieTitle}</span>
                  <span>{item.theaterName}</span>
                  <span className="text-black/60">{formatDateTime(item.startTime)}</span>
                  <span className="font-display text-lg text-[#B91C1C]">{formatMoney(item.finalAmount)}</span>
                </div>
              ))
            )}
          </div>
          
          {/* 이용안내 (예매) */}
          <div className="bg-black/5 border border-black/10 rounded-sm p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-4">Notice</h3>
            <ul className="space-y-3 text-[10px] font-bold tracking-widest text-black/60 leading-relaxed list-disc list-inside marker:text-black/20">
                <li>온라인 예매 취소는 상영 시작 20분 전까지 가능합니다.</li>
                <li>부분 취소는 불가하며, 전체 취소 후 다시 예매하셔야 합니다.</li>
                <li>현장 결제하신 내역은 온라인에서 취소가 불가능하며, 극장 매표소에 방문하셔야 합니다.</li>
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}