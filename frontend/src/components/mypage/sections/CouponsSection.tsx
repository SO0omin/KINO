import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { DownloadableCouponItem, DownloadSelectedCouponsResponse, MyCouponItem } from "../../../api/myPageApi";
import { cinemaAlert } from '../../../utils/alert';

type CouponsSectionProps = {
  couponTab: "megabox" | "partner";
  setCouponTab: (value: "megabox" | "partner") => void;
  couponLoading: boolean;
  couponItems: MyCouponItem[];
  formatDateTime: (value: string) => string;
  openCouponRegisterModal: () => void;
  couponKindFilter: "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타";
  setCouponKindFilter: (value: "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타") => void;
  couponSourceFilter: "전체" | "사용가능" | "사용완료" | "기간만료";
  setCouponSourceFilter: (value: "전체" | "사용가능" | "사용완료" | "기간만료") => void;
  couponStatusFilter: "available" | "used" | "expired";
  setCouponStatusFilter: (value: "available" | "used" | "expired") => void;
  couponHiddenOnly: boolean;
  setCouponHiddenOnly: (value: boolean) => void;
  filteredCoupons: MyCouponItem[];
  mapCouponStatusLabel: (status: string) => string;
  openCouponInfoModal: (item: MyCouponItem) => void;
  fetchDownloadableCouponsForCurrentTab: () => Promise<DownloadableCouponItem[]>;
  downloadSelectedCouponsForCurrentTab: (couponIds: number[]) => Promise<DownloadSelectedCouponsResponse>;
  applyCouponFilters: () => void;
};

