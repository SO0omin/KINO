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
      <h1 className="text-4xl font-semibold text-[#000000]">포인트 비밀번호 설정</h1>
      <p className="mt-5 text-xl text-[#000000]">· 키노 극장에서 멤버십 포인트를 사용하시려면 비밀번호가 필요합니다.</p>
      <p className="text-xl text-[#000000]">· 사용하실 비밀번호 4자리를 입력해주세요.</p>

      <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#ffffff]">
        <div className="grid grid-cols-[220px_1fr] border-b border-gray-200">
          <div className="bg-[#fdf4e3] px-5 py-4 text-xl font-semibold text-[#000000]">새 비밀번호</div>
          <div className="px-5 py-3">
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={pointPasswordInput}
              onChange={(e) => setPointPasswordInput(e.target.value.replace(/\D/g, ""))}
              className="h-12 w-[220px] border border-gray-200 px-3 text-lg outline-none focus:border-[#eb4d32]"
              placeholder="숫자 4자리"
            />
          </div>
        </div>
        <div className="grid grid-cols-[220px_1fr]">
          <div className="bg-[#fdf4e3] px-5 py-4 text-xl font-semibold text-[#000000]">새 비밀번호 재입력</div>
          <div className="px-5 py-3">
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={pointPasswordConfirmInput}
              onChange={(e) => setPointPasswordConfirmInput(e.target.value.replace(/\D/g, ""))}
              className="h-12 w-[220px] border border-gray-200 px-3 text-lg outline-none focus:border-[#eb4d32]"
              placeholder="숫자 4자리"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-sm border border-gray-200 bg-[#ffffff] p-5 text-base text-[#000000]">
        <p className="mb-2 text-2xl font-semibold">이용안내</p>
        <p>· 비밀번호는 숫자 4자리로 설정 가능하며, 연속된 숫자는 등록하실 수 없습니다.</p>
        <p>· 비밀번호 찾기는 불가하며, 해당 페이지를 통해 재설정 후 이용하실 수 있습니다.</p>
        <p>· 키노 극장 매표소 및 매점에서 포인트 사용 시 비밀번호가 일치하지 않을 경우 사용이 제한되오니 주의하여 등록바랍니다.</p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button className="rounded border border-[#eb4d32] px-10 py-3 text-lg font-semibold text-[#eb4d32]" onClick={onCancel}>
          취소
        </button>
        <button className="rounded bg-[#eb4d32] px-10 py-3 text-lg font-semibold text-[#ffffff]" onClick={submitPointPassword}>
          수정
        </button>
      </div>
    </section>
  );
}
