import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { removeMovieLike } from "../api/myPageApi";
import { useMyPageData } from "../hooks/useMyPageData";
import { useCouponSection } from "../hooks/mypage/useCouponSection";
import { useMovieStory } from "../hooks/mypage/useMovieStory";
import { useProfileSection } from "../hooks/mypage/useProfileSection";
import { useReservationSection } from "../hooks/mypage/useReservationSection";
import { useMembershipSection } from "../hooks/mypage/useMembershipSection";
import { usePointSection } from "../hooks/mypage/usePointSection";
import { useSocialLinking } from "../hooks/mypage/useSocialLinking";
import { usePreferencesSection } from "../hooks/mypage/usePreferencesSection";
import { useVoucherSection } from "../hooks/mypage/useVoucherSection";
import {
    mapCouponStatusLabel,
    mapVoucherStatusLabel,
    toPurchaseRows,
    formatDateDot,
    formatDateSimple,
    formatDateTime,
    formatMoney,
    monthLabel,
    type UiVoucherStatus,
} from "../mappers/myPageMapper";
import { PATH_TO_KEY, breadcrumbLabels } from "../types/mypage";
import { BreadcrumbBar } from "../components/mypage/BreadcrumbBar";
import { SidebarMenu } from "../components/mypage/SidebarMenu";
import { ReservationsSection } from "../components/mypage/sections/ReservationsSection";
import { CouponsSection } from "../components/mypage/sections/CouponsSection";
import { ProfilePreferencesSection } from "../components/mypage/sections/ProfilePreferencesSection";
import { PointsSection } from "../components/mypage/sections/PointsSection";
import { MovieStorySection } from "../components/mypage/sections/MovieStorySection";
import { VouchersSection } from "../components/mypage/sections/VouchersSection";
import { ProfileSection } from "../components/mypage/sections/ProfileSection";
import { DashboardSection } from "../components/mypage/sections/DashboardSection";
import { PointPasswordSection } from "../components/mypage/sections/PointPasswordSection";
import { MembershipCardsSection } from "../components/mypage/sections/MembershipCardsSection";
import { MyPageModals } from "../components/mypage/modals/MyPageModals";
import { cinemaAlert } from "../utils/alert";

