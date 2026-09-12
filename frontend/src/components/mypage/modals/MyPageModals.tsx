import React from 'react';
import type { MyCouponItem } from "../../../api/myPageApi";
import ReviewVerifyModal from '../../common/review/ReviewVerifyModal';
import ReviewWriteModal from '../../common/review/ReviewWriteModal';
import { CancelReservationModal } from "./CancelReservationModal";
import { CouponInfoModal } from "./CouponInfoModal";
import { CouponRegisterModal } from "./CouponRegisterModal";
import { MembershipCardModal } from "./MembershipCardModal";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { PointPhoneModal } from "./PointPhoneModal";
import { VoucherRegisterModal } from "./VoucherRegisterModal";
import { WatchedMovieModal } from "./WatchedMovieModal";

// 💡 기능은 1번 기본 코드의 모든 props를 그대로 전달합니다.
export function MyPageModals(
  props: {
    selectedCoupon: MyCouponItem | null;
    [key: string]: any;
  }
) {
  const {
    username,
    tel,
    birth_date,

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
    handleRegisterWatchedMovie,

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
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        currentPasswordInput={currentPasswordInput}
        setCurrentPasswordInput={setCurrentPasswordInput}
        newPasswordInput={newPasswordInput}
        setNewPasswordInput={setNewPasswordInput}
        newPasswordConfirmInput={newPasswordConfirmInput}
        setNewPasswordConfirmInput={setNewPasswordConfirmInput}
        passwordChanging={passwordChanging}
        setShowPasswordChangeModal={setShowPasswordChangeModal}
        handlePasswordChange={handlePasswordChange}
        username={username}
        tel={tel}
        birth_date={birth_date}
      />

      <CancelReservationModal
        isOpen={showCancelModal}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        isCancelling={isCancelling}
        setCancelTargetId={setCancelTargetId}
        setShowCancelModal={setShowCancelModal}
        cancelTargetId={cancelTargetId}
        handleCancel={handleCancel}
      />

      <PointPhoneModal
        isOpen={showPointPhoneModal}
        closePointPhoneModal={closePointPhoneModal}
        pointPhoneNumber={pointPhoneNumber}
        setPointPhoneNumber={setPointPhoneNumber}
        pointAuthSending={pointAuthSending}
        sendPointPhoneAuthCode={sendPointPhoneAuthCode}
        pointAuthCodeInput={pointAuthCodeInput}
        setPointAuthCodeInput={setPointAuthCodeInput}
        pointAuthVerifying={pointAuthVerifying}
        verifyPointPhoneAuthCode={verifyPointPhoneAuthCode}
      />

      <VoucherRegisterModal
        isOpen={showVoucherRegisterModal}
        closeVoucherRegisterModal={closeVoucherRegisterModal}
        voucherRegisterCode={voucherRegisterCode}
        setVoucherRegisterCode={setVoucherRegisterCode}
        voucherRegisterError={voucherRegisterError}
        setVoucherRegisterError={setVoucherRegisterError}
        voucherRegistering={voucherRegistering}
        handleVoucherRegister={handleVoucherRegister}
      />

      <CouponRegisterModal
        isOpen={showCouponRegisterModal}
        couponRegisterCode={couponRegisterCode}
        setCouponRegisterCode={setCouponRegisterCode}
        couponRegisterError={couponRegisterError}
        setCouponRegisterError={setCouponRegisterError}
        couponRegistering={couponRegistering}
        handleCouponRegister={handleCouponRegister}
        closeCouponRegisterModal={closeCouponRegisterModal}
      />

      <WatchedMovieModal
        isOpen={showWatchedModal}
        setShowWatchedModal={setShowWatchedModal}
        watchedTicketCodeInput={watchedTicketCodeInput}
        setWatchedTicketCodeInput={setWatchedTicketCodeInput}
        handleRegisterWatchedMovie={handleRegisterWatchedMovie}
      />

      <ReviewVerifyModal 
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onVerifySuccess={handleVerifyAndOpenReview}
          reservationNumber={reviewReservationNumberInput}
          setReservationNumber={setReviewReservationNumberInput}
      />

      <ReviewWriteModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        movieTitle={reviewMovieTitleInput}
        movieId={reviewMovieId} 
        reservationNumber={reviewReservationNumberInput}
        content={reviewContentInput}
        setContent={setReviewContentInput}
        onSubmit={handleReviewSubmit}
        scores={{ scoreDirection, scoreStory, scoreVisual, scoreActor, scoreOst }}
        setScores={(newScores: any) => {
            if (newScores.scoreDirection !== undefined) setScoreDirection(newScores.scoreDirection);
            if (newScores.scoreStory !== undefined) setScoreStory(newScores.scoreStory);
            if (newScores.scoreVisual !== undefined) setScoreVisual(newScores.scoreVisual);
            if (newScores.scoreActor !== undefined) setScoreActor(newScores.scoreActor);
            if (newScores.scoreOst !== undefined) setScoreOst(newScores.scoreOst);
        }}
      />

      <MembershipCardModal
        isOpen={showCardRegisterModal}
        closeCardRegisterModal={closeCardRegisterModal}
        cardNumberInput={cardNumberInput}
        setCardNumberInput={setCardNumberInput}
        cardRegisterError={cardRegisterError}
        setCardRegisterError={setCardRegisterError}
        cardCvcInput={cardCvcInput}
        setCardCvcInput={setCardCvcInput}
        cardRegistering={cardRegistering}
        handleMembershipCardRegister={handleMembershipCardRegister}
      />

      <CouponInfoModal
        selectedCoupon={selectedCoupon}
        closeCouponInfoModal={closeCouponInfoModal}
        formatCouponCodeForModal={formatCouponCodeForModal}
        mapCouponStatusLabel={mapCouponStatusLabel}
        formatDateTime={formatDateTime}
      />
    </>
  );
}