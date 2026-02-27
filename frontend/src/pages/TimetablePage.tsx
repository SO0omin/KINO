import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- 타입 정의 ---
interface Movie {
  id: number;
  title: string;
}

interface Region {
  id: number;
  name: string;
}

interface Theater {
  id: number;
  name: string;
  regionId: number;
  address: string;
}

interface ScreeningDetail {
  screeningId: number;
  screenName: string;
  screenType: string;
  startTime: string; 
  endTime: string;
  totalSeats: number;
  remainingSeats: number;
  isMorning: boolean;
  isNight: boolean;
}

// 극장별 탭 응답 타입
interface ResponseByTheater {
  movieId: number;
  movieTitle: string;
  ageRating: string;
  durationMin: number;
  screenings: ScreeningDetail[];
}

// 영화별 탭 응답 타입
interface ResponseByMovie {
  theaterId: number;
  theaterName: string;
  screenings: ScreeningDetail[];
}

export default function TimetablePage() {
  const navigate = useNavigate();
  // 1. 탭 및 선택 상태 관리
  const [activeTab, setActiveTab] = useState<'theater' | 'movie'>('theater');
  
  // 버튼 생성을 위한 기본 리스트 (초기 로딩 시 API로 받아와야 함)
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [theaterList, setTheaterList] = useState<Theater[]>([]);
  
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
 const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null);

  // 2. 날짜 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateStartIndex, setDateStartIndex] = useState(0); 
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 3. 시간표 데이터 상태 관리
  const [timetableByTheater, setTimetableByTheater] = useState<ResponseByTheater[]>([]);
  const [timetableByMovie, setTimetableByMovie] = useState<ResponseByMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- 날짜 포맷터 및 생성 ---
  const formatYYYYMMDD = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  const allDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i); 
    return d;
  });
  const visibleDates = allDates.slice(dateStartIndex, dateStartIndex + 7);

  const handlePrevDates = () => { if (dateStartIndex > 0) setDateStartIndex(prev => prev - 1); };
  const handleNextDates = () => { if (dateStartIndex < allDates.length - 7) setDateStartIndex(prev => prev + 1); };
  const handleDateChangeFromPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      const diffTime = Math.abs(newDate.getTime() - new Date().getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDateStartIndex(Math.max(0, Math.min(diffDays, allDates.length - 7)));
    }
  };

  const getDayName = (date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const isSameDate = (d1: Date, d2: Date) => formatYYYYMMDD(d1) === formatYYYYMMDD(d2);

  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case 'ALL': return 'bg-green-500';
      case '12': return 'bg-blue-500';
      case '15': return 'bg-yellow-500';
      case '19': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  // --- 초기 데이터 로딩 (영화 목록, 극장 목록) ---
  useEffect(() => {
    // 백엔드에 전체 영화 목록과 극장 목록을 가져오는 API가 있다고 가정합니다.
    // (이 부분은 작성하신 백엔드 환경에 맞게 경로를 수정해 주세요)
    const fetchInitialLists = async () => {
      try {
        const [moviesRes, regionsRes, theatersRes] = await Promise.all([
          fetch('/api/movies'),   // 영화 리스트 반환 API
          fetch('/api/regions'),     // 기존 전체 지역 API
          fetch('/api/theaters')     // 기존 전체 극장 API
        ]);
        
        if (moviesRes.ok && regionsRes.ok && theatersRes.ok) {
          const movies = await moviesRes.json();
          const regions = await regionsRes.json();
          const theaters = await theatersRes.json();
          
          setMovieList(movies);
          setRegionList(regions);
          setTheaterList(theaters);
          
          // 초기 선택값 세팅
          if (regions.length > 0) {
            setSelectedRegionId(regions[0].id);
            // 첫 번째 지역에 속한 극장들 중 첫 번째 극장을 선택
            const firstRegionTheaters = theaters.filter((t: Theater) => t.regionId === regions[0].id);
            if (firstRegionTheaters.length > 0) {
              setSelectedTheaterId(firstRegionTheaters[0].id);
            }
          }
        }
      } catch (err) {
        console.error("초기 목록 로딩 실패", err);
      }
    };
    fetchInitialLists();
  }, []);

  // --- 상영시간표 API 호출 (조건 변경 시마다 실행) ---
  useEffect(() => {
    const fetchTimetable = async () => {
      // 필요한 ID가 세팅되지 않았다면 호출하지 않음
      if (activeTab === 'theater' && !selectedTheaterId) return;
      if (activeTab === 'movie' && !selectedMovieId) return;

      setIsLoading(true);
      setError(null);
      const dateString = formatYYYYMMDD(selectedDate);

      try {
        let response;
        if (activeTab === 'theater') {
          // 1. 극장별 조회
          response = await fetch(`/api/timetable/theater?theaterId=${selectedTheaterId}&date=${dateString}`);
          if (!response.ok) throw new Error('극장별 시간표 로딩 실패');
          const data = await response.json();
          setTimetableByTheater(data);
        } else {
          // 2. 영화별 조회
          response = await fetch(`/api/timetable/movie?movieId=${selectedMovieId}&date=${dateString}`);
          if (!response.ok) throw new Error('영화별 시간표 로딩 실패');
          const data = await response.json();
          setTimetableByMovie(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [activeTab, selectedTheaterId, selectedMovieId, selectedDate]);

  // 동적 타이틀
  const getDynamicTitle = () => {
    if (activeTab === 'movie') {
      const movie = movieList.find(m => m.id === selectedMovieId);
      return movie ? `${movie.title} 상영시간표` : '영화 상영시간표';
    } else {
      const theater = theaterList.find(t => t.id === selectedTheaterId);
      return theater ? `${theater.name} 상영시간표` : '극장 상영시간표';
    }
  };

  // 공통 상영일정 박스 렌더링 함수
  const renderScreeningBoxes = (screenings: ScreeningDetail[],currentMovieId: number, currentTheaterId: number) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {screenings.map((sc) => {
          const isSoldOut = sc.remainingSeats === 0;
          return (
            <button
              key={sc.screeningId}
              disabled={isSoldOut}
              className={`group relative flex flex-col p-3 border rounded-md text-left transition-all ${
                isSoldOut 
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
                  : 'bg-white border-gray-300 hover:border-purple-600 hover:shadow-md'
              }`}
              onClick={() => {
                const rId = activeTab === 'theater' 
                ? selectedRegionId 
                : theaterList.find(t => t.id === currentTheaterId)?.regionId;
                navigate('/ticketing', {
                  state: {
                    movieId: currentMovieId,
                    theaterId: currentTheaterId,
                    regionId: rId
                  }
                });
              }}
            >
              <div className="text-[11px] text-gray-500 mb-2 group-hover:text-purple-600 transition-colors">
                {sc.screenName} | {sc.screenType}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-gray-800 group-hover:text-purple-700">
                  {formatTime(sc.startTime)}
                </span>
                {sc.isMorning && <span title="조조" className="flex items-center"><Sun size={14} className="text-orange-500" /></span>}
                {sc.isNight && <span title="심야" className="flex items-center"><Moon size={14} className="text-blue-500" /></span>}
              </div>
              <div className="flex justify-between items-center w-full mt-auto">
                <span className="text-[11px] text-gray-400">~{formatTime(sc.endTime)}</span>
                <div className="text-xs">
                  <span className={sc.remainingSeats < 10 && !isSoldOut ? 'text-red-500 font-bold' : 'text-green-600'}>
                    {sc.remainingSeats}석
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:py-10 text-gray-800 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">상영시간표</h2>

      {/* 1. 메인 탭 */}
      <div className="flex border-b border-gray-300 mb-6">
        {[
          { id: 'theater', label: '극장별' },
          { id: 'movie', label: '영화별' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 text-center text-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-purple-600 text-purple-700' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. 네모 박스 선택 영역 */}
      <div className="border border-gray-300 rounded-lg p-6 mb-10 bg-gray-50 min-h-[120px] flex items-center">
        {activeTab === 'movie' && (
          <div className="flex gap-4 flex-wrap">
            {movieList.map(movie => (
              <button
                key={movie.id}
                onClick={() => setSelectedMovieId(movie.id)}
                className={`px-4 py-2 border rounded-full transition-all ${
                  selectedMovieId === movie.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 hover:border-purple-400'
                }`}
              >
                {movie.title}
              </button>
            ))}
          </div>
        )}
        
        {activeTab === 'theater' && (
          <div className="flex flex-col w-full">
            
            {/* 1 Depth: 지역 탭 (서울(8) 등) */}
            <div className="flex border-b border-gray-200 mb-4 w-full overflow-x-auto scrollbar-hide">
              {regionList.map(region => {
                // ✨ 프론트엔드에서 현재 지역에 속한 극장 개수를 직접 셉니다!
                const theaterCountInRegion = theaterList.filter(t => t.regionId === region.id).length;

                return (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelectedRegionId(region.id);
                      // 지역 변경 시 해당 지역의 첫 번째 극장으로 자동 포커스
                      const theatersInRegion = theaterList.filter(t => t.regionId === region.id);
                      if (theatersInRegion.length > 0) {
                        setSelectedTheaterId(theatersInRegion[0].id);
                      }
                    }}
                    className={`py-3 px-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                      selectedRegionId === region.id
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {region.name}({theaterCountInRegion})
                  </button>
                );
              })}
            </div>

            {/* 2 Depth: 선택된 지역의 극장 버튼들 */}
            <div className="flex gap-2 flex-wrap">
              {/* ✨ 전체 극장 목록에서 현재 선택된 지역ID와 일치하는 극장만 필터링해서 보여줍니다! */}
              {theaterList
                .filter(theater => theater.regionId === selectedRegionId)
                .map(theater => (
                  <button
                    key={theater.id}
                    onClick={() => setSelectedTheaterId(theater.id)}
                    className={`px-4 py-2 text-sm border rounded-full transition-all ${
                      selectedTheaterId === theater.id
                        ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {theater.name}
                  </button>
              ))}
            </div>
            
          </div>
        )}
      </div>

      {/* 3. 동적 타이틀 */}
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {getDynamicTitle()}
      </h3>

      {/* 4. 날짜 슬라이더 */}
      <div className="flex items-center justify-center gap-2 mb-10 border-y border-gray-200 py-3 relative">
        <button onClick={handlePrevDates} disabled={dateStartIndex === 0} className="p-1 text-gray-500 hover:text-purple-600 disabled:opacity-30">
          <ChevronLeft size={28} />
        </button>
        <div className="flex gap-2 mx-4 overflow-hidden">
          {visibleDates.map((d, idx) => {
            const isSelected = isSameDate(d, selectedDate);
            const dayName = getDayName(d);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center justify-center w-14 h-16 rounded-lg transition-all ${
                  isSelected ? 'bg-purple-100 border border-purple-500 shadow-sm' : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <span className={`text-[11px] mb-1 font-medium ${dayName === '토' ? 'text-blue-500' : dayName === '일' ? 'text-red-500' : 'text-gray-500'}`}>
                  {d.getMonth() + 1}월
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-xl font-bold ${isSelected ? 'text-purple-700' : dayName === '토' ? 'text-blue-600' : dayName === '일' ? 'text-red-600' : 'text-gray-800'}`}>
                    {d.getDate()}
                  </span>
                  <span className={`text-xs ${isSelected ? 'text-purple-700' : dayName === '토' ? 'text-blue-600' : dayName === '일' ? 'text-red-600' : 'text-gray-800'}`}>
                    •{dayName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={handleNextDates} disabled={dateStartIndex >= allDates.length - 7} className="p-1 text-gray-500 hover:text-purple-600 disabled:opacity-30">
          <ChevronRight size={28} />
        </button>
        <div className="relative ml-4 flex items-center border-l pl-4 border-gray-300">
          <button onClick={() => dateInputRef.current?.showPicker()} className="p-2 text-gray-500 hover:text-purple-600" title="날짜 선택">
            <Calendar size={24} />
          </button>
          <input type="date" ref={dateInputRef} onChange={handleDateChangeFromPicker} className="absolute opacity-0 w-0 h-0 pointer-events-none" />
        </div>
      </div>

      {/* 5. 하단 상영시간표 렌더링 영역 */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse">상영 일정을 불러오는 중입니다...</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">{error}</div>
      ) : activeTab === 'theater' && timetableByTheater.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">해당 날짜에 상영 일정이 없습니다.</div>
      ) : activeTab === 'movie' && timetableByMovie.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">해당 날짜에 상영 일정이 없습니다.</div>
      ) : (
        <div className="space-y-12">
          {/* 극장별 탭 화면 (영화를 기준으로 나열) */}
          {activeTab === 'theater' && timetableByTheater.map((movie) => (
            <div key={movie.movieId} className="border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAgeRatingColor(movie.ageRating)}`}>
                  {movie.ageRating === 'ALL' ? '전체' : movie.ageRating}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{movie.movieTitle}</h3>
                <span className="text-sm text-gray-500 ml-2">상영시간 {movie.durationMin}분</span>
              </div>
              {renderScreeningBoxes(movie.screenings,movie.movieId, selectedTheaterId!)}
            </div>
          ))}

          {/* 영화별 탭 화면 (극장을 기준으로 나열) */}
          {activeTab === 'movie' && timetableByMovie.map((theater) => (
            <div key={theater.theaterId} className="border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">{theater.theaterName}</h3>
              </div>
              {renderScreeningBoxes(theater.screenings, selectedMovieId!, theater.theaterId)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}