import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- 타입 정의 ---
interface Movie { id: number; title: string; }
interface Region { id: number | string; name: string; }
interface Theater { id: number | string; name: string; regionId: number | string; address: string; }
interface ScreeningDetail {
  screeningId: number; screenName: string; screenType: string;
  startTime: string; endTime: string; totalSeats: number;
  remainingSeats: number; isMorning: boolean; isNight: boolean;
}
interface ResponseByTheater {
  movieId: number; movieTitle: string; ageRating: string;
  durationMin: number; screenings: ScreeningDetail[];
}
interface ResponseByMovie {
  theaterId: number; theaterName: string; screenings: ScreeningDetail[];
}

export default function TimetablePage() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'theater' | 'movie'>('theater');
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [theaterList, setTheaterList] = useState<Theater[]>([]);
  
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | string | null>(null);
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateStartIndex, setDateStartIndex] = useState(0); 
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [timetableByTheater, setTimetableByTheater] = useState<ResponseByTheater[]>([]);
  const [timetableByMovie, setTimetableByMovie] = useState<ResponseByMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);

  // --- 날짜 생성 (useMemo로 안정화) ---
  const allDates = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0); // 시간 초기화
      d.setDate(d.getDate() + i); 
      return d;
    });
  }, []);

  const visibleDates = useMemo(() => {
    return allDates.slice(dateStartIndex, dateStartIndex + 8); // 7~8개 표시
  }, [allDates, dateStartIndex]);

  const formatYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (iso: string) => {
    const timeStr = iso.includes('T') ? iso.split('T')[1] : iso;
    return timeStr.substring(0, 5);
  };

  const handlePrevDates = () => { if (dateStartIndex > 0) setDateStartIndex(prev => prev - 1); };
  const handleNextDates = () => { if (dateStartIndex < allDates.length - 8) setDateStartIndex(prev => prev + 1); };
  
  const handleDateChangeFromPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      newDate.setHours(0,0,0,0);
      setSelectedDate(newDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffTime = newDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDateStartIndex(Math.max(0, Math.min(diffDays, allDates.length - 8)));
    }
  };

  const getDayName = (date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const isSameDate = (d1: Date, d2: Date) => formatYYYYMMDD(d1) === formatYYYYMMDD(d2);

  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case 'ALL': return 'bg-green-500 text-white';
      case '12': return 'bg-blue-500 text-white';
      case '15': return 'bg-yellow-500 text-white';
      case '19': return 'bg-red-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchInitialLists = async () => {
      try {
        const [mRes, rRes, tRes] = await Promise.all([
          fetch('/api/movies'), fetch('/api/theaters/regions'), fetch('/api/theaters')
        ]);
        if (mRes.ok && rRes.ok && tRes.ok) {
          const movies = await mRes.json();
          const regions = await rRes.json();
          const theaters = await tRes.json();
          setMovieList(movies); setRegionList(regions); setTheaterList(theaters);
          
          if (regions.length > 0) {
            const seoul = regions.find((r: any) => r.name.includes('서울')) || regions[0];
            setSelectedRegionId(seoul.id);
            const tInR = theaters.filter((t: any) => String(t.regionId) === String(seoul.id));
            if (tInR.length > 0) setSelectedTheaterId(tInR[0].id);
          }
          if (movies.length > 0) setSelectedMovieId(movies[0].id);
        }
      } catch (err) { console.error(err); }
    };
    fetchInitialLists();
  }, []);

  // 시간표 API 호출
  useEffect(() => {
    const fetchTimetable = async () => {
      if ((activeTab === 'theater' && !selectedTheaterId) || (activeTab === 'movie' && !selectedMovieId)) return;
      setIsLoading(true);
      const dateString = formatYYYYMMDD(selectedDate);
      try {
        const url = activeTab === 'theater' 
          ? `/api/timetable/theater?theaterId=${selectedTheaterId}&date=${dateString}`
          : `/api/timetable/movie?movieId=${selectedMovieId}&date=${dateString}`;
        const res = await fetch(url);
        const data = await res.json();
        activeTab === 'theater' ? setTimetableByTheater(data) : setTimetableByMovie(data);
      } catch (err) { setError("시간표를 불러오지 못했습니다."); }
      finally { setIsLoading(false); }
    };
    fetchTimetable();
  }, [activeTab, selectedTheaterId, selectedMovieId, selectedDate]);

  const renderScreeningBoxes = (screenings: ScreeningDetail[], currentMovieId: number, currentTheaterId: number | string) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {screenings.map((sc) => {
        const isSoldOut = sc.remainingSeats === 0;
        return (
          <button
            key={sc.screeningId}
            disabled={isSoldOut}
            className={`flex flex-col p-3 border rounded-lg text-left transition-all ${
              isSoldOut ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-[#eb4d32] hover:shadow-md'
            }`}
            onClick={() => navigate('/ticketing', {
              state: {
                movieId: currentMovieId, theaterId: currentTheaterId,
                regionId: activeTab === 'theater' ? selectedRegionId : theaterList.find(t => String(t.id) === String(currentTheaterId))?.regionId,
                selectedDate: formatYYYYMMDD(selectedDate)
              }
            })}
          >
            <div className="text-[10px] text-gray-400 mb-1">{sc.screenName} | {sc.screenType}</div>
            <div className="flex items-center gap-2 mb-1 font-bold text-gray-800">
              {formatTime(sc.startTime)}
              {sc.isMorning && <Sun size={12} className="text-orange-400" />}
              {sc.isNight && <Moon size={12} className="text-indigo-400" />}
            </div>
            <div className="flex justify-between items-center w-full mt-1 text-[11px] font-bold">
              <span className="text-gray-400">~{formatTime(sc.endTime)}</span>
              <span className={sc.remainingSeats < 10 && !isSoldOut ? 'text-red-500' : 'text-[#eb4d32]'}>{sc.remainingSeats}석</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf4e3] pt-12 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">상영시간표</h1>
          <p className="text-gray-600">관람하실 영화와 시간을 선택해주세요.</p>
        </div>

        {/* 탭 버튼 */}
        <div className="flex w-full mb-8 bg-white rounded-t-xl overflow-hidden shadow-sm">
          {['theater', 'movie'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`flex-1 py-4 text-lg font-bold transition-all border-b-4 ${
                activeTab === t ? 'border-[#eb4d32] text-[#eb4d32]' : 'border-transparent text-gray-400 bg-gray-50'
              }`}
            >
              {t === 'theater' ? '극장별' : '영화별'}
            </button>
          ))}
        </div>

        {/* 필터 카드 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          {activeTab === 'movie' ? (
            <div className="flex gap-2 flex-wrap">
              {movieList.map(m => (
                <button key={m.id} onClick={() => setSelectedMovieId(m.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedMovieId === m.id ? 'bg-[#eb4d32] text-white border-[#eb4d32]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#eb4d32]'
                  }`}>{m.title}</button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 border-b border-gray-100 pb-3 overflow-x-auto scrollbar-hide">
                {regionList.map(r => (
                  <button key={r.id} onClick={() => {
                    setSelectedRegionId(r.id);
                    const tInR = theaterList.filter(t => String(t.regionId) === String(r.id));
                    if (tInR.length > 0) setSelectedTheaterId(tInR[0].id);
                  }}
                  className={`text-sm font-bold whitespace-nowrap transition-colors ${String(selectedRegionId) === String(r.id) ? 'text-[#eb4d32]' : 'text-gray-400'}`}>{r.name}</button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {theaterList.filter(t => String(t.regionId) === String(selectedRegionId)).map(t => (
                  <button key={t.id} onClick={() => setSelectedTheaterId(t.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${String(selectedTheaterId) === String(t.id) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>{t.name}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🗓️ 날짜 선택 섹션 (보정된 레이아웃) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8 flex items-center">
          <button onClick={handlePrevDates} disabled={dateStartIndex === 0} className="p-2 text-gray-400 hover:text-[#eb4d32] disabled:opacity-20 shrink-0">
            <ChevronLeft size={28} />
          </button>
          
          <div className="flex-1 flex gap-3 justify-center items-center overflow-hidden px-4">
            {visibleDates.map((d, idx) => {
              const isSelected = isSameDate(d, selectedDate);
              const dayName = getDayName(d);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center justify-center min-w-[55px] py-3 rounded-xl transition-all ${
                    isSelected ? 'bg-[#eb4d32] text-white shadow-md' : 'hover:bg-orange-50 text-gray-700'
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-80 mb-1">{d.getMonth() + 1}/{dayName}</span>
                  <span className="text-xl font-black">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-l pl-4 shrink-0">
            <button onClick={() => dateInputRef.current?.showPicker()} className="p-2 text-gray-500 hover:text-[#eb4d32]">
              <Calendar size={24} />
            </button>
            <input type="date" ref={dateInputRef} onChange={handleDateChangeFromPicker} className="absolute opacity-0 pointer-events-none w-0 h-0" />
            <button onClick={handleNextDates} disabled={dateStartIndex >= allDates.length - 8} className="p-2 text-gray-400 hover:text-[#eb4d32] disabled:opacity-20">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>

        {/* 시간표 목록 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">일정을 불러오고 있습니다...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {(activeTab === 'theater' ? timetableByTheater : timetableByMovie).map((item: any) => (
              <div key={item.movieId || item.theaterId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                  {item.ageRating && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getAgeRatingColor(item.ageRating)}`}>
                      {item.ageRating === 'ALL' ? '전체' : item.ageRating}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">{item.movieTitle || item.theaterName}</h3>
                  {item.durationMin && <span className="text-sm text-gray-400">{item.durationMin}분</span>}
                </div>
                {renderScreeningBoxes(item.screenings, item.movieId || selectedMovieId, item.theaterId || selectedTheaterId!)}
              </div>
            ))}
            {(activeTab === 'theater' ? timetableByTheater : timetableByMovie).length === 0 && (
              <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">상영 일정이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}