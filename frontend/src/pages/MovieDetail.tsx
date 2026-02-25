import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfoTab from '../components/detail/InfoTab';
import ReviewTab from '../components/detail/ReviewTab';
import MediaTab from '../components/detail/MediaTab';
import ReviewWriteModal from '../components/detail/ReviewWriteModal';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSort, setCurrentSort] = useState('id,desc');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);

  const fetchMovieData = useCallback(() => {
    axios
      .get(`http://localhost:8080/api/movies/${id}/detail?page=${currentPage}&sort=${currentSort}`)
      .then((res) => {
        setMovie(res.data);
        setIsLiked(res.data.isLiked);
      })
      .catch((err) => console.error('KINO 데이터 로딩 실패!', err));
  }, [id, currentPage, currentSort]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);


  useEffect(() => {
    setIsPlaying(false);
    setIsSoundOn(false);
  }, [id]);

  const handleLikeToggle = async () => {
    try {
      const res = await axios.post(`http://localhost:8080/api/movies/${movie.id}/like`);
      setIsLiked(res.data);
    } catch (err) {
      console.error('좋아요 토글 실패 🕵️‍♂️', err);
    }
  };

  const getYouTubeEmbedBase = (url: string) => {
    if (!url) return '';
    const vid =
      url.split('v=')[1]?.split('&')[0] ||
      url.split('youtu.be/')[1]?.split('?')[0] ||
      url.split('/embed/')[1]?.split('?')[0] ||
      url.split('/').pop()?.split('?')[0];

    if (!vid) return '';
    return `https://www.youtube.com/embed/${vid}`;
  };

  const videoId = useMemo(() => {
    if (!movie?.trailerUrl) return '';
    const url = movie.trailerUrl as string;
    return (
      url.split('v=')[1]?.split('&')[0] ||
      url.split('youtu.be/')[1]?.split('?')[0] ||
      url.split('/embed/')[1]?.split('?')[0] ||
      url.split('/').pop()?.split('?')[0] ||
      ''
    );
  }, [movie?.trailerUrl]);

  const videoSrc = useMemo(() => {
    if (!movie?.trailerUrl || !videoId) return '';
    const base = getYouTubeEmbedBase(movie.trailerUrl);

    const autoplay = isPlaying ? 1 : 0;
    const mute = isPlaying ? (isSoundOn ? 0 : 1) : 1;

    return `${base}?autoplay=${autoplay}&mute=${mute}&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
  }, [movie?.trailerUrl, videoId, isPlaying, isSoundOn]);

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await axios.post('http://localhost:8080/api/reviews', reviewData);
      alert('리뷰가 성공적으로 등록되었습니다! 🍿');
      setIsReviewModalOpen(false);
      fetchMovieData();
    } catch (err) {
      console.error('리뷰 등록 중 오류 발생:', err);
      alert('리뷰 등록에 실패했습니다. 🕵️‍♂️');
    }
  };

  const handlePlay = () => {
    setIsSoundOn(true);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsSoundOn(false);
  };

  if (!movie) return <div className="pt-40 text-center text-zinc-500 font-mono italic">KINO LOADING...</div>;

  return (
    <div className="bg-[#050505] min-h-screen text-white selection:bg-purple-500/30">
      {/* HeroSection 스타일 상단 시네마틱 헤더 */}
      <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-black group">
        {/* 1) 배경 트레일러(크롭 트릭) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {movie.trailerUrl ? (
            <div className="absolute min-w-full min-h-full w-[300%] h-[300%] top-[-100%] left-[-100%]">
              <iframe
                // autoplay/mute 토글 시 확실히 반영되도록 key로 리로드 유도
                key={`${videoId}-${isPlaying ? 'play' : 'stop'}-${isSoundOn ? 'sound' : 'mute'}`}
                src={videoSrc}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                title={movie.title}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          ) : (
            <img
              src={movie.stillCutUrls?.[0] || movie.posterUrl}
              className="w-full h-full object-cover opacity-60"
              alt="backdrop"
            />
          )}
        </div>

        {/* 2) 상하 비네팅 */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  rgba(10,10,10,1) 0%,
                  rgba(10,10,10,0.4) 15%,
                  rgba(10,10,10,0) 40%,
                  rgba(10,10,10,0) 60%,
                  rgba(10,10,10,0.4) 85%,
                  rgba(10,10,10,1) 100%
                )
              `,
            }}
          />
        </div>

        {/* 3) 버튼 레이어 */}
        {movie.trailerUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            {/* 재생 전: Play 버튼 항상 보이기 */}
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="w-24 h-24 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center group/play hover:scale-110 hover:bg-white/30 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                aria-label="Play trailer"
              >
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* 재생 중: '트레일러 영역에 커서 올렸을 때만' Pause 버튼 등장 */}
            {isPlaying && (
              <button
                onClick={handlePause}
                className="
                  w-24 h-24 bg-white/20 backdrop-blur-md border border-white/30 rounded-full
                  flex items-center justify-center
                  transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.1)]
                  opacity-0 group-hover:opacity-100
                  hover:scale-110 hover:bg-white/30
                "
                aria-label="Pause trailer"
              >
                <div className="flex gap-2">
                  <span className="w-3 h-8 bg-white/90 rounded-sm" />
                  <span className="w-3 h-8 bg-white/90 rounded-sm" />
                </div>
              </button>
            )}
          </div>
        )}
      </section>

      <section className="relative z-30 -mt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-16 items-start">
          {/* 포스터 영역 */}
          <div className="w-full md:w-[320px] shrink-0 group">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 transition-transform duration-500 group-hover:scale-[1.02]">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })}
              className="px-10 py-4 bg-purple-600 text-white font-black italic rounded-full hover:bg-purple-500 transition-all shadow-[0_10px_30px_rgba(147,51,234,0.3)] uppercase tracking-widest"
            >
              실시간 예매하기
            </button>
            <button
              onClick={handleLikeToggle}
              className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isLiked 
                ? 'bg-white border-white text-red-500 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110' 
                : 'bg-transparent border-white/20 text-white hover:border-purple-500 hover:text-purple-500'
              }`}
              aria-label="Like movie"
            >
              <svg 
                width="24" height="24" viewBox="0 0 24 24" 
                fill={isLiked ? "currentColor" : "none"} 
                stroke="currentColor" strokeWidth="2.5" 
                className={isLiked ? "animate-pulse" : ""}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            </div>
          </div>

          {/* 영화 정보 영역 */}
          <div className="flex-1 pt-6 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg font-black text-[10px] tracking-[0.2em] uppercase italic animate-pulse">
                  {movie.dDay}
                </span>
                <span className="text-zinc-500 font-bold text-xs tracking-widest uppercase italic">
                  Kino Exclusive Selection
                </span>
              </div>

              <h1 className="text-6xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-600 text-[9px]">Release</span>
                  <span>{movie.releaseDate}</span>
                </div>
                <div className="w-px h-8 bg-zinc-800 self-center" />
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-600 text-[9px]">Runtime</span>
                  <span>{movie.durationMin} MINS</span>
                </div>
                <div className="w-px h-8 bg-zinc-800 self-center" />
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-600 text-[9px]">Rating</span>
                  <span>{movie.ageRating}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-y border-white/5 py-10">
              <div className="space-y-2">
                <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em]">Director</p>
                <p className="text-zinc-100 text-xl font-bold italic">{movie.director || '데이터 준비 중'}</p>
              </div>
              <div className="space-y-2 border-l border-white/5 pl-10">
                <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em]">Cast</p>
                <p className="text-zinc-100 text-lg font-bold italic leading-tight">{movie.actor || '데이터 준비 중'}</p>
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-zinc-400 text-lg leading-relaxed italic font-medium opacity-80">
                "{movie.description || '줄거리 정보가 등록되지 않았습니다.'}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <nav className="border-y border-white/5 sticky top-0 bg-[#050505]/90 backdrop-blur-2xl z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-16">
          {['info', 'review', 'media'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-8 text-[11px] font-black tracking-[0.4em] uppercase transition-all relative ${
                activeTab === tab ? 'text-purple-500' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {tab === 'info' ? 'Info' : tab === 'review' ? 'Reviews' : 'Media'}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* 탭 콘텐츠 영역 */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        {activeTab === 'info' && <InfoTab data={movie} />}

        {activeTab === 'review' && (
          <ReviewTab
            totalCount={movie.totalReviewCount}
            reviews={movie.reviews}
            currentPage={currentPage}
            onPageChange={(p: number) => setCurrentPage(p)}
            onSortChange={(s: string) => {
              setCurrentSort(s);
              setCurrentPage(0);
            }}
            currentSort={currentSort}
            onWriteClick={() => setIsReviewModalOpen(true)}
          />
        )}

        {activeTab === 'media' && <MediaTab data={movie} />}
      </section>

      <ReviewWriteModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        movieTitle={movie.title}
        movieId={movie.id}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MovieDetail;