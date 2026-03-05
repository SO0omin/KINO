import type { MyVoucherItem } from "../../../api/myPageApi";

type VouchersSectionProps = {
  openVoucherRegisterModal: () => void;
  voucherItems: MyVoucherItem[];
  voucherStatus: "available" | "used" | "expired";
  setVoucherStatus: (value: "available" | "used" | "expired") => void;
  voucherLoading: boolean;
  formatDateTime: (value: string) => string;
  mapVoucherStatusLabel: (status: string, isMovieVoucher: boolean) => string;
};

export function VouchersSection({
  openVoucherRegisterModal,
  voucherItems,
  voucherStatus,
  setVoucherStatus,
  voucherLoading,
  formatDateTime,
  mapVoucherStatusLabel,
}: VouchersSectionProps) {
  const statusOptions = [
    { value: "available", label: "사용가능" },
    { value: "used", label: "사용완료" },
    { value: "expired", label: "기간만료" },
  ];

  return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">영화관람권</h1>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mt-2 text-sm text-[#000000]">· 보유하신 영화관람권/예매권 내역입니다.</p>
          <p className="text-sm text-[#000000]">
            · 소지하신 지류(종이)관람권은 등록 후 이용하실 수 있습니다.
          </p>
        </div>
        <button
          className="rounded border border-[#eb4d32] px-5 py-2 text-sm text-[#eb4d32]"
          onClick={openVoucherRegisterModal}
        >
          관람권등록
        </button>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#000000]">
          <>총 <span className="text-[#eb4d32]">{voucherItems.length}</span>매</>
        </p>
        <select
          className="rounded border border-gray-200 bg-[#ffffff] px-4 py-2 text-sm text-[#000000]"
          value={voucherStatus}
          onChange={(e) => setVoucherStatus(e.target.value as "available" | "used" | "expired")}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-3 border-y border-gray-200 bg-[#ffffff] px-4 py-3 text-center text-sm font-semibold text-[#000000]">
          <span>관람권명</span>
          <span>유효기간</span>
          <span>사용상태</span>
        </div>
        {voucherLoading ? (
          <div className="py-8 text-center text-[#000000]">불러오는 중...</div>
        ) : voucherItems.length === 0 ? (
          <div className="py-8 text-center text-[#000000]">조회된 관람권 내역이 없습니다.</div>
        ) : (
          voucherItems.map((item) => (
            <div key={item.voucherId} className="grid grid-cols-3 border-t border-gray-200 px-4 py-3 text-center text-sm text-[#000000]">
              <span>{item.name}</span>
              <span>{item.validUntil ? formatDateTime(item.validUntil) : "-"}</span>
              <span>{mapVoucherStatusLabel(item.status, true)}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#000000]">
          <span>이용안내</span>
          <span className="text-gray-400">⌄</span>
        </div>
      </div>
    </section>
  );
}