export function CouponsSection({
  couponTab,
  setCouponTab,
  couponLoading,
  couponItems: _couponItems,
  formatDateTime,
  openCouponRegisterModal,
  couponKindFilter,
  setCouponKindFilter,
  couponSourceFilter,
  setCouponSourceFilter,
  couponStatusFilter: _couponStatusFilter,
  setCouponStatusFilter: _setCouponStatusFilter,
  couponHiddenOnly: _couponHiddenOnly,
  setCouponHiddenOnly: _setCouponHiddenOnly,
  filteredCoupons,
  mapCouponStatusLabel,
  openCouponInfoModal,
  fetchDownloadableCouponsForCurrentTab,
  downloadSelectedCouponsForCurrentTab,
  applyCouponFilters,
}: CouponsSectionProps) {
  const PAGE_SIZE = 10;
  const [couponPage, setCouponPage] = useState(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);
  const [downloadableCoupons, setDownloadableCoupons] = useState<DownloadableCouponItem[]>([]);
  const [selectedCouponIds, setSelectedCouponIds] = useState<number[]>([]);

  const totalCouponPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCoupons.length / PAGE_SIZE)),
    [filteredCoupons.length]
  );

  const pagedCoupons = useMemo(() => {
    const start = (couponPage - 1) * PAGE_SIZE;
    return filteredCoupons.slice(start, start + PAGE_SIZE);
  }, [couponPage, filteredCoupons]);

  useEffect(() => {
    if (couponPage > totalCouponPages) {
      setCouponPage(totalCouponPages);
      return;
    }
    if (couponPage !== 1) {
      setCouponPage(1);
    }
  }, [filteredCoupons, couponTab, totalCouponPages]);

  const openDownloadModal = async () => {
    setShowDownloadModal(true);
    setDownloadLoading(true);
    setSelectedCouponIds([]);
    try {
      const rows = await fetchDownloadableCouponsForCurrentTab();
      const selectable = rows.filter((item) => !item.alreadyOwned);
      setDownloadableCoupons(rows);
      setSelectedCouponIds(selectable.map((item) => item.couponId));
    } catch (error: any) {
      cinemaAlert(error?.message ?? "다운로드 가능 쿠폰 조회에 실패했습니다.", "알림");
      setShowDownloadModal(false);
    } finally {
      setDownloadLoading(false);
    }
  };

  const toggleCoupon = (couponId: number) => {
    setSelectedCouponIds((prev) =>
      prev.includes(couponId) ? prev.filter((id) => id !== couponId) : [...prev, couponId]
    );
  };

  const selectableIds = useMemo(
    () => downloadableCoupons.filter((item) => !item.alreadyOwned).map((item) => item.couponId),
    [downloadableCoupons]
  );

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedCouponIds.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCouponIds([]);
      return;
    }
    setSelectedCouponIds(selectableIds);
  };

  const submitSelectedDownload = async () => {
    if (selectedCouponIds.length === 0) {
      cinemaAlert("다운로드할 쿠폰을 선택해 주세요.", "알림");
      return;
    }
    setDownloadSubmitting(true);
    try {
      const result = await downloadSelectedCouponsForCurrentTab(selectedCouponIds);
      setShowDownloadModal(false);
      const pointText =
        result.pointAppliedCount > 0 ? ` / 포인트 즉시적립 ${result.pointAppliedCount}건` : "";
      cinemaAlert(
        `선택 다운로드 완료: ${result.downloadedCount}건 (중복/제외 ${result.skippedCount}건${pointText})`,"알림"
      );
    } catch (error: any) {
      cinemaAlert(error?.message ?? "선택 쿠폰 다운로드에 실패했습니다.","알림");
    } finally {
      setDownloadSubmitting(false);
    }
  };

  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">키노/제휴쿠폰</h1>

      <div className="mt-5 flex border-b border-black/10">
        <button
          className={`w-44 border border-b-0 px-4 py-3 text-sm font-semibold tracking-tight transition-colors ${couponTab === "megabox" ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-black/10 bg-white text-black/40 hover:text-[#B91C1C]"}`}
          onClick={() => setCouponTab("megabox")}
        >
          키노 쿠폰
        </button>
        <button
          className={`w-44 border border-b-0 px-4 py-3 text-sm font-semibold tracking-tight transition-colors ${couponTab === "partner" ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-black/10 bg-white text-black/40 hover:text-[#B91C1C]"}`}
          onClick={() => setCouponTab("partner")}
        >
          제휴 쿠폰
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-black/55">· 보유하신 쿠폰 내역입니다.</p>
          <p className="text-sm text-black/55">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-sm border border-black/10 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C] disabled:opacity-60"
            onClick={openDownloadModal}
            disabled={downloadSubmitting}
          >
            {downloadSubmitting ? "다운로드 중..." : "전체 다운로드"}
          </button>
          <button
            className="rounded-sm border border-[#B91C1C] bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
            onClick={openCouponRegisterModal}
          >
            {couponTab === "partner" ? "제휴쿠폰 등록" : "할인쿠폰 등록"}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-black/5 bg-[#FDFDFD] p-5 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-[#1A1A1A]">유형</span>
          {(["전체", "매표", "매점", "포인트", "포토카드", "기타"] as const).map((type) => (
            <button
              key={type}
              className={`rounded-sm border px-4 py-2 transition-colors ${couponKindFilter === type ? "border-[#B91C1C] text-[#B91C1C]" : "border-black/10 text-[#1A1A1A] hover:border-[#B91C1C] hover:text-[#B91C1C]"}`}
              onClick={() => setCouponKindFilter(type)}
            >
              {type}
            </button>
          ))}
          <span className="ml-4 font-semibold text-[#1A1A1A]">구분</span>
          <select
            className="rounded-sm border border-black/10 bg-white px-3 py-2 text-[#1A1A1A]"
            value={couponSourceFilter}
            onChange={(e) => setCouponSourceFilter(e.target.value as "전체" | "사용가능" | "사용완료" | "기간만료")}
          >
            <option>전체</option>
            <option>사용가능</option>
            <option>사용완료</option>
            <option>기간만료</option>
          </select>
          <button
            className="flex items-center gap-1 rounded-sm border border-black/10 bg-white px-4 py-2 font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
            onClick={applyCouponFilters}
          >
            <Search className="h-4 w-4" /> 조회
          </button>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          총 <span className="text-[#B91C1C]">{filteredCoupons.length}</span>매
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
        <div className="grid grid-cols-5 border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
          <span>구분</span>
          <span>쿠폰명</span>
          <span>유효기간</span>
          <span>사용상태</span>
          <span>정보</span>
        </div>

        {couponLoading ? (
          <div className="py-10 text-center text-sm text-black/45">불러오는 중...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-10 text-center text-sm text-black/45">조회된 쿠폰 내역이 없습니다.</div>
        ) : (
          pagedCoupons.map((item) => (
            <div key={item.memberCouponId} className="grid grid-cols-5 items-center border-t border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]">
              <span>{item.couponKind || "기타"}</span>
              <div>
                <p>{item.couponName}</p>
                <p className="text-black/40">{item.couponCode}</p>
              </div>
              <span>{item.expiresAt ? formatDateTime(item.expiresAt) : "-"}</span>
              <span>{mapCouponStatusLabel(item.status)}</span>
              <button
                className="mx-auto rounded-sm border border-black/10 bg-white px-3 py-1 text-sm text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
                onClick={() => openCouponInfoModal(item)}
              >
                쿠폰정보
              </button>
            </div>
          ))
        )}
      </div>

      {filteredCoupons.length > 0 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
            disabled={couponPage === 1}
            onClick={() => setCouponPage((prev) => Math.max(1, prev - 1))}
          >
            이전
          </button>
          {Array.from({ length: totalCouponPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              className={`rounded-sm px-4 py-2 text-sm ${couponPage === page ? "bg-[#B91C1C] text-white" : "border border-black/10 bg-white text-[#1A1A1A]"}`}
              onClick={() => setCouponPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
            disabled={couponPage === totalCouponPages}
            onClick={() => setCouponPage((prev) => Math.min(totalCouponPages, prev + 1))}
          >
            다음
          </button>
        </div>
      ) : null}

      <div className="mt-8 rounded-sm border border-black/5 bg-[#FDFDFD] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35 shadow-xl">이용안내</div>

      {showDownloadModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/78 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-sm border border-black/5 bg-[#FDFDFD] shadow-2xl">
            <div className="flex items-center justify-between bg-[#1A1A1A] px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B91C1C]">Kino Mypage</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">다운로드 가능 쿠폰</h3>
              </div>
              <button
                className="text-4xl leading-none text-white/70 transition-colors hover:text-white"
                onClick={() => setShowDownloadModal(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 p-6">
              {downloadLoading ? (
                <div className="py-10 text-center text-sm text-black/45">불러오는 중...</div>
              ) : downloadableCoupons.length === 0 ? (
                <div className="py-10 text-center text-sm text-black/45">다운로드 가능한 쿠폰이 없습니다.</div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-sm border border-black/5 bg-white px-4 py-4 shadow-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                      전체 선택
                    </label>
                    <p className="text-sm text-black/55">
                      선택 {selectedCouponIds.length}건 / 전체 {selectableIds.length}건
                    </p>
                  </div>

                  <div className="space-y-2">
                    {downloadableCoupons.map((item) => {
                      const disabled = item.alreadyOwned;
                      const checked = selectedCouponIds.includes(item.couponId);
                      return (
                        <label
                          key={item.couponId}
                          className={`flex items-center justify-between rounded-sm border px-4 py-4 transition-colors ${disabled ? "border-black/10 bg-black/5 text-black/30" : "border-black/5 bg-white text-[#1A1A1A] shadow-sm hover:border-[#B91C1C]/30"}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleCoupon(item.couponId)}
                            />
                            <div>
                              <p className="text-sm font-semibold">{item.couponName}</p>
                              <p className="text-xs text-black/45">
                                {item.couponCode} / {item.couponKind || "기타"}
                                {item.couponKind === "포인트" ? " (다운로드 즉시 포인트 적립)" : ""}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-black/45">
                            {item.discountType === "RATE"
                              ? `${item.discountValue}% 할인`
                              : `${item.discountValue.toLocaleString()} ${item.couponKind === "포인트" ? "P" : "원"}`}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="mt-2 flex justify-center gap-3">
                <button
                  className="rounded-sm border border-black/10 bg-white px-8 py-3 text-base font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
                  onClick={() => setShowDownloadModal(false)}
                  disabled={downloadSubmitting}
                >
                  취소
                </button>
                <button
                  className="rounded-sm bg-[#B91C1C] px-8 py-2 text-base font-semibold text-white disabled:opacity-60"
                  onClick={submitSelectedDownload}
                  disabled={downloadSubmitting || downloadLoading || selectedCouponIds.length === 0}
                >
                  {downloadSubmitting ? "다운로드 중..." : "선택 다운로드"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
