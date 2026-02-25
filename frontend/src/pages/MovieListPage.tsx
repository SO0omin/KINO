import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ratingImages, { type AgeRatingType } from "../utils/getRatingImage";
import axios from 'axios';

// 영화 데이터 타입 정의
interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  description: string;
  releaseDate: string;
  bookingRate: number; // 예매율
  ageRating: string;   // 관람등급 (ALL, 12, 15, 19)
}

export default function MovieListPage() {
  const navigate = useNavigate();
  // 탭 상태: 'ALL'(전체 영화) or 'UPCOMING'(상영 예정작)
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING'>('ALL');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 탭이 바뀔 때마다 백엔드 API 호출
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        // 백엔드 API 호출 (탭 상태에 따라 쿼리 파라미터 다르게)
        const response = await axios.get(`/api/movies`, {
          params: { type: activeTab }
        });
        setMovies(response.data);
      } catch (error) {
        console.error('영화 목록을 불러오는데 실패했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab]);

  return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">영화</h1>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-300 mb-8">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`py-3 px-6 text-lg font-bold transition-colors ${
              activeTab === 'ALL' 
                ? 'border-b-2 border-[#eb4d32] text-[#eb4d32]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            전체 영화
          </button>
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`py-3 px-6 text-lg font-bold transition-colors ${
              activeTab === 'UPCOMING' 
                ? 'border-b-2 border-[#eb4d32] text-[#eb4d32]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            상영 예정작
          </button>
        </div>

        {/* 영화 그리드 영역 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 font-bold">영화를 불러오는 중입니다...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie, index) => (
              <div key={movie.id} className="flex flex-col group">
                {/* 포스터 영역 (호버 시 예매 버튼 등장) */}
                <div className="relative overflow-hidden rounded-lg shadow-md aspect-[2/3] mb-4">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* 순위 뱃지 (전체 영화 탭일 때만) */}
                  {activeTab === 'ALL' && (
                    <div className="absolute top-0 left-0 bg-[#eb4d32] text-white font-bold text-xl px-4 py-2 opacity-90 rounded-br-lg">
                      {index + 1}
                    </div>
                  )}
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {/* <button 
                      onClick={() => navigate(`/movies/${movie.id}`)}
                      className="bg-transparent border-2 border-white text-white font-bold py-2 px-6 rounded hover:bg-white hover:text-black transition-colors"
                    >
                      상세보기
                    </button>
                    {activeTab === 'ALL' && (
                      <button 
                        onClick={() => navigate('/ticketing')}
                        className="bg-[#eb4d32] text-white font-bold py-2 px-6 rounded ml-2 hover:bg-[#d4452d] transition-colors"
                      >
                        예매하기
                      </button>
                    )} */}
                    <div className="text-white p-2">
                      {movie.description}
                    </div>
                  </div>
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
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>예매율 {movie.bookingRate}%</span>
                  <span>{movie.releaseDate} 개봉</span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}