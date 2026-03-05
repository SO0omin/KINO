import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import InfoTab from '../components/detail/InfoTab';
import ReviewTab from '../components/detail/ReviewTab';
import MediaTab from '../components/detail/MediaTab';
import ReviewWriteModal from '../components/detail/ReviewWriteModal';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberId, isLoggedIn } = useAuth();
  
  const [movie, setMovie] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSort, setCurrentSort] = useState('id,desc');

  // --- 1. 데이터 연동 (백엔드) ---
  const fetchMovieData = useCallback(() => {
  if (!id) return;
  const memberParam = isLoggedIn && memberId ? `&memberId=${memberId}` : '';

  axios
    .get(`http://localhost:8080/api/movies/${id}/detail?page=${currentPage}&sort=${currentSort}${memberParam}`)
    .then((res) => {
      setMovie(res.data);
      setIsLiked(res.data.isLiked);
    })
    .catch((err) => console.error('KINO 데이터 로딩 실패!', err));
}, [id, currentPage, currentSort, isLoggedIn, memberId]);

useEffect(() => {
  let isLatest = true;

  const loadData = async () => {
    const storedMemberId = localStorage.getItem('memberId');
    const effectiveMemberId = memberId || (storedMemberId ? Number(storedMemberId) : null);
    
    const memberParam = (isLoggedIn || storedMemberId) && effectiveMemberId 
      ? `&memberId=${effectiveMemberId}` 
      : '';

    try {
      const res = await axios.get(
        `http://localhost:8080/api/movies/${id}/detail?page=${currentPage}&sort=${currentSort}${memberParam}`
      );
      
      if (isLatest) {
        setMovie(res.data);
        setIsLiked(res.data.isLiked ?? res.data.liked);
      }
    } catch (err) {
      console.error('KINO 데이터 로딩 실패!', err);
    }
  };

  loadData();

  return () => {
    isLatest = false; // 이전 요청 무시
  };
}, [id, currentPage, currentSort, isLoggedIn, memberId]);

  useEffect(() => {
    setIsPlaying(false);
    setIsSoundOn(false);
  }, [id]);

  // --- 2. 비디오 로직 ---
  const getYouTubeEmbedBase = (url: string) => {
    if (!url) return '';
    const vid = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0] || url.split('/embed/')[1]?.split('?')[0] || url.split('/').pop()?.split('?')[0];
    return vid ? `https://www.youtube.com/embed/${vid}` : '';
  };

  const videoId = useMemo(() => {
    if (!movie?.trailerUrl) return '';
    const url = movie.trailerUrl;
    return url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0] || url.split('/embed/')[1]?.split('?')[0] || url.split('/').pop()?.split('?')[0] || '';
  }, [movie?.trailerUrl]);

  const videoSrc = useMemo(() => {
    if (!movie?.trailerUrl || !videoId) return '';
    const base = getYouTubeEmbedBase(movie.trailerUrl);
    const autoplay = isPlaying ? 1 : 0;
    const mute = isPlaying ? (isSoundOn ? 0 : 1) : 1;
    return `${base}?autoplay=${autoplay}&mute=${mute}&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
  }, [movie?.trailerUrl, videoId, isPlaying, isSoundOn]);

  // --- 3. 핸들러 함수 ---
  const handlePlay = () => { setIsSoundOn(true); setIsPlaying(true); };
  const handlePause = () => { setIsPlaying(false); setIsSoundOn(false); };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/movies/${id}/likes`, {
        memberId: memberId 
      });
      setIsLiked(res.data);
    } catch (err) {
      console.error('좋아요 실패 🕵️‍♂️', err);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(0); // 페이지를 첫 페이지(0)로 초기화
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: any) => {

    try {
      const finalData = {
        ...reviewData,
        memberId: memberId 
      };

      await axios.post('http://localhost:8080/api/reviews', finalData);
      setIsReviewModalOpen(false);
      fetchMovieData();
    } catch (err) {
      console.error('리뷰 등록 실패:', err);
    }
  };


  if (!movie) return <div className="pt-40 text-center text-zinc-500 font-mono italic">KINO LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-black">
      
      <div className="bg-black text-white">
        {/* Cinematic Trailer Area */}
        <section className="relative w-full h-[65vh] overflow-hidden bg-black group">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {movie.trailerUrl ? (
              <div className="absolute min-w-full min-h-full w-[300%] h-[300%] top-[-100%] left-[-100%] opacity-80">
                <iframe
                  key={`${videoId}-${isPlaying ? 'play' : 'stop'}-${isSoundOn ? 'sound' : 'mute'}`}
                  src={videoSrc}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  title={movie.title}
                />
              </div>
            ) : (
              <img src={movie.stillCutUrls?.[0]} className="w-full h-full object-cover opacity-60" alt="backdrop" />
            )}
          </div>

          {/* Vignette Overlay */}
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

          {/* Trailer Controls */}
          {!isPlaying && movie.trailerUrl && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button onClick={handlePlay} className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
              </button>
            </div>
          )}
          {isPlaying && (
            <button onClick={handlePause} className="absolute top-10 right-10 z-30 px-6 py-2 border border-white/30 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Stop Trailer
            </button>
          )}
        </section>

        {/* Movie Info Area */}
        <section className="relative z-20 -mt-20 pb-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 items-start">
            <div className="w-full md:w-80 shrink-0">
              <div className="relative aspect-[2/3] border-[8px] border-white bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-4 mt-8">
                <button 
                  onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })}
                  className="flex-1 py-4 bg-white text-black font-serif italic text-xl hover:bg-zinc-200 transition-all shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Book Ticket
                </button>
                {/* Heart Button */}
                <button onClick={handleLikeToggle} className={`w-16 h-16 border-2 border-white flex items-center justify-center transition-all ${isLiked ? 'bg-white text-red-600' : 'bg-transparent text-white hover:border-white'}`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isLiked ? "animate-bounce" : ""}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Info Text */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-white text-black font-mono text-[10px] uppercase tracking-widest">{movie.dDay}</span>
                  <span className="text-white/50 font-mono text-[10px] uppercase tracking-[0.3em]">{movie.releaseDate} • {movie.durationMin}m</span>
                </div>
                <h1 className="font-serif text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">{movie.title}</h1>
              </div>
              <div className="flex flex-col md:flex-row gap-x-16 gap-y-8 border-y border-white/10 py-8">
                <div className="md:min-w-[140px]">
                  <p className="font-typewriter text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">Direction</p>
                  <p className="font-serif text-2xl italic text-white whitespace-nowrap">
                    {movie.director}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-typewriter text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">Featuring</p>
                  <p className="font-serif text-xl italic leading-relaxed text-white">
                    {movie.actor}
                  </p>
                </div>
              </div>
              <p className="font-serif text-xl text-white/70 leading-relaxed italic max-w-2xl">"{movie.description}"</p>
            </div>
          </div>
        </section>
      </div>


      <div className="bg-[#F5F2ED]">
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-40 bg-[#F5F2ED] border-b-[6px] border-black">
          <div className="max-w-7xl mx-auto px-6 flex justify-center">
            {[
              { id: 'info', label: 'Archive Info' },
              { id: 'review', label: 'Patron Reviews' },
              { id: 'media', label: 'Visual Records' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-12 py-8 font-serif italic text-xl tracking-tight transition-all relative group ${activeTab === tab.id ? 'text-black' : 'text-black/30 hover:text-black'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-2 bg-black" />}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-2 bg-black transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-20 px-6 max-w-7xl mx-auto">
          {activeTab === 'info' && <InfoTab data={movie} />}
          {activeTab === 'review' && (
            <ReviewTab 
              totalCount={movie.totalReviewCount}
              reviews={movie.reviews}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSortChange={setCurrentSort}
              currentSort={currentSort}
              onWriteClick={handleWriteReviewClick}
            />
          )}
          {activeTab === 'media' && <MediaTab data={movie} />}
        </div>

        {/* Decorative Footer */}
        <div className="py-24 border-t border-black/5 flex flex-col items-center gap-8 opacity-20">
          <div className="flex gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-black rounded-full" />)}
          </div>
          <p className="font-typewriter text-[10px] uppercase tracking-[1em]">End of Record</p>
        </div>
      </div>

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