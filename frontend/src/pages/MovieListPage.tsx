import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ratingImages, { type AgeRatingType } from "../utils/getRatingImage";
import axios from 'axios';
import { Heart, Search } from 'lucide-react'; // 💡 하트 아이콘 추가
import { useAuth } from '../contexts/AuthContext'; // 로그인 상태 가져오기

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

  const [searchQuery, setSearchQuery] = useState(stateKeyword); // 입력창 초기화
  const [appliedSearch, setAppliedSearch] = useState(stateKeyword); // 실제 검색에 사용될 값 (엔터/버튼 클릭 시 업데이트)
  const [sortOrder, setSortOrder] = useState<'RELEASE_DATE' | 'TITLE_ASC'>('RELEASE_DATE');

  useEffect(() => {
    if (location.state?.keyword) {
      // 검색 로직이 실행된 후, 현재 주소의 state를 초기화합니다.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate]);
  
  // 탭이 바뀔 때마다 백엔드 API 호출
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
            keyword: appliedSearch, // 💡 백엔드로 검색어 전송!
            sort: activeTab === 'UPCOMING' ? sortOrder : undefined // 💡 백엔드로 정렬 방식 전송!
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
    e.preventDefault(); // 폼 제출 시 새로고침 방지
    setAppliedSearch(searchQuery); 
  };

  const handleTabChange = (tab: 'ALL' | 'UPCOMING') => {
    setActiveTab(tab);
    setSearchQuery("");
    setAppliedSearch("");
    setSortOrder('RELEASE_DATE');
  };

  const handleLikeToggle = async (movieId: number, currentIsLiked: boolean) => {
    // 1. 방어 로직: 비회원이거나 로그인 안 한 경우
    if (!isLoggedIn || isGuest || !memberId) {
      alert("로그인 상태의 회원만 사용 가능한 기능입니다.");
      return;
    }

    // 2. 화면 먼저 업데이트 (빠른 반응속도를 위해 Optimistic UI 적용)
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
      // 실패 시 원래 상태로 복구 (생략 가능하지만 넣으면 안전함)
    }
  };

  const handleMovieClick = (movieId: number) => {
    // 영화 ID가 1이라면 '/movies/1' 경로로 이동합니다.
    navigate(`/movies/${movieId}`); 
  };

  return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">영화</h1>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => handleTabChange('ALL')}
            className={`py-3 px-6 text-lg font-bold transition-colors ${
              activeTab === 'ALL' ? 'border-b-2 border-[#eb4d32] text-[#eb4d32]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            전체 영화
          </button>
          <button
            onClick={() => handleTabChange('UPCOMING')}
            className={`py-3 px-6 text-lg font-bold transition-colors ${
              activeTab === 'UPCOMING' ? 'border-b-2 border-[#eb4d32] text-[#eb4d32]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            상영 예정작
          </button>
      </div>

        {/* 툴바 영역: 검색 결과 개수, 검색창, 정렬 셀렉트 박스 */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        
        <div className="flex gap-4 w-full sm:w-auto">
          {/* (3) 상영 예정작일 때만 보이는 정렬 옵션 */}
            {activeTab === 'UPCOMING' && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <button 
                  onClick={() => setSortOrder('RELEASE_DATE')}
                  className={`transition-colors ${sortOrder === 'RELEASE_DATE' ? 'text-[#eb4d32] font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  개봉일순
                </button>
                <span className="text-gray-300 text-xs">|</span>
                <button 
                  onClick={() => setSortOrder('TITLE_ASC')}
                  className={`transition-colors ${sortOrder === 'TITLE_ASC' ? 'text-[#eb4d32] font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  가나다순
                </button>
              </div>
            )}
          

          {/* (4) 총 개수 표시 */}
          <div className="text-gray-700 font-bold">
            <span className="text-[#eb4d32]">{movies.length}</span>개의 영화가 검색되었습니다.
          </div>
        </div>
       <div className="flex gap-4 w-full sm:w-auto items-center">
          {/* (2) 검색창 */}
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="영화 제목을 입력하세요" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#eb4d32] transition-colors"
            />
            {/* 💡 수정됨: [transform:translateX(-50%)] -> -translate-y-1/2 로 변경! */}
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#eb4d32]">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

        {/* 영화 그리드 영역 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 font-bold">영화를 불러오는 중입니다...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie, index) => (
              <div key={movie.id} className="flex flex-col">
                {/* 포스터 영역 (호버 시 예매 버튼 등장) */}
                <div className="relative overflow-hidden rounded-lg shadow-md aspect-[2/3] mb-4 group">
                  <button onClick={() => handleMovieClick(movie.id)}>
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* 순위 뱃지 */}
                    {activeTab === 'ALL' && (
                      <div className="absolute top-0 bg-[#696969] left-0 text-white font-bold text-xl px-4 py-2 opacity-90 rounded-br-lg">
                        {index + 1}
                      </div>
                    )}

                    {/* 호버 오버레이 (포스터 위에만 나타남) */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col">
                      <div className="text-white text-sm leading-relaxed line-clamp-6 text-justify">
                        {movie.description || "등록된 소개글이 없습니다."}
                      </div>
                      <div className="mt-auto">
                        <hr className="border-[#696969] opacity-50 mb-3" />
                        <div className="text-white text-center font-bold text-sm flex items-center justify-center gap-2">
                          <span>관람평</span>
                          <span className="text-lg text-[#eb4d32]">
                            {movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "0.0"}
                          </span>
                          <span>점</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* 영화 정보 영역 */}
                <div className="flex items-center gap-2 mb-1">
                  <img 
                    src={ratingImages[movie.ageRating as AgeRatingType] || ratingImages.ALL} 
                    alt={`관람등급 ${movie.ageRating}`}
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-lg font-bold text-gray-800 truncate">{movie.title}</h3>
                </div>
                
                <div className="text-sm text-gray-500 flex justify-between mb-2">
                  <span>예매율 {movie.bookingRate}%</span>
                  <span>{movie.releaseDate} 개봉</span>
                </div>

                {/* 버튼 영역 */}
                <div className="text-sm text-gray-500 flex justify-between items-center mt-auto">
                  {/* 찜 버튼 */}
                  <button 
                    onClick={() => handleLikeToggle(movie.id, movie.isLiked)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#eb4d32] transition-colors"
                  >
                    <Heart 
                      size={18} 
                      className={movie.isLiked ? "fill-[#eb4d32] text-[#eb4d32]" : ""} 
                    />
                    <span className="text-sm font-bold">{movie.likeCount}</span>
                  </button>

                  {/* 예매 버튼 */}
                  <button 
                    onClick={() => navigate('/ticketing', { state: { preSelectedMovieId: movie.id } })}
                    className="bg-gray-100 text-gray-700 text-xs font-bold py-2 px-6 rounded hover:bg-[#eb4d32] hover:text-white transition-colors"
                  >
                    예매하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}