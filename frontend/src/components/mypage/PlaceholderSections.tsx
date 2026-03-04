import { Search } from "lucide-react";

export function EventsSection() {
  return (
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
}

export function InquiriesSection() {
  return (
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
}

export function PaymentsSection() {
  return (
    <section>
      <h1 className="text-4xl font-semibold text-[#000000]">중앙페이 결제수단 관리</h1>
      <div className="mt-6 rounded-sm border border-gray-200 bg-white p-6 text-gray-600">
        결제수단 관리 기능은 준비 중입니다.
      </div>
    </section>
  );
}
