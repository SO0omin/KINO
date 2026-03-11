import { useEffect, useMemo, useState } from "react";
import type { MyReservationItem, MyReviewItem } from "../../api/myPageApi";
import {
  checkReviewAvailability,
  createReview,
  getMyReviews,
  verifyReservationForReview,
} from "../../api/myPageApi";
import { cinemaAlert } from "../../utils/alert";

type WatchedMovie = {
  id: string;
  movieTitle: string;
  watchedAt: string;
};

type TimelineRow = {
  id: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  reservationNumber?:string;
  watchedAt: string;
};

type UseMovieStoryOptions = {
  memberId: number;
  isLoggedIn: boolean;
  reservations: MyReservationItem[];
};

export function useMovieStory({ memberId, isLoggedIn, reservations }: UseMovieStoryOptions) {
  const [movieStoryTab, setMovieStoryTab] = useState<"timeline" | "review" | "watched" | "wish">("timeline");
  const [selectedTimelineYear, setSelectedTimelineYear] = useState<number>(new Date().getFullYear());

  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [watchedTicketCodeInput, setWatchedTicketCodeInput] = useState("");
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [reviewMovieTitleInput, setReviewMovieTitleInput] = useState("");
  const [reviewContentInput, setReviewContentInput] = useState("");
  const [reviewReservationNumberInput, setReviewReservationNumberInput] = useState("");
  const [reviewMovieId, setReviewMovieId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [scoreDirection, setScoreDirection] = useState(10);
  const [scoreStory, setScoreStory] = useState(10);
  const [scoreVisual, setScoreVisual] = useState(10);
  const [scoreActor, setScoreActor] = useState(10);
  const [scoreOst, setScoreOst] = useState(10);

  useEffect(() => {
    const savedWatched = localStorage.getItem(`movie-story-watched-${memberId}`);
    setWatchedMovies(savedWatched ? JSON.parse(savedWatched) : []);
  }, [memberId]);

  useEffect(() => {
    if (!isLoggedIn || memberId <= 0) return;
    getMyReviews(memberId)
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error("리뷰 목록 로드 실패", err);
      });
  }, [memberId, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(`movie-story-watched-${memberId}`, JSON.stringify(watchedMovies));
  }, [memberId, watchedMovies]);

  useEffect(() => {
    if (!showVerifyModal && !showReviewModal) {
      setReviewReservationNumberInput("");
      setReviewMovieId(null);
      setReviewMovieTitleInput("");
      setScoreDirection(10);
      setScoreStory(10);
      setScoreVisual(10);
      setScoreActor(10);
      setScoreOst(10);
    }
  }, [showVerifyModal, showReviewModal]);

  const reservationWatchedMovies = useMemo(() => {
    return reservations
      .filter((item) => item.paymentStatus === "PAID")
      .map((item) => ({
        id: `r-${item.reservationId}`,
        movieTitle: item.movieTitle,
        watchedAt: item.startTime,
        theaterName: item.theaterName,
        reservationNumber: item.reservationNumber,
        screenName: item.screenName,
      }));
  }, [reservations]);

  const allWatchedMovies = useMemo<TimelineRow[]>(() => {
    const manualRows = watchedMovies.map((item) => ({
      id: item.id,
      movieTitle: item.movieTitle,
      watchedAt: item.watchedAt,
      theaterName: "직접 등록",
      screenName: "-",
    }));
    return [...reservationWatchedMovies, ...manualRows].sort(
      (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    );
  }, [reservationWatchedMovies, watchedMovies]);

  const timelineYears = useMemo(() => {
    const years = Array.from(
      new Set(allWatchedMovies.map((item) => new Date(item.watchedAt).getFullYear()))
    ).filter((v) => !Number.isNaN(v));
    if (years.length === 0) {
      const nowYear = new Date().getFullYear();
      return [nowYear - 1, nowYear];
    }
    return years.sort((a, b) => a - b);
  }, [allWatchedMovies]);

  useEffect(() => {
    if (!timelineYears.includes(selectedTimelineYear)) {
      setSelectedTimelineYear(timelineYears[timelineYears.length - 1]);
    }
  }, [timelineYears, selectedTimelineYear]);

  const timelineRows = useMemo(
    () => allWatchedMovies.filter((item) => new Date(item.watchedAt).getFullYear() === selectedTimelineYear),
    [allWatchedMovies, selectedTimelineYear]
  );

  const handleVerifyAndOpenReview = async () => {
    const resNum = reviewReservationNumberInput.trim();

    if (!resNum) {
      cinemaAlert("예매 번호를 입력해주세요.","알림");
      return;
    }

    try {
      const response = await verifyReservationForReview(resNum);
      await checkReviewAvailability(resNum);

      setReviewMovieId(response.movieId);
      setReviewMovieTitleInput(response.movieTitle);
      setShowVerifyModal(false);
      setShowReviewModal(true);
    } catch (error: any) {
      cinemaAlert(error?.message ?? "유효하지 않은 예매 번호입니다. 번호를 확인해주세요.","알림");
      setShowVerifyModal(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewContentInput.trim()) {
      cinemaAlert("관람평 내용을 입력해 주세요.","알림");
      return;
    }

    try {
      await createReview({
        memberId,
        movieId: reviewMovieId,
        reservationNumber: reviewReservationNumberInput,
        content: reviewContentInput.trim(),
        scoreDirection,
        scoreStory,
        scoreVisual,
        scoreActor,
        scoreOst,
      });

      cinemaAlert("관람평이 성공적으로 등록되었습니다!","알림");
      setShowReviewModal(false);
      setReviewContentInput("");
      setScoreDirection(10);
      setScoreStory(10);
      setScoreVisual(10);
      setScoreActor(10);
      setScoreOst(10);
      const updatedReviews = await getMyReviews(memberId);
      setReviews(updatedReviews);
    } catch (error: any) {
      cinemaAlert(error?.message ?? "리뷰 등록 실패","알림");
    }
  };

  const handleRegisterWatchedMovie = () => {
    const code = watchedTicketCodeInput.trim();
    if (!code) {
      cinemaAlert("거래번호 또는 예매번호를 입력해 주세요.","알림");
      return;
    }

    const matched = reservations.find((r) => String(r.reservationId) === code);
    const movieTitle = matched ? matched.movieTitle : `본 영화 등록 (${code})`;
    const watchedAt = matched ? matched.startTime : new Date().toISOString();

    setWatchedMovies((prev) => [...prev, { id: `m-${Date.now()}`, movieTitle, watchedAt }]);
    setShowWatchedModal(false);
    setWatchedTicketCodeInput("");
  };

  return {
    movieStoryTab,
    setMovieStoryTab,
    selectedTimelineYear,
    setSelectedTimelineYear,
    timelineYears,
    timelineRows,
    reviews,
    reviewCount: reviews.length,
    watchedCount: allWatchedMovies.length,
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
  };
}
