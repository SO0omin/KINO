import { useEffect } from 'react';
import type { MyCouponItem, MyReservationItem } from "../../../api/myPageApi";
import type { PageKey } from "../../../types/mypage";
import ReviewVerifyModal from '../../common/review/ReviewVerifyModal';
import ReviewWriteModal from '../../common/review/ReviewWriteModal';

export function MyPageModals(
  props: {
    pageKey: PageKey;
    selectedCoupon: MyCouponItem | null;
    reservations: MyReservationItem[];
    [key: string]: any;
  }
) {
  const {
    showPasswordChangeModal,
    currentPasswordInput,
    setCurrentPasswordInput,
    newPasswordInput,
    setNewPasswordInput,
    newPasswordConfirmInput,
    setNewPasswordConfirmInput,
    passwordChanging,
    setShowPasswordChangeModal,
    handlePasswordChange,

    showCancelModal,
    cancelReason,
    setCancelReason,
    isCancelling,
    setCancelTargetId,
    setShowCancelModal,
    cancelTargetId,
    handleCancel,

    showPointPhoneModal,
    closePointPhoneModal,
    pointPhoneNumber,
    setPointPhoneNumber,
    pointAuthSending,
    sendPointPhoneAuthCode,
    pointAuthCodeInput,
    setPointAuthCodeInput,
    pointAuthVerifying,
    verifyPointPhoneAuthCode,

    showVoucherRegisterModal,
    pageKey,
    closeVoucherRegisterModal,
    voucherRegisterCode,
    setVoucherRegisterCode,
    voucherRegisterError,
    setVoucherRegisterError,
    voucherRegistering,
    handleVoucherRegister,

    showCouponRegisterModal,
    couponRegisterCode,
    setCouponRegisterCode,
    couponRegisterError,
    setCouponRegisterError,
    couponRegistering,
    handleCouponRegister,
    closeCouponRegisterModal,

    showWatchedModal,
    setShowWatchedModal,
    watchedTicketCodeInput,
    setWatchedTicketCodeInput,
    reservations,
    setWatchedMovies,

    showVerifyModal, setShowVerifyModal,
    showReviewModal, setShowReviewModal,
    reviewReservationNumberInput, setReviewReservationNumberInput,
    reviewMovieTitleInput, setReviewMovieTitleInput,
    reviewMovieId, setReviewMovieId,
    reviewContentInput, setReviewContentInput,
    handleVerifyAndOpenReview,
    handleReviewSubmit,
    scoreDirection, setScoreDirection,
    scoreStory, setScoreStory,
    scoreVisual, setScoreVisual,
    scoreActor, setScoreActor,
    scoreOst, setScoreOst,

    showCardRegisterModal,
    closeCardRegisterModal,
    cardNumberInput,
    setCardNumberInput,
    cardRegisterError,
    setCardRegisterError,
    cardCvcInput,
    setCardCvcInput,
    cardRegistering,
    handleMembershipCardRegister,

    selectedCoupon,
    closeCouponInfoModal,
    formatCouponCodeForModal,
    mapCouponStatusLabel,
    formatDateTime,
  } = props;

  return (
    <>
      {showPasswordChangeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#000000] bg-[#ffffff] p-5">
            <h3 className="text-lg font-semibold text-[#000000]">비밀번호 변경</h3>
            <div className="mt-4 space-y-3">
              <input type="password" className="h-11 w-full rounded border border-gray-300 px-3 text-sm" placeholder="현재 비밀번호" value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} />
              <input type="password" className="h-11 w-full rounded border border-gray-300 px-3 text-sm" placeholder="새 비밀번호 (8자리 이상)" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} />
              <input type="password" className="h-11 w-full rounded border border-gray-300 px-3 text-sm" placeholder="새 비밀번호 확인" value={newPasswordConfirmInput} onChange={(e) => setNewPasswordConfirmInput(e.target.value)} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border border-gray-300 px-4 py-2 text-sm" onClick={() => {
                if (passwordChanging) return;
                setShowPasswordChangeModal(false);
                setCurrentPasswordInput("");
                setNewPasswordInput("");
                setNewPasswordConfirmInput("");
              }}>취소</button>
              <button className="rounded bg-[#eb4d32] px-4 py-2 text-sm font-semibold text-[#ffffff] disabled:opacity-60" onClick={handlePasswordChange} disabled={passwordChanging}>{passwordChanging ? "변경 중..." : "변경"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#000000] bg-[#ffffff] p-5">
            <h3 className="text-lg font-semibold text-[#000000]">환불 사유 입력</h3>
            <p className="mt-2 text-sm text-gray-600">취소 사유를 입력하면 해당 내용으로 환불 요청됩니다.</p>
            <textarea className="mt-4 h-28 w-full resize-none rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#eb4d32]" placeholder="예: 일정 변경으로 취소합니다." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700" disabled={isCancelling !== null} onClick={() => { setShowCancelModal(false); setCancelTargetId(null); setCancelReason(""); }}>닫기</button>
              <button className="rounded bg-[#eb4d32] px-4 py-2 text-sm font-semibold text-[#ffffff] disabled:opacity-60" disabled={cancelTargetId === null || isCancelling !== null} onClick={() => { if (cancelTargetId === null) return; handleCancel(cancelTargetId, cancelReason); }}>{isCancelling !== null ? "처리 중..." : "환불 확정"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {showPointPhoneModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">휴대폰 인증</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closePointPhoneModal} aria-label="닫기">×</button>
            </div>
            <div className="space-y-5 p-6">
              <p className="text-base text-[#000000]">포인트 비밀번호 설정을 위해 휴대폰 인증을 진행해 주세요.</p>
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                  <label className="text-right text-base font-semibold text-[#000000]">휴대폰 번호</label>
                  <input value={pointPhoneNumber} onChange={(e) => setPointPhoneNumber(e.target.value.replace(/\D/g, ""))} maxLength={11} className="h-11 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]" placeholder="01012345678" />
                  <button className="h-11 rounded bg-[#eb4d32] px-4 text-sm font-semibold text-[#ffffff]" onClick={sendPointPhoneAuthCode} disabled={pointAuthSending}>{pointAuthSending ? "발송 중..." : "인증번호 발송"}</button>
                  <label className="text-right text-base font-semibold text-[#000000]">인증번호</label>
                  <input value={pointAuthCodeInput} onChange={(e) => setPointAuthCodeInput(e.target.value.replace(/\D/g, ""))} maxLength={6} className="h-11 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]" placeholder="6자리 입력" />
                  <button className="h-11 rounded bg-[#eb4d32] px-4 text-sm font-semibold text-[#ffffff]" onClick={verifyPointPhoneAuthCode} disabled={pointAuthVerifying}>{pointAuthVerifying ? "확인 중..." : "인증 확인"}</button>
                </div>
              </div>
              <div className="flex justify-center">
                <button className="rounded border border-[#eb4d32] px-8 py-2 text-base font-semibold text-[#eb4d32]" onClick={closePointPhoneModal}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showVoucherRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">영화관람권 등록</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeVoucherRegisterModal} aria-label="닫기">×</button>
            </div>
            <div className="space-y-6 bg-[#ffffff] p-6">
              <p className="text-base text-[#000000]">보유하신 영화관람권 12자리 또는 16자리를 입력해주세요.</p>
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[120px] text-right text-base font-semibold text-[#000000]">관람권번호</label>
                  <input value={voucherRegisterCode} onChange={(e) => { const digits = e.target.value.replace(/\D/g, ""); setVoucherRegisterCode(digits); if (voucherRegisterError) setVoucherRegisterError(""); }} maxLength={16} className="h-12 flex-1 border border-[#000000] bg-[#ffffff] px-3 text-base text-[#000000] outline-none" placeholder="12자리 또는 16자리 입력" />
                  <button className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff]" onClick={handleVoucherRegister} disabled={voucherRegistering}>{voucherRegistering ? "등록 중..." : "등록"}</button>
                </div>
                {voucherRegisterError ? <p className="mt-2 text-sm text-[#eb4d32]">{voucherRegisterError}</p> : null}
              </div>
              <div className="flex justify-center"><button className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]" onClick={closeVoucherRegisterModal}>닫기</button></div>
            </div>
          </div>
        </div>
      ) : null}

      {showCouponRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">할인쿠폰 등록</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeCouponRegisterModal} aria-label="닫기">×</button>
            </div>
            <div className="space-y-6 p-6">
              <p className="text-base text-[#000000]">보유하신 쿠폰번호를 입력해 주세요.</p>
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[140px] text-right text-base font-semibold text-[#000000]">할인쿠폰 번호</label>
                  <input value={couponRegisterCode} onChange={(e) => { setCouponRegisterCode(e.target.value.toUpperCase()); if (couponRegisterError) setCouponRegisterError(""); }} className="h-12 flex-1 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none" />
                  <button className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff] disabled:opacity-60" onClick={handleCouponRegister} disabled={couponRegistering}>{couponRegistering ? "등록 중..." : "등록"}</button>
                </div>
                {couponRegisterError ? <p className="mt-2 text-sm text-[#eb4d32]">{couponRegisterError}</p> : null}
              </div>
              <div className="flex justify-center"><button className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]" onClick={closeCouponRegisterModal}>닫기</button></div>
            </div>
          </div>
        </div>
      ) : null}

      {showWatchedModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">본 영화 등록</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={() => setShowWatchedModal(false)} aria-label="닫기">×</button>
            </div>
            <div className="space-y-6 p-6">
              <p className="text-base text-[#000000]">발견하신 티켓 하단의 거래번호 또는 예매번호를 입력해주세요.</p>
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[140px] text-right text-base font-semibold text-[#000000]">거래번호 또는 예매번호</label>
                  <input value={watchedTicketCodeInput} onChange={(e) => setWatchedTicketCodeInput(e.target.value.replace(/\D/g, ""))} maxLength={20} className="h-12 flex-1 border border-gray-300 bg-[#ffffff] px-3 text-base text-[#000000] outline-none" placeholder="숫자만 입력해 주세요" />
                  <button className="h-12 rounded-sm bg-[#eb4d32] px-6 text-base font-semibold text-[#ffffff]" onClick={() => {
                    const code = watchedTicketCodeInput.trim();
                    if (!code) { alert("거래번호 또는 예매번호를 입력해 주세요."); return; }
                    const matched = reservations.find((r) => String(r.reservationId) === code);
                    const movieTitle = matched ? matched.movieTitle : `본 영화 등록 (${code})`;
                    const watchedAt = matched ? matched.startTime : new Date().toISOString();
                    setWatchedMovies((prev: any[]) => [...prev, { id: `m-${Date.now()}`, movieTitle, watchedAt }]);
                    setShowWatchedModal(false);
                    setWatchedTicketCodeInput("");
                  }}>등록</button>
                </div>
              </div>
              <div className="flex justify-center"><button className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]" onClick={() => setShowWatchedModal(false)}>닫기</button></div>
            </div>
          </div>
        </div>
      ) : null}

      {/* １. 1단계: 예매 번호 확인 모달 (공통 컴포넌트 호출) */}
      <ReviewVerifyModal 
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onVerifySuccess={handleVerifyAndOpenReview}
          reservationNumber={reviewReservationNumberInput}
          setReservationNumber={setReviewReservationNumberInput}
      />

      {/* ２. 2단계: 리뷰 작성 모달 (공통 컴포넌트 호출) */}
      <ReviewWriteModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        movieTitle={reviewMovieTitleInput}
        movieId={reviewMovieId} 
        reservationNumber={reviewReservationNumberInput}
        content={reviewContentInput}
        setContent={setReviewContentInput}
        onSubmit={handleReviewSubmit}
        scores={{
            scoreDirection, scoreStory, scoreVisual, scoreActor, scoreOst
        }}
        setScores={(newScores: any) => {
            if (newScores.scoreDirection !== undefined) setScoreDirection(newScores.scoreDirection);
            if (newScores.scoreStory !== undefined) setScoreStory(newScores.scoreStory);
            if (newScores.scoreVisual !== undefined) setScoreVisual(newScores.scoreVisual);
            if (newScores.scoreActor !== undefined) setScoreActor(newScores.scoreActor);
            if (newScores.scoreOst !== undefined) setScoreOst(newScores.scoreOst);
        }}
    />


      {showCardRegisterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">멤버십카드 등록</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeCardRegisterModal} aria-label="닫기">×</button>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-sm bg-[#fdf4e3] p-4">
                <div className="grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-3">
                  <label className="text-right text-2xl font-semibold text-[#000000]">카드번호</label>
                  <input className="h-12 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]" value={cardNumberInput} onChange={(e) => { setCardNumberInput(e.target.value.replace(/\D/g, "")); if (cardRegisterError) setCardRegisterError(""); }} maxLength={19} placeholder="숫자만 입력" />
                  <label className="text-right text-2xl font-semibold text-[#000000]">CVC 번호</label>
                  <input className="h-12 w-40 border border-gray-200 bg-[#ffffff] px-3 text-base text-[#000000] outline-none focus:border-[#eb4d32]" value={cardCvcInput} onChange={(e) => { setCardCvcInput(e.target.value.replace(/\D/g, "")); if (cardRegisterError) setCardRegisterError(""); }} maxLength={4} placeholder="3~4자리" />
                </div>
                {cardRegisterError ? <p className="mt-3 text-sm text-[#eb4d32]">{cardRegisterError}</p> : null}
              </div>
              <div className="flex justify-center gap-3">
                <button className="rounded border border-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#eb4d32]" onClick={closeCardRegisterModal} disabled={cardRegistering}>취소</button>
                <button className="rounded bg-[#eb4d32] px-8 py-2 text-lg font-semibold text-[#ffffff] disabled:opacity-60" onClick={handleMembershipCardRegister} disabled={cardRegistering}>{cardRegistering ? "등록 중" : "등록"}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCoupon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-sm border border-[#000000] bg-[#ffffff]">
            <div className="flex items-center justify-between bg-[#000000] px-5 py-4">
              <h3 className="text-3xl font-semibold text-[#ffffff]">쿠폰정보</h3>
              <button className="text-4xl leading-none text-[#ffffff]" onClick={closeCouponInfoModal} aria-label="닫기">×</button>
            </div>
            <div className="space-y-5 p-6">
              <h4 className="text-center text-5xl font-semibold text-[#000000]">{selectedCoupon.couponName}</h4>
              <div className="rounded-sm bg-[#fdf4e3] py-5 text-center text-4xl font-semibold text-[#eb4d32]">{formatCouponCodeForModal(selectedCoupon.couponCode)}</div>
              <div className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-base text-[#000000]">
                <p className="font-semibold">· 구분</p><p>{selectedCoupon.couponKind || "기타"}</p>
                <p className="font-semibold">· 사용상태</p><p>{mapCouponStatusLabel(selectedCoupon.status)}</p>
                <p className="font-semibold">· 발급일</p><p>{selectedCoupon.issuedAt ? formatDateTime(selectedCoupon.issuedAt) : "-"}</p>
                <p className="font-semibold">· 유효기간</p><p>{selectedCoupon.expiresAt ? formatDateTime(selectedCoupon.expiresAt) : "-"}</p>
                <p className="font-semibold">· 할인정보</p>
                <p>{selectedCoupon.discountType === "RATE" ? `${selectedCoupon.discountValue}% 할인` : `${selectedCoupon.discountValue.toLocaleString()}원 할인`}</p>
              </div>
              <div className="flex justify-center"><button className="rounded-sm bg-[#000000] px-10 py-3 text-base font-semibold text-[#ffffff]" onClick={closeCouponInfoModal}>닫기</button></div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
