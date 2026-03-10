import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import InfoTab from '../components/detail/InfoTab';
import ReviewTab from '../components/detail/ReviewTab';
import MediaTab from '../components/detail/MediaTab';
import ReviewWriteModal from '../components/common/review/ReviewWriteModal';
import ReviewVerifyModal from '../components/common/review/ReviewVerifyModal';
import { Heart, Film, Star, Play, Clock, Info } from 'lucide-react';

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
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [verifiedResNum, setVerifiedResNum] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [scores, setScores] = useState({
    scoreDirection: 10,
    scoreStory: 10,
    scoreVisual: 10,
    scoreActor: 10,
    scoreOst: 10,
  });

  // 💡 [해결책] useEffect를 사용해 head에 스타일을 딱 한 번만 주입합니다!
  // 이렇게 하면 리렌더링 시 스타일이 덮어씌워지지 않아 깜빡임이 사라집니다.
  useEffect(() => {
    const styleId = 'kino-modern-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Anton', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        body { scrollbar-gutter: stable; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 모달 리셋 로직 (두 모달이 다 닫혔을 때 초기화)
  useEffect(() => {
    if (!isVerifyModalOpen && !isWriteModalOpen) {
      setVerifiedResNum("");
      setReviewContent("");
      setScores({ scoreDirection: 10, scoreStory: 10, scoreVisual: 10, scoreActor: 10, scoreOst: 10 });
    }
  }, [isVerifyModalOpen, isWriteModalOpen]);

  // --- 1. 데이터 연동 ---
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
      const memberParam = (isLoggedIn || storedMemberId) && effectiveMemberId ? `&memberId=${effectiveMemberId}` : '';

      try {
        const res = await axios.get(`http://localhost:8080/api/movies/${id}/detail?page=${currentPage}&sort=${currentSort}${memberParam}`);
        if (isLatest) {
          setMovie(res.data);
          setIsLiked(res.data.isLiked ?? res.data.liked);
        }
      } catch (err) {
        console.error('KINO 데이터 로딩 실패!', err);
      }
    };
    loadData();
    return () => { isLatest = false; };
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
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) navigate('/login');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/api/movies/${id}/likes`, { memberId: memberId });
      setIsLiked(res.data);
    } catch (err) { console.error('좋아요 실패', err); }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(0);
  };

  const handleVerifyReservation = async (resNum: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/reservations/verify/${resNum}`);
      if (Number(response.data.movieId) !== Number(id)) { 
        alert("해당 영화의 예매 내역이 아닙니다. 영화를 다시 확인해주세요.");
        setIsVerifyModalOpen(false);
        return;
      }
      await axios.get(`http://localhost:8080/api/reviews/check-availability/${resNum}`);
      setVerifiedResNum(resNum); 
      setIsVerifyModalOpen(false); 
      setIsWriteModalOpen(true); 
    } catch (error: any) {
      alert(error.response?.data?.error || "유효하지 않은 예매 번호입니다.");
      setIsVerifyModalOpen(false); 
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewContent.trim()) { alert("관람평 내용을 입력해 주세요."); return; }
    try {
      const finalData = { movieId: Number(id), reservationNumber: verifiedResNum, content: reviewContent, ...scores, memberId: memberId };
      await axios.post('http://localhost:8080/api/reviews', finalData);
      alert("리뷰가 성공적으로 등록되었습니다!");
      setIsWriteModalOpen(false); 
      fetchMovieData(); 
    } catch (err: any) {
      alert(err.response?.data?.error || "리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) navigate('/login');
      return;
    }
    setIsVerifyModalOpen(true); 
  };

  if (!movie) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <div className="w-16 h-16 border-4 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-[0.4em] animate-pulse">Loading Archive...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#B91C1C] selection:text-white">
      
      <div className="bg-[#1A1A1A] text-white">
        {/* Cinematic Trailer Area */}
        <section className="relative w-full h-[75vh] overflow-hidden bg-black group">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {movie.trailerUrl ? (
              <div className="absolute min-w-full min-h-full w-[300%] h-[300%] top-[-100%] left-[-100%] opacity-60">
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
              <img src={movie.stillCutUrls?.[0]} className="w-full h-full object-cover opacity-50" alt="backdrop" />
            )}
          </div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(26,26,26,1) 0%, rgba(26,26,26,0.4) 15%, rgba(26,26,26,0) 40%, rgba(26,26,26,0) 60%, rgba(26,26,26,0.4) 85%, rgba(26,26,26,1) 100%)` }} />
          </div>
          {!isPlaying && movie.trailerUrl && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button onClick={handlePlay} className="group/play flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-[#B91C1C] rounded-full flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-2xl">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                </div>
                <span className="font-display text-2xl uppercase tracking-widest text-white group-hover/play:text-[#B91C1C] transition-colors">Play Trailer</span>
              </button>
            </div>
          )}
          {isPlaying && (
            <button onClick={handlePause} className="absolute top-10 right-10 z-30 px-6 py-2 border border-white/20 text-white font-mono text-[9px] uppercase tracking-[0.4em] hover:bg-[#B91C1C] hover:border-[#B91C1C] transition-all">
              Stop Reel
            </button>
          )}
        </section>

        {/* Movie Info Area */}
        <section className="relative z-20 -mt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-16 items-start">
            <div className="w-full md:w-80 shrink-0">
              <div className="relative aspect-[2/3] border-[12px] border-white bg-white shadow-2xl overflow-hidden rounded-sm">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-[#B91C1C] text-white font-display text-2xl px-4 py-1">{movie.ageRating}</div>
              </div>
              <div className="flex flex-col gap-4 mt-10">
                <button onClick={() => navigate('/ticketing', { state: { movieId: movie.id } })} className="w-full py-5 bg-[#B91C1C] text-white font-display text-3xl uppercase tracking-tight hover:bg-white hover:text-[#B91C1C] transition-all shadow-xl active:scale-[0.98]">
                  Book Ticket
                </button>
                <button onClick={handleLikeToggle} className={`w-full py-4 border-2 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.3em] text-[10px] transition-all ${isLiked ? 'bg-white text-[#B91C1C] border-white' : 'bg-transparent text-white border-white/20 hover:border-white'}`}>
                  <Heart size={18} className={isLiked ? "fill-[#B91C1C]" : ""} /> {isLiked ? 'In Your Collection' : 'Add to Collection'}
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-px w-12 bg-[#B91C1C]"></div>
                  <span className="text-[#B91C1C] font-mono text-[10px] font-bold uppercase tracking-[0.5em]">{movie.dDay}</span>
                  <span className="text-white/40 font-mono text-[10px] font-bold uppercase tracking-[0.3em]">{movie.releaseDate} • {movie.durationMin}M</span>
                </div>
                <h1 className="font-display text-7xl md:text-9xl uppercase tracking-tighter leading-[0.85]">{movie.title}</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-white/10 py-12">
                <div className="space-y-4">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.5em] text-[#B91C1C]">Director</p>
                  <p className="font-display text-3xl uppercase tracking-tight text-white">{movie.director}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.5em] text-[#B91C1C]">Starring</p>
                  <p className="font-display text-2xl uppercase tracking-tight text-white/80 leading-tight">{movie.actor}</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.5em] text-[#B91C1C]">Archival Summary</p>
                <p className="text-xl text-white/60 leading-relaxed font-medium max-w-3xl italic">"{movie.description}"</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-white">
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-black/5 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-center">
            {[
              { id: 'info', label: 'Catalog Info' },
              { id: 'review', label: 'Patron Reviews' },
              { id: 'media', label: 'Visual Records' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`px-10 py-8 font-display text-xl uppercase tracking-tight transition-colors relative group ${activeTab === tab.id ? 'text-[#B91C1C]' : 'text-black/30 hover:text-black'}`}>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#B91C1C]" />}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-[#B91C1C] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
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

      </div>

      {/* 모달 호출부 */}
      <ReviewVerifyModal 
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerifySuccess={handleVerifyReservation}
        reservationNumber={verifiedResNum}
        setReservationNumber={setVerifiedResNum}
      />
      <ReviewWriteModal 
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        movieTitle={movie.title}
        movieId={Number(id)}
        reservationNumber={verifiedResNum}
        content={reviewContent}
        setContent={setReviewContent}
        scores={scores}
        setScores={setScores}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MovieDetail;