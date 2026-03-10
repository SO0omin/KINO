import type { MyWishMovieItem } from "../../../api/myPageApi";

type TimelineRow = {
  id: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  reservationNumber:string;
  watchedAt: string;
};

type ReviewItem = {
  id: number;
  movieTitle: string;
  content: string;
  createdAt: string;
};

type WatchedItem = {
  id: string;
  movieTitle: string;
  watchedAt: string;
};

type MovieStorySectionProps = {
  movieStoryTab: "timeline" | "review" | "watched" | "wish";
  setMovieStoryTab: (value: "timeline" | "review" | "watched" | "wish") => void;
  timelineYears: number[];
  selectedTimelineYear: number;
  setSelectedTimelineYear: (value: number) => void;
  timelineRows: TimelineRow[];
  formatDateSimple: (value: string) => string;
  reviewCount: number;
  setShowReviewModal: (value: boolean) => void;
  reviews: ReviewItem[];
  watchedCount: number;
  setShowWatchedModal: (value: boolean) => void;
  allWatchedMovies: WatchedItem[];
  wishCount: number;
  wishLoading: boolean;
  wishMovies: MyWishMovieItem[];
  onRemoveWishMovie: (movieId: number) => Promise<void>;
};

export function MovieStorySection({
  movieStoryTab,
  setMovieStoryTab,
  timelineYears,
  selectedTimelineYear,
  setSelectedTimelineYear,
  timelineRows,
  formatDateSimple,
  reviewCount,
  setShowReviewModal,
  reviews,
  watchedCount,
  setShowWatchedModal,
  allWatchedMovies,
  wishCount,
  wishLoading,
  wishMovies,
  onRemoveWishMovie,
}: MovieStorySectionProps) {
  return (
    <section>
      <h1 className="text-5xl font-semibold tracking-tight text-[#1A1A1A]">나의 무비스토리</h1>

      <div className="mt-5 grid grid-cols-2 border border-black/10 md:grid-cols-4">
        {[
          { key: "timeline", label: "무비타임라인" },
          { key: "review", label: "관람평" },
          { key: "watched", label: "본영화" },
          { key: "wish", label: "보고싶어" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-5 py-3 text-sm font-semibold tracking-tight transition-colors ${movieStoryTab === tab.key ? "bg-[#1A1A1A] text-white" : "bg-white text-black/45 hover:text-[#B91C1C]"}`}
            onClick={() => setMovieStoryTab(tab.key as "timeline" | "review" | "watched" | "wish")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {movieStoryTab === "timeline" ? (
        <div className="mt-6 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-4 text-lg text-[#1A1A1A]">
            <button
              className="text-black/25"
              onClick={() => {
                const idx = timelineYears.indexOf(selectedTimelineYear);
                if (idx > 0) setSelectedTimelineYear(timelineYears[idx - 1]);
              }}
            >
              ‹
            </button>
            <div className="flex gap-8">
              {timelineYears.map((year) => (
                <button
                  key={year}
                  className={year === selectedTimelineYear ? "border-b-4 border-[#B91C1C] pb-1 text-[#B91C1C]" : "text-[#1A1A1A]"}
                  onClick={() => setSelectedTimelineYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
            <button
              className="text-black/25"
              onClick={() => {
                const idx = timelineYears.indexOf(selectedTimelineYear);
                if (idx < timelineYears.length - 1) setSelectedTimelineYear(timelineYears[idx + 1]);
              }}
            >
              ›
            </button>
          </div>
          {timelineRows.length === 0 ? (
            <div className="py-14 text-center text-black/45">나의 무비타임라인을 만들어 보세요.</div>
          ) : (
            <div className="divide-y divide-black/5">
              {timelineRows.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <p className="text-lg font-semibold text-[#1A1A1A]">{item.movieTitle}</p>
                   <p className="text-sm font-semibold text-[#1A1A1A]">{item.reservationNumber}</p>
                  <p className="mt-1 text-sm text-black/55">
                    {formatDateSimple(item.watchedAt)} · {item.theaterName} {item.screenName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {movieStoryTab === "review" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-[#1A1A1A]">총 <span className="text-[#B91C1C]">{reviewCount}</span>건</p>
            <button
              className="rounded-sm border border-[#B91C1C] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
              onClick={() => setShowReviewModal(true)}
            >
              관람평 작성
            </button>
          </div>
          <div className="overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            {reviews.length === 0 ? (
              <div className="py-14 text-center text-black/45">등록된 한줄평이 없습니다.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {reviews.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <p className="text-base font-semibold text-[#1A1A1A]">{item.movieTitle}</p>
                    <p className="mt-2 text-sm text-[#1A1A1A]">{item.content}</p>
                    <p className="mt-1 text-xs text-black/40">{formatDateSimple(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {movieStoryTab === "watched" ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-black/55">· 극장에서 발권하신 티켓 거래번호 또는 직접 등록으로 본 영화를 기록할 수 있습니다.</p>
              <p className="text-sm text-black/55">· 본영화는 관람한 인원수에 한해 등록이 가능합니다.</p>
            </div>
            <button
              className="rounded-sm border border-[#B91C1C] bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C1C] transition-colors hover:bg-[#B91C1C] hover:text-white"
              onClick={() => setShowWatchedModal(true)}
            >
              본 영화 등록
            </button>
          </div>
          <div className="mt-5">
            <p className="text-2xl font-semibold text-[#1A1A1A]">총 <span className="text-[#B91C1C]">{watchedCount}</span>건</p>
          </div>
          <div className="mt-3 overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            {allWatchedMovies.length === 0 ? (
              <div className="py-14 text-center text-black/45">관람 내역이 없습니다.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {allWatchedMovies.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <p className="text-base font-semibold text-[#1A1A1A]">{item.movieTitle}</p>
                    <p className="mt-1 text-sm text-black/55">{formatDateSimple(item.watchedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {movieStoryTab === "wish" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-[#1A1A1A]">총 <span className="text-[#B91C1C]">{wishCount}</span>건</p>
            <span className="text-sm text-black/55">영화 목록에서 찜하기로만 추가 가능합니다.</span>
          </div>
          <div className="overflow-hidden rounded-sm border border-black/5 bg-white shadow-xl">
            {wishLoading ? (
              <div className="py-20 text-center text-black/45">불러오는 중...</div>
            ) : wishMovies.length === 0 ? (
              <div className="py-20 text-center text-black/45">보고싶은 영화를 담아주세요.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {wishMovies.map((item) => (
                  <div key={item.movieId} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-base font-semibold text-[#1A1A1A]">{item.title}</p>
                    </div>
                    <button
                      className="rounded-sm border border-black/10 bg-white px-3 py-1 text-sm text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C]"
                      onClick={() => onRemoveWishMovie(item.movieId)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
