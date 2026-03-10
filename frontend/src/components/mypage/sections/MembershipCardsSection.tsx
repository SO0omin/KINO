import type { MyMembershipCardItem } from "../../../api/myPageApi";

type MembershipCardsSectionProps = {
  openCardRegisterModal: () => void;
  membershipCardLoading: boolean;
  membershipCards: MyMembershipCardItem[];
  formatDateDot: (value?: string) => string;
};

export function MembershipCardsSection({
  openCardRegisterModal,
  membershipCardLoading,
  membershipCards,
  formatDateDot,
}: MembershipCardsSectionProps) {
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">멤버십 카드관리</h1>
          <p className="mt-5 text-sm text-black/55">· 키노 계정에 등록된 멤버십 카드를 관리할 수 있습니다.</p>
        </div>
        <button
          className="rounded-sm border border-[#B91C1C] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
          onClick={openCardRegisterModal}
        >
          멤버십 카드 등록
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
        <div className="grid grid-cols-5 border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
          <span>구분</span>
          <span>카드번호</span>
          <span>카드명</span>
          <span>발급처</span>
          <span>발급일</span>
        </div>
        {membershipCardLoading ? (
          <div className="border-t border-black/5 px-4 py-8 text-center text-sm text-black/45">불러오는 중...</div>
        ) : membershipCards.length === 0 ? (
          <div className="border-t border-black/5 px-4 py-8 text-center text-sm text-black/45">등록된 멤버십 카드가 없습니다.</div>
        ) : (
          membershipCards.map((card) => (
            <div key={card.cardId} className="grid grid-cols-5 border-t border-black/5 px-4 py-4 text-center text-sm text-[#1A1A1A]">
              <span>{card.channelName}</span>
              <span>{card.cardNumber}</span>
              <span>{card.cardName}</span>
              <span>{card.issuerName}</span>
              <span>{formatDateDot(card.issuedDate)}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 rounded-sm border border-black/5 bg-[#FDFDFD] shadow-xl">
        <div className="border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">이용안내</div>
        <div className="p-4 text-base text-black/55">
          <p>· 앞 혹은 뒷면의 카드 번호와 CVC코드가 있는 카드로만 온라인 등록이 가능합니다.</p>
          <p>· 등록된 멤버십 카드는 온라인 및 극장에서 사용하실 수 있습니다.</p>
          <p>· 한 번 삭제하신 카드번호는 재등록이 불가합니다.</p>
        </div>
      </div>
    </section>
  );
}
