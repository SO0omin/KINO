import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ratingImages, { type AgeRatingType, resolveRatingImage } from "../utils/getRatingImage";
import axios from 'axios';
import { Heart, Search, Film, Clock, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// 영화 데이터 타입 정의
interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  description: string;
  releaseDate: string;
  bookingRate: number; 
  ageRating: string;
  likeCount: number;
  isLiked: boolean;
  avgRating: number;
}

export default function MovieListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateKeyword = location.state?.keyword || "";
  const { isLoggedIn, isGuest, memberId } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING'>('ALL');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(stateKeyword);
  const [appliedSearch, setAppliedSearch] = useState(stateKeyword);
  const [sortOrder, setSortOrder] = useState<'RELEASE_DATE' | 'TITLE_ASC'>('RELEASE_DATE');

  useEffect(() => {
    if (location.state?.keyword) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const fetchMovies = async () => {
      const storedMemberId = localStorage.getItem('memberId');
      const effectiveMemberId = memberId || (storedMemberId ? Number(storedMemberId) : null);

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/movies`, {
          params: { 
            type: activeTab, 
            memberId: effectiveMemberId,
            keyword: appliedSearch,
            sort: activeTab === 'UPCOMING' ? sortOrder : undefined
          }
        });
        setMovies(response.data);
      } catch (error) {
        console.error('영화 목록을 불러오는데 실패했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, [activeTab, memberId, appliedSearch, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery); 
  };

  const handleTabChange = (tab: 'ALL' | 'UPCOMING') => {
    setActiveTab(tab);
    setSearchQuery("");
    setAppliedSearch("");
    setSortOrder('RELEASE_DATE');
  };

  const handleLikeToggle = async (movieId: number, currentIsLiked: boolean) => {
    if (!isLoggedIn || isGuest || !memberId) {
      alert("로그인 상태의 회원만 사용 가능한 기능입니다.");
      return;
    }

    setMovies(prevMovies => 
      prevMovies.map(movie => {
        if (movie.id === movieId) {
          return {
            ...movie,
            isLiked: !currentIsLiked,
            likeCount: currentIsLiked ? movie.likeCount - 1 : movie.likeCount + 1
          };
        }
        return movie;
      })
    );
    try {
      await axios.post(`/api/movies/${movieId}/likes`, { memberId });
    } catch (error) {
      alert("찜하기 처리에 실패했습니다.");
    }
  };

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white">
      
      {/* 1. 헤더 영역 (AI 스튜디오 스타일) */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 font-sans">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-mono text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase font-sans">Film Archive</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-4xl md:text-4xl uppercase tracking-tighter leading-none">
              영화 <span className="text-white/20">라이브러리</span>
            </h1>
            <p className="text-white/20">현재 상영작과 상영 예정작을 확인하세요.</p>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
        
        {/* 2. 탭 메뉴 */}
        <div className="flex w-full mb-16 bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl">
          <button
            onClick={() => handleTabChange('ALL')}
            className={`flex-1 py-6 text-xs font-bold uppercase tracking-[0.4em] transition-all ${
              activeTab === 'ALL' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5 text-black/40'
            }`}
          >
            전체 영화
          </button>
          <button
            onClick={() => handleTabChange('UPCOMING')}
            className={`flex-1 py-6 text-xs font-bold uppercase tracking-[0.4em] transition-all ${
              activeTab === 'UPCOMING' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5 text-black/40'
            }`}
          >
            상영 예정작
          </button>
        </div>

        {/* 3. 툴바 (검색 및 정렬) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-black/5 pb-8">
          <div className="flex items-center gap-8">
            {activeTab === 'UPCOMING' && (
              <div className="flex items-center gap-4 bg-black/5 p-1 rounded-sm">
                <button 
                  onClick={() => setSortOrder('RELEASE_DATE')}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                    sortOrder === 'RELEASE_DATE' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-black/40 hover:text-black'
                  }`}
                >
                  개봉일순
                </button>
                <button 
                  onClick={() => setSortOrder('TITLE_ASC')}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                    sortOrder === 'TITLE_ASC' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-black/40 hover:text-black'
                  }`}
                >
                  가나다순
                </button>
              </div>
            )}
            
            <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">
              총 <span className="text-[#B91C1C] text-lg font-display mr-1">{movies.length}</span>개의 영화가 검색되었습니다.
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="영화 제목을 입력하세요..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDFDFD] border border-black/10 rounded-sm px-6 py-4 pr-12 text-[11px] font-bold focus:outline-none focus:border-[#B91C1C] transition-all shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-[#B91C1C] transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* 4. 영화 그리드 영역 */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 flex flex-col items-center justify-center gap-6 opacity-20">
              <div className="w-16 h-16 border-2 border-dashed border-black rounded-full animate-spin"></div>
              <p className="font-display text-2xl uppercase tracking-tight">Accessing Reels...</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            >
              {movies.map((movie, index) => (
                <div key={movie.id} className="flex flex-col">
                  {/* 포스터 영역 */}
                  <div className="group relative overflow-hidden rounded-sm shadow-2xl aspect-[2/3] mb-6 bg-black cursor-pointer" onClick={() => navigate(`/movies/${movie.id}`)}>
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    
                    {/* 순위 뱃지 */}
                    {activeTab === 'ALL' && (
                      <div className="absolute top-0 left-0 bg-[#B91C1C] text-white font-display text-4xl px-4 py-2 shadow-xl">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    )}

                    {/* 호버 오버레이 (Synopsis & Rating) */}
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-between border-4 border-[#B91C1C]/0 group-hover:border-[#B91C1C]/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#B91C1C]">
                          <Film size={12} />
                          <span>줄거리</span>
                        </div>
                        <p className="text-white/70 text-[11px] leading-relaxed font-medium text-justify line-clamp-6">
                          {movie.description || "등록된 소개글이 없습니다."}
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="h-px w-full bg-white/10"></div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40 font-sans">Patron Rating</span>
                          <div className="flex items-center gap-3">
                            <Star size={16} className="text-[#B91C1C] fill-[#B91C1C]" />
                            <span className="font-display text-4xl text-white">
                              {movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "0.0"}
                            </span>
                          </div>
                        </div>
                        <button className="w-full py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all font-sans">
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 영화 상세 정보 */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={resolveRatingImage(movie.ageRating)} 
                          alt={movie.ageRating}
                          className="w-6 h-6 object-contain"
                        />
                        <h3 className="font-display text-2xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#B91C1C] transition-colors line-clamp-1">{movie.title}</h3>
                      </div>
                      <button 
                        onClick={() => handleLikeToggle(movie.id, movie.isLiked)}
                        className="flex items-center gap-2 text-black/20 hover:text-[#B91C1C] transition-colors"
                      >
                        <Heart 
                          size={20} 
                          className={movie.isLiked ? "fill-[#B91C1C] text-[#B91C1C]" : ""} 
                        />
                        <span className="text-[10px] font-bold">{movie.likeCount}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/40 border-t border-black/5 pt-4 font-sans">
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        <span>예매율 {movie.bookingRate}%</span>
                      </div>
                      <span>{movie.releaseDate} 개봉</span>
                    </div>

                    <button 
                      onClick={() => navigate('/ticketing', { state: { preSelectedMovieId: movie.id } })}
                      className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
                    >
                      예매하기
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}