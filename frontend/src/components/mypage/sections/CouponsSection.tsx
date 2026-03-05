import { Search } from "lucide-react";
import type { MyCouponItem } from "../../../api/myPageApi";

type CouponsSectionProps = {
  couponTab: "megabox" | "partner";
  setCouponTab: (value: "megabox" | "partner") => void;
  couponLoading: boolean;
  couponItems: MyCouponItem[];
  formatDateTime: (value: string) => string;
  openCouponRegisterModal: () => void;
  couponKindFilter: "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타";
  setCouponKindFilter: (value: "전체" | "매표" | "매점" | "포인트" | "포토카드" | "기타") => void;
  couponSourceFilter: "전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스";
  setCouponSourceFilter: (value: "전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스") => void;
  couponStatusFilter: "available" | "used" | "expired";
  setCouponStatusFilter: (value: "available" | "used" | "expired") => void;
  couponHiddenOnly: boolean;
  setCouponHiddenOnly: (value: boolean) => void;
  filteredCoupons: MyCouponItem[];
  mapCouponStatusLabel: (status: string) => string;
  openCouponInfoModal: (item: MyCouponItem) => void;
};

export function CouponsSection({
  couponTab,
  setCouponTab,
  couponLoading,
  couponItems,
  formatDateTime,
  openCouponRegisterModal,
  couponKindFilter,
  setCouponKindFilter,
  couponSourceFilter,
  setCouponSourceFilter,
  couponStatusFilter,
  setCouponStatusFilter,
  couponHiddenOnly,
  setCouponHiddenOnly,
  filteredCoupons,
  mapCouponStatusLabel,
  openCouponInfoModal,
}: CouponsSectionProps) {
  return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">키노/제휴쿠폰</h1>

      <div className="mt-5 flex border-b border-gray-200">
        <button
          className={`w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "megabox" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`}
          onClick={() => setCouponTab("megabox")}
        >
          키노 쿠폰
        </button>
        <button
          className={`w-44 border border-b-0 px-4 py-2 text-sm ${couponTab === "partner" ? "border-[#000000] bg-[#000000] text-[#ffffff]" : "border-gray-200 bg-[#ffffff] text-[#000000]"}`}
          onClick={() => setCouponTab("partner")}
        >
          제휴 쿠폰
        </button>
      </div>

      {couponTab === "partner" ? (
        <>
          <div className="mt-5">
            <p className="text-sm text-[#000000]">· 제휴쿠폰 내역입니다.</p>
            <p className="text-sm text-[#000000]">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            <div className="grid grid-cols-2 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>쿠폰명</span>
              <span>발급일자</span>
            </div>
            {couponLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">불러오는 중...</div>
            ) : couponItems.filter((item) => item.sourceType === "PARTNER").length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">쿠폰이 없습니다.</div>
            ) : (
              couponItems
                .filter((item) => item.sourceType === "PARTNER")
                .map((item) => (
                  <div key={item.memberCouponId} className="grid grid-cols-2 items-center border-t border-gray-200 px-4 py-4 text-center text-sm text-[#000000]">
                    <span>{item.couponName}</span>
                    <span>{item.issuedAt ? formatDateTime(item.issuedAt) : "-"}</span>
                  </div>
                ))
            )}
          </div>

          <div className="mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3">이용안내</div>
        </>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#000000]">· 보유하신 쿠폰 내역입니다.</p>
              <p className="text-sm text-[#000000]">· 각 쿠폰 별 사용 방법이 다르니 사용 전 상세 쿠폰정보를 확인바랍니다.</p>
            </div>
            <button
              className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]"
              onClick={openCouponRegisterModal}
            >
              할인쿠폰 등록
            </button>
          </div>

          <div className="mt-5 rounded-sm bg-[#ffffff] p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-[#000000]">유형</span>
              {(["전체", "매표", "매점", "포인트", "포토카드", "기타"] as const).map((type) => (
                <button
                  key={type}
                  className={`rounded border px-4 py-2 ${couponKindFilter === type ? "border-[#eb4d32] text-[#eb4d32]" : "border-gray-200 text-[#000000]"}`}
                  onClick={() => setCouponKindFilter(type)}
                >
                  {type}
                </button>
              ))}
              <span className="ml-4 font-semibold text-[#000000]">구분</span>
              <select
                className="rounded border border-gray-200 bg-[#ffffff] px-3 py-2"
                value={couponSourceFilter}
                onChange={(e) => setCouponSourceFilter(e.target.value as "전체" | "할인쿠폰" | "VIP쿠폰" | "쿠폰패스")}
              >
                <option>전체</option>
                <option>할인쿠폰</option>
                <option>VIP쿠폰</option>
                <option>쿠폰패스</option>
              </select>
              <button className="flex items-center gap-1 rounded border border-gray-200 bg-[#ffffff] px-4 py-2">
                <Search className="h-4 w-4" /> 조회
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "available"} onChange={() => setCouponStatusFilter("available")} />
                  사용가능
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "used"} onChange={() => setCouponStatusFilter("used")} />
                  사용완료
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={couponStatusFilter === "expired"} onChange={() => setCouponStatusFilter("expired")} />
                  기간만료
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={couponHiddenOnly}
                  onChange={(e) => setCouponHiddenOnly(e.target.checked)}
                />
                숨긴쿠폰
              </label>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <p className="text-lg font-semibold text-[#000000]">
              총 <span className="text-[#eb4d32]">{filteredCoupons.length}</span>매
            </p>
          </div>

          <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
            <div className="grid grid-cols-5 border-b border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold">
              <span>구분</span>
              <span>쿠폰명</span>
              <span>유효기간</span>
              <span>사용상태</span>
              <span>액션</span>
            </div>

            {couponLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">불러오는 중...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">조회된 쿠폰 내역이 없습니다.</div>
            ) : (
              filteredCoupons.map((item) => (
                <div key={item.memberCouponId} className="grid grid-cols-5 items-center border-t border-gray-200 px-4 py-4 text-center text-sm">
                  <span>{item.couponKind || "기타"}</span>
                  <div>
                    <p>{item.couponName}</p>
                    <p className="text-gray-500">{item.couponCode}</p>
                  </div>
                  <span>{item.expiresAt ? formatDateTime(item.expiresAt) : "-"}</span>
                  <span>{mapCouponStatusLabel(item.status)}</span>
                  <button
                    className="mx-auto rounded border border-gray-200 px-3 py-1 text-sm"
                    onClick={() => openCouponInfoModal(item)}
                  >
                    쿠폰정보
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button className="rounded bg-[#eb4d32] px-4 py-2 text-sm text-[#ffffff]">1</button>
          </div>

          <div className="mt-8 rounded border border-gray-200 bg-[#ffffff] px-4 py-3">이용안내</div>
        </>
      )}
    </section>
  );
}