export default function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { memberId: authMemberId, guestId: authGuestId, isGuest, isLoggedIn } = useAuth();
    const memberId = useMemo(() => {
        if (authMemberId && authMemberId > 0) {
            return authMemberId;
        }
        const queryValue = new URLSearchParams(location.search).get("memberId");
        const parsedFromQuery = queryValue ? Number(queryValue) : NaN;
        if (Number.isFinite(parsedFromQuery) && parsedFromQuery > 0) {
            return parsedFromQuery;
        }
        return 0;
    }, [location.search, authMemberId]);
    const guestId = useMemo(() => {
        if (authGuestId && authGuestId > 0) {
            return authGuestId;
        }
        const queryValue = new URLSearchParams(location.search).get("guestId");
        const parsedFromQuery = queryValue ? Number(queryValue) : NaN;
        if (Number.isFinite(parsedFromQuery) && parsedFromQuery > 0) {
            return parsedFromQuery;
        }
        return 0;
    }, [location.search, authGuestId]);

    const pageKey = PATH_TO_KEY[location.pathname] ?? "dashboard";
    const isGuestReservationOnly = isGuest && memberId <= 0 && guestId > 0;
    const verificationToken = useMemo(() => new URLSearchParams(location.search).get("verifyToken") ?? "", [location.search]);
    const [voucherStatus, setVoucherStatus] = useState<UiVoucherStatus>("available");
    const [hasPointPassword,] = useState(false);
    const {
        pointRange,
        pointFrom,
        setPointFrom,
        pointTo,
        setPointTo,
        appliedPointFrom,
        setAppliedPointFrom,
        appliedPointTo,
        setAppliedPointTo,
        pointPasswordInput,
        setPointPasswordInput,
        pointPasswordConfirmInput,
        setPointPasswordConfirmInput,
        applyPointRange,
        submitPointPassword,
    } = usePointSection({
        memberId,
        verificationToken,
    });
    const {
        loading,
        summary,
        reservations,
        memberProfile,
        profileLoading,
        wishMovies,
        wishLoading,
        voucherItems,
        voucherLoading,
        couponItems,
        couponLoading,
        membershipCards,
        membershipCardLoading,
        pointRows,
        pointLoading,
        load,
        loadMemberProfile,
        loadWishMovies,
        loadVouchers,
        loadCoupons,
        loadMembershipCards,
    } = useMyPageData({
        memberId,
        guestId,
        pageKey,
        voucherStatus,
        appliedPointFrom,
        appliedPointTo,
    });

    const {
        movieStoryTab,
        setMovieStoryTab,
        selectedTimelineYear,
        setSelectedTimelineYear,
        timelineYears,
        timelineRows,
        reviews,
        reviewCount,
        watchedCount,
        allWatchedMovies,
        showWatchedModal,
        setShowWatchedModal,
        watchedTicketCodeInput,
        setWatchedTicketCodeInput,
        showReviewModal,
        setShowReviewModal,
        showVerifyModal,
        setShowVerifyModal,
        reviewReservationNumberInput,
        setReviewReservationNumberInput,
        reviewMovieTitleInput,
        setReviewMovieTitleInput,
        reviewContentInput,
        setReviewContentInput,
        reviewMovieId,
        setReviewMovieId,
        scoreDirection,
        setScoreDirection,
        scoreStory,
        setScoreStory,
        scoreVisual,
        setScoreVisual,
        scoreActor,
        setScoreActor,
        scoreOst,
        setScoreOst,
        handleVerifyAndOpenReview,
        handleReviewSubmit,
        handleRegisterWatchedMovie,
    } = useMovieStory({
        memberId,
        isLoggedIn,
        reservations,
    });

    const {
        couponTab,
        setCouponTab,
        couponKindFilter,
        setCouponKindFilter,
        couponSourceFilter,
        setCouponSourceFilter,
        couponStatusFilter,
        setCouponStatusFilter,
        couponHiddenOnly,
        setCouponHiddenOnly,
        filteredCoupons,
        applyCouponFilters,
        showCouponRegisterModal,
        couponRegisterCode,
        setCouponRegisterCode,
        couponRegistering,
        couponRegisterError,
        setCouponRegisterError,
        selectedCoupon,
        openCouponRegisterModal,
        closeCouponRegisterModal,
        openCouponInfoModal,
        closeCouponInfoModal,
        handleCouponRegister,
        fetchDownloadableCouponsForCurrentTab,
        downloadSelectedCouponsForCurrentTab,
        formatCouponCodeForModal,
    } = useCouponSection({
        memberId,
        couponItems,
        loadCoupons,
        load,
    });

    const {
        profileSaving,
        showPasswordChangeModal,
        setShowPasswordChangeModal,
        currentPasswordInput,
        setCurrentPasswordInput,
        newPasswordInput,
        setNewPasswordInput,
        newPasswordConfirmInput,
        setNewPasswordConfirmInput,
        passwordChanging,
        profileName,
        setProfileName,
        profileTel,
        setProfileTel,
        profileEmail,
        setProfileEmail,
        profileBirthDate,
        profileImageUrl,
        setProfileImageUrl,
        showPointPhoneModal,
        pointPhoneNumber,
        setPointPhoneNumber,
        pointAuthCodeInput,
        setPointAuthCodeInput,
        pointAuthSending,
        pointAuthVerifying,
        openPointPhoneModal,
        closePointPhoneModal,
        sendPointPhoneAuthCode,
        verifyPointPhoneAuthCode,
        handleSaveProfile,
        handlePhoneChange,
        handlePasswordChange,
    } = useProfileSection({
        memberId,
        memberProfile,
        loadMemberProfile,
    });

    const {
        isCancelling,
        showCancelModal,
        cancelTargetId,
        cancelReason,
        setCancelReason,
        setCancelTargetId,
        setShowCancelModal,
        reservationTab,
        setReservationTab,
        historyType,
        setHistoryType,
        selectedMonth,
        setSelectedMonth,
        setAppliedHistoryType,
        setAppliedMonth,
        purchaseSelectType,
        setPurchaseSelectType,
        purchaseStatusType,
        setPurchaseStatusType,
        purchaseRange,
        purchaseFrom,
        setPurchaseFrom,
        purchaseTo,
        setPurchaseTo,
        setAppliedPurchaseSelectType,
        setAppliedPurchaseStatusType,
        setAppliedPurchaseFrom,
        setAppliedPurchaseTo,
        activeReservations,
        cancelledReservations,
        monthOptions,
        visibleReservations,
        purchaseRows,
        recentPaidPurchases,
        openCancelModal,
        handleCancel,
        applyPurchaseRange,
    } = useReservationSection({
        memberId,
        guestId,
        pageKey,
        locationSearch: location.search,
        reservations,
        load,
    });

    const {
        showCardRegisterModal,
        cardNumberInput,
        setCardNumberInput,
        cardCvcInput,
        setCardCvcInput,
        cardRegistering,
        cardRegisterError,
        setCardRegisterError,
        openCardRegisterModal,
        closeCardRegisterModal,
        handleMembershipCardRegister,
    } = useMembershipSection({
        memberId,
        loadMembershipCards,
    });

    const {
        showVoucherRegisterModal,
        voucherRegisterCode,
        setVoucherRegisterCode,
        voucherRegisterError,
        setVoucherRegisterError,
        voucherRegistering,
        openVoucherRegisterModal,
        closeVoucherRegisterModal,
        handleVoucherRegister,
    } = useVoucherSection({
        memberId,
        loadVouchers,
    });

    const {
        socialNaverLinked,
        setSocialNaverLinked,
        socialKakaoLinked,
        setSocialKakaoLinked,
        socialGoogleLinked,
        setSocialGoogleLinked,
        toggleSocialLink,
    } = useSocialLinking({
        memberProfile,
        loadMemberProfile,
    });

    const {
        marketingPolicyAgreed,
        setMarketingPolicyAgreed,
        marketingEmailAgreed,
        setMarketingEmailAgreed,
        marketingSmsAgreed,
        setMarketingSmsAgreed,
        marketingPushAgreed,
        setMarketingPushAgreed,
        preferredTheaterId,
        setPreferredTheaterId,
        preferredTheaterName,
        availableMovieVoucherCount,
        availableCouponCount,
        resetPreferences,
        submitPreferences,
    } = usePreferencesSection({
        memberId,
        pageKey,
        hasPointPassword,
        socialNaverLinked,
        setSocialNaverLinked,
        socialKakaoLinked,
        setSocialKakaoLinked,
        socialGoogleLinked,
        setSocialGoogleLinked,
    });

    const handleRemoveWishMovie = async (movieId: number) => {
        try {
            await removeMovieLike(movieId, memberId);
            await loadWishMovies();
        } catch (error: any) {
            cinemaAlert(error?.message ?? "삭제에 실패했습니다.","알림");
        }
    };

    const moveMenu = (path: string) => {
        navigate(`${path}${location.search || ""}`);
    };

    useEffect(() => {
        if (pageKey !== "movie-story") return;
        const movieTab = new URLSearchParams(location.search).get("movieTab");
        if (movieTab === "review" || movieTab === "watched" || movieTab === "wish" || movieTab === "timeline") {
            setMovieStoryTab(movieTab);
            return;
        }
        setMovieStoryTab("timeline");
    }, [pageKey, location.search]);

    useEffect(() => {
        if (!isGuestReservationOnly) return;
        if (location.pathname !== "/mypage/reservations") {
            navigate(`/mypage/reservations?guestId=${guestId}`, { replace: true });
        }
    }, [guestId, isGuestReservationOnly, location.pathname, navigate]);

    const crumbs = breadcrumbLabels(pageKey);
    const wishCount = wishMovies.length;

    

    const handlePayAgain = (reservationId: number) => {
        navigate(`/payment?reservationId=${reservationId}`);
    };

    const renderReservations = () => (
        <ReservationsSection
            guestView={isGuestReservationOnly}
            reservationTab={reservationTab}
            setReservationTab={setReservationTab}
            historyType={historyType}
            setHistoryType={setHistoryType}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            monthOptions={monthOptions}
            monthLabel={monthLabel}
            setAppliedHistoryType={setAppliedHistoryType}
            setAppliedMonth={setAppliedMonth}
            loading={loading}
            visibleReservations={visibleReservations}
            formatDateTime={formatDateTime}
            formatMoney={formatMoney}
            isCancelling={isCancelling}
            openCancelModal={openCancelModal}
            onClickPay={handlePayAgain}
            purchaseSelectType={purchaseSelectType}
            setPurchaseSelectType={setPurchaseSelectType}
            purchaseStatusType={purchaseStatusType}
            setPurchaseStatusType={setPurchaseStatusType}
            purchaseRange={purchaseRange}
            applyPurchaseRange={applyPurchaseRange}
            purchaseFrom={purchaseFrom}
            setPurchaseFrom={setPurchaseFrom}
            purchaseTo={purchaseTo}
            setPurchaseTo={setPurchaseTo}
            setAppliedPurchaseSelectType={setAppliedPurchaseSelectType}
            setAppliedPurchaseStatusType={setAppliedPurchaseStatusType}
            setAppliedPurchaseFrom={setAppliedPurchaseFrom}
            setAppliedPurchaseTo={setAppliedPurchaseTo}
            purchaseRows={purchaseRows}
            cancelledReservations={cancelledReservations}
        />
    );

    const renderVouchers = () => {
        return (
            <VouchersSection
                openVoucherRegisterModal={openVoucherRegisterModal}
                voucherItems={voucherItems}
                voucherStatus={voucherStatus}
                setVoucherStatus={setVoucherStatus}
                voucherLoading={voucherLoading}
                formatDateTime={formatDateTime}
                mapVoucherStatusLabel={mapVoucherStatusLabel}
            />
        );
    };

    const renderCoupons = () => (
        <CouponsSection
            couponTab={couponTab}
            setCouponTab={setCouponTab}
            couponLoading={couponLoading}
            couponItems={couponItems}
            formatDateTime={formatDateTime}
            openCouponRegisterModal={openCouponRegisterModal}
            couponKindFilter={couponKindFilter}
            setCouponKindFilter={setCouponKindFilter}
            couponSourceFilter={couponSourceFilter}
            setCouponSourceFilter={setCouponSourceFilter}
            couponStatusFilter={couponStatusFilter}
            setCouponStatusFilter={setCouponStatusFilter}
            couponHiddenOnly={couponHiddenOnly}
            setCouponHiddenOnly={setCouponHiddenOnly}
            filteredCoupons={filteredCoupons}
            mapCouponStatusLabel={mapCouponStatusLabel}
            openCouponInfoModal={openCouponInfoModal}
            fetchDownloadableCouponsForCurrentTab={fetchDownloadableCouponsForCurrentTab}
            downloadSelectedCouponsForCurrentTab={downloadSelectedCouponsForCurrentTab}
            applyCouponFilters={applyCouponFilters}
        />
    );

    const renderPoints = () => (
        <PointsSection
            summary={summary}
            openPointPhoneModal={openPointPhoneModal}
            pointRange={pointRange}
            applyPointRange={applyPointRange}
            pointFrom={pointFrom}
            setPointFrom={setPointFrom}
            pointTo={pointTo}
            setPointTo={setPointTo}
            setAppliedPointFrom={setAppliedPointFrom}
            setAppliedPointTo={setAppliedPointTo}
            pointLoading={pointLoading}
            pointRows={pointRows}
            formatDateTime={formatDateTime}
        />
    );

    const renderProfile = () => (
        <ProfileSection
            profileImageUrl={profileImageUrl}
            setProfileImageUrl={setProfileImageUrl}
            memberProfile={memberProfile}
            profileName={profileName}
            setProfileName={setProfileName}
            profileLoading={profileLoading}
            profileSaving={profileSaving}
            handleSaveProfile={handleSaveProfile}
            profileBirthDate={profileBirthDate}
            formatDateSimple={formatDateSimple}
            profileTel={profileTel}
            setProfileTel={setProfileTel}
            handlePhoneChange={handlePhoneChange}
            profileEmail={profileEmail}
            setProfileEmail={setProfileEmail}
            setShowPasswordChangeModal={setShowPasswordChangeModal}
            openPointPhoneModal={openPointPhoneModal}
            hasPointPassword={hasPointPassword}
            socialNaverLinked={socialNaverLinked}
            socialKakaoLinked={socialKakaoLinked}
            socialGoogleLinked={socialGoogleLinked}
            toggleSocialLink={toggleSocialLink}
            loadMemberProfile={() => loadMemberProfile().then(() => {})}
        />
    );

    const renderProfilePreferences = () => (
        <ProfilePreferencesSection
            marketingPolicyAgreed={marketingPolicyAgreed}
            setMarketingPolicyAgreed={setMarketingPolicyAgreed}
            marketingEmailAgreed={marketingEmailAgreed}
            setMarketingEmailAgreed={setMarketingEmailAgreed}
            marketingSmsAgreed={marketingSmsAgreed}
            setMarketingSmsAgreed={setMarketingSmsAgreed}
            marketingPushAgreed={marketingPushAgreed}
            setMarketingPushAgreed={setMarketingPushAgreed}
            preferredTheaterId={preferredTheaterId}
            setPreferredTheaterId={setPreferredTheaterId}
            onReset={resetPreferences}
            onSubmit={submitPreferences}
        />
    );

    const renderMovieStory = () => (
        <MovieStorySection
            movieStoryTab={movieStoryTab}
            setMovieStoryTab={setMovieStoryTab}
            timelineYears={timelineYears}
            selectedTimelineYear={selectedTimelineYear}
            setSelectedTimelineYear={setSelectedTimelineYear}
            timelineRows={timelineRows} //오류는 나는데 실행은됨
            formatDateSimple={formatDateSimple}
            reviewCount={reviewCount}
            setShowReviewModal={setShowVerifyModal}
            reviews={reviews}
            watchedCount={watchedCount}
            setShowWatchedModal={setShowWatchedModal}
            allWatchedMovies={allWatchedMovies}
            wishCount={wishCount}
            wishLoading={wishLoading}
            wishMovies={wishMovies}
            onRemoveWishMovie={handleRemoveWishMovie}
        />
    );

    const renderContent = () => {
        if (isGuestReservationOnly) return renderReservations();
        if (pageKey === "dashboard") return (
            <DashboardSection
                summary={summary}
                preferredTheaterName={preferredTheaterName}
                availableMovieVoucherCount={availableMovieVoucherCount}
                availableCouponCount={availableCouponCount}
                activeReservations={activeReservations}
                recentPaidPurchases={recentPaidPurchases}
                locationSearch={location.search}
                moveMenu={moveMenu}
                navigate={navigate}
                formatDateTime={formatDateTime}
                formatMoney={formatMoney}
            />
        );
        if (pageKey === "reservations") return renderReservations();
        if (pageKey === "vouchers-movie") return renderVouchers();
        if (pageKey === "coupons") return renderCoupons();
        if (pageKey === "points") return renderPoints();
        if (pageKey === "point-password") return (
            <PointPasswordSection
                pointPasswordInput={pointPasswordInput}
                setPointPasswordInput={setPointPasswordInput}
                pointPasswordConfirmInput={pointPasswordConfirmInput}
                setPointPasswordConfirmInput={setPointPasswordConfirmInput}
                onCancel={() => navigate(`/mypage/points?memberId=${memberId}`)}
                submitPointPassword={submitPointPassword}
            />
        );
        if (pageKey === "cards") return (
            <MembershipCardsSection
                openCardRegisterModal={openCardRegisterModal}
                membershipCardLoading={membershipCardLoading}
                membershipCards={membershipCards}
                formatDateDot={formatDateDot}
            />
        );
        if (pageKey === "profile") return renderProfile();
        if (pageKey === "profile-preferences") return renderProfilePreferences();
        if (pageKey === "movie-story") return renderMovieStory();
        return (
            <DashboardSection
                summary={summary}
                preferredTheaterName={preferredTheaterName}
                availableMovieVoucherCount={availableMovieVoucherCount}
                availableCouponCount={availableCouponCount}
                activeReservations={activeReservations}
                recentPaidPurchases={recentPaidPurchases}
                locationSearch={location.search}
                moveMenu={moveMenu}
                navigate={navigate}
                formatDateTime={formatDateTime}
                formatMoney={formatMoney}
            />
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#1A1A1A] selection:bg-[#B91C1C] selection:text-white [&_section>h1]:text-5xl [&_section>h1]:font-semibold [&_section>h1]:tracking-tight [&_section>h1]:text-[#1A1A1A] [&_section>h2]:tracking-tight">
            <BreadcrumbBar
                crumbs={isGuestReservationOnly ? ["나의 키노", "예매/구매내역", "예매내역"] : crumbs}
                onMoveMenu={moveMenu}
            />

            <div className="mx-auto flex w-full max-w-[1280px] items-start gap-10 px-6 py-12">
                {isGuestReservationOnly ? null : (
                    <SidebarMenu currentPath={location.pathname} pageKey={pageKey} onMoveMenu={moveMenu} />
                )}

                <main className={`min-w-0 ${isGuestReservationOnly ? "w-full" : "flex-1"}`}>
                    {renderContent()}
                </main>
            </div>

            <MyPageModals
                showPasswordChangeModal={showPasswordChangeModal}
                currentPasswordInput={currentPasswordInput}
                setCurrentPasswordInput={setCurrentPasswordInput}
                newPasswordInput={newPasswordInput}
                setNewPasswordInput={setNewPasswordInput}
                newPasswordConfirmInput={newPasswordConfirmInput}
                setNewPasswordConfirmInput={setNewPasswordConfirmInput}
                passwordChanging={passwordChanging}
                setShowPasswordChangeModal={setShowPasswordChangeModal}
                handlePasswordChange={handlePasswordChange}
                showCancelModal={showCancelModal}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                isCancelling={isCancelling}
                setCancelTargetId={setCancelTargetId}
                setShowCancelModal={setShowCancelModal}
                cancelTargetId={cancelTargetId}
                handleCancel={handleCancel}
                showPointPhoneModal={showPointPhoneModal}
                closePointPhoneModal={closePointPhoneModal}
                pointPhoneNumber={pointPhoneNumber}
                setPointPhoneNumber={setPointPhoneNumber}
                pointAuthSending={pointAuthSending}
                sendPointPhoneAuthCode={sendPointPhoneAuthCode}
                pointAuthCodeInput={pointAuthCodeInput}
                setPointAuthCodeInput={setPointAuthCodeInput}
                pointAuthVerifying={pointAuthVerifying}
                verifyPointPhoneAuthCode={verifyPointPhoneAuthCode}
                showVoucherRegisterModal={showVoucherRegisterModal}
                pageKey={pageKey}
                closeVoucherRegisterModal={closeVoucherRegisterModal}
                voucherRegisterCode={voucherRegisterCode}
                setVoucherRegisterCode={setVoucherRegisterCode}
                voucherRegisterError={voucherRegisterError}
                setVoucherRegisterError={setVoucherRegisterError}
                voucherRegistering={voucherRegistering}
                handleVoucherRegister={handleVoucherRegister}
                showCouponRegisterModal={showCouponRegisterModal}
                couponRegisterCode={couponRegisterCode}
                setCouponRegisterCode={setCouponRegisterCode}
                couponRegisterError={couponRegisterError}
                setCouponRegisterError={setCouponRegisterError}
                couponRegistering={couponRegistering}
                handleCouponRegister={handleCouponRegister}
                closeCouponRegisterModal={closeCouponRegisterModal}
                showWatchedModal={showWatchedModal}
                setShowWatchedModal={setShowWatchedModal}
                watchedTicketCodeInput={watchedTicketCodeInput}
                setWatchedTicketCodeInput={setWatchedTicketCodeInput}
                handleRegisterWatchedMovie={handleRegisterWatchedMovie}

                showVerifyModal={showVerifyModal} 
                setShowVerifyModal={setShowVerifyModal}
                showReviewModal={showReviewModal}
                setShowReviewModal={setShowReviewModal}
                reviewReservationNumberInput={reviewReservationNumberInput}
                setReviewReservationNumberInput={setReviewReservationNumberInput}
                reviewMovieTitleInput={reviewMovieTitleInput}
                setReviewMovieTitleInput={setReviewMovieTitleInput}
                reviewContentInput={reviewContentInput}
                setReviewContentInput={setReviewContentInput}
                handleVerifyAndOpenReview={handleVerifyAndOpenReview} // 1단계 확인 함수
                scoreDirection={scoreDirection} setScoreDirection={setScoreDirection}
                scoreStory={scoreStory} setScoreStory={setScoreStory}
                scoreVisual={scoreVisual} setScoreVisual={setScoreVisual}
                scoreActor={scoreActor} setScoreActor={setScoreActor}
                scoreOst={scoreOst} setScoreOst={setScoreOst}
                handleReviewSubmit={handleReviewSubmit}

                showCardRegisterModal={showCardRegisterModal}
                closeCardRegisterModal={closeCardRegisterModal}
                cardNumberInput={cardNumberInput}
                setCardNumberInput={setCardNumberInput}
                cardRegisterError={cardRegisterError}
                setCardRegisterError={setCardRegisterError}
                cardCvcInput={cardCvcInput}
                setCardCvcInput={setCardCvcInput}
                cardRegistering={cardRegistering}
                handleMembershipCardRegister={handleMembershipCardRegister}
                selectedCoupon={selectedCoupon}
                closeCouponInfoModal={closeCouponInfoModal}
                formatCouponCodeForModal={formatCouponCodeForModal}
                mapCouponStatusLabel={mapCouponStatusLabel}
                formatDateTime={formatDateTime}
            />
        </div>
    );
}
