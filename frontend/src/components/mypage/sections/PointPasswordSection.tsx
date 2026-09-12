type PointPasswordSectionProps = {
  pointPasswordInput: string;
  setPointPasswordInput: (value: string) => void;
  pointPasswordConfirmInput: string;
  setPointPasswordConfirmInput: (value: string) => void;
  onCancel: () => void;
  submitPointPassword: () => void;
};

export function PointPasswordSection({
  pointPasswordInput,
  setPointPasswordInput,
  pointPasswordConfirmInput,
  setPointPasswordConfirmInput,
  onCancel,
  submitPointPassword,
}: PointPasswordSectionProps) {
  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">포인트 비밀번호 설정</h1>
      <p className="mt-4 text-sm text-black/55">· 키노 극장에서 멤버십 포인트를 사용하시려면 비밀번호가 필요합니다.</p>
      <p className="text-sm text-black/55">· 사용하실 비밀번호 4자리를 입력해주세요.</p>

      <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-[#FDFDFD] shadow-xl">
        <div className="grid grid-cols-[220px_1fr] border-b border-black/10">
          <div className="bg-white px-5 py-4 text-base font-semibold text-[#1A1A1A]">새 비밀번호</div>
          <div className="px-5 py-3">
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={pointPasswordInput}
              onChange={(e) => setPointPasswordInput(e.target.value.replace(/\D/g, ""))}
              className="h-11 w-[220px] rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors placeholder:text-black/30 focus:border-[#B91C1C]"
              placeholder="숫자 4자리"
            />
          </div>
        </div>
        <div className="grid grid-cols-[220px_1fr]">
          <div className="bg-white px-5 py-4 text-base font-semibold text-[#1A1A1A]">새 비밀번호 재입력</div>
          <div className="px-5 py-3">
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={pointPasswordConfirmInput}
              onChange={(e) => setPointPasswordConfirmInput(e.target.value.replace(/\D/g, ""))}
              className="h-11 w-[220px] rounded-sm border border-black/10 bg-white px-4 text-base text-[#1A1A1A] outline-none transition-colors placeholder:text-black/30 focus:border-[#B91C1C]"
              placeholder="숫자 4자리"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-sm border border-black/5 bg-[#FDFDFD] shadow-xl">
        <div className="border-b border-black/5 bg-[#FDFDFD] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">이용안내</div>
        <div className="p-4 text-base text-black/55">
          <p>· 비밀번호는 숫자 4자리로 설정 가능하며, 연속된 숫자는 등록하실 수 없습니다.</p>
          <p>· 비밀번호 찾기는 불가하며, 해당 페이지를 통해 재설정 후 이용하실 수 있습니다.</p>
          <p>· 키노 극장 매표소 및 매점에서 포인트 사용 시 비밀번호가 일치하지 않을 경우 사용이 제한되오니 주의하여 등록바랍니다.</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded-sm border border-[#B91C1C] px-8 py-3 text-base font-semibold text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          className="rounded-sm bg-[#B91C1C] px-8 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(185,28,28,0.18)] transition-colors hover:bg-[#991B1B]"
          onClick={submitPointPassword}
        >
          수정
        </button>
      </div>
    </section>
  );
}
