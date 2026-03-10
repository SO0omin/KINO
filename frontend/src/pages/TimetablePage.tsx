import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sun, Moon, Clock, Film, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ratingImages, { type AgeRatingType } from '../utils/getRatingImage';

// --- 타입 정의 (원본 유지) ---
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
  
  // --- 상태 관리 (원본 로직 유지) ---
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

  // --- 모던 스타일 정의 ---
  const modernStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    .font-display { font-family: 'Anton', sans-serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `;

  // --- 날짜 로직 (원본 유지) ---
  const allDates = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i); 
      return d;
    });
  }, []);

  const visibleDates = useMemo(() => {
    return allDates.slice(dateStartIndex, dateStartIndex + 10); // 10개 표시로 확장
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
  const handleNextDates = () => { if (dateStartIndex < allDates.length - 10) setDateStartIndex(prev => prev + 1); };
  
  const handleDateChangeFromPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      newDate.setHours(0,0,0,0);
      setSelectedDate(newDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffTime = newDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDateStartIndex(Math.max(0, Math.min(diffDays, allDates.length - 10)));
    }
  };

  const getDayName = (date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const isSameDate = (d1: Date, d2: Date) => formatYYYYMMDD(d1) === formatYYYYMMDD(d2);

  const toAgeRatingType = (rating?: string): AgeRatingType => {
    if (!rating) return 'ALL';
    const normalized = String(rating).toUpperCase();
    if (normalized === 'ALL') return 'ALL';
    if (normalized === '12' || normalized === 'AGE_12') return 'AGE_12';
    if (normalized === '15' || normalized === 'AGE_15') return 'AGE_15';
    if (normalized === '18' || normalized === '19' || normalized === 'AGE_18' || normalized === 'AGE_19') return 'AGE_18';
    return 'ALL';
  };

  // --- API 호출 (원본 로직 유지) ---
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
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchTimetable();
  }, [activeTab, selectedTheaterId, selectedMovieId, selectedDate]);

  // --- 렌더링: 상영 시간 박스 ---
  const renderScreeningBoxes = (screenings: ScreeningDetail[], currentMovieId: number, currentTheaterId: number | string) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {screenings.map((sc) => {
        const isSoldOut = sc.remainingSeats === 0;
        return (
          <button
            key={sc.screeningId}
            disabled={isSoldOut}
            className={`group relative flex flex-col p-5 border rounded-sm text-left transition-all duration-300 ${
              isSoldOut 
                ? 'bg-black/5 border-black/5 opacity-40 cursor-not-allowed grayscale' 
                : 'bg-white border-black/5 hover:border-[#B91C1C]/30 hover:shadow-xl'
            }`}
            onClick={() => navigate('/ticketing', {
              state: {
                movieId: currentMovieId, theaterId: currentTheaterId,
                regionId: activeTab === 'theater' ? selectedRegionId : theaterList.find(t => String(t.id) === String(currentTheaterId))?.regionId,
                selectedDate: formatYYYYMMDD(selectedDate)
              }
            })}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/20 mb-3">{sc.screenName} | {sc.screenType}</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display text-3xl group-hover:text-[#B91C1C] transition-colors">{formatTime(sc.startTime)}</span>
              {sc.isMorning && <Sun size={14} className="text-[#B91C1C]/40" />}
              {sc.isNight && <Moon size={14} className="text-black/20" />}
            </div>
            <div className="flex justify-between items-end w-full mt-2 pt-3 border-t border-black/5">
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-tighter">~{formatTime(sc.endTime)}</span>
              <div className="text-[10px] font-bold">
                <span className={sc.remainingSeats < 10 && !isSoldOut ? 'text-[#B91C1C]' : 'text-black/40'}>{sc.remainingSeats}석</span>
                <span className="text-black/10 font-normal"> / {sc.totalSeats}</span>
              </div>
            </div>
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold border border-white px-2 py-1 uppercase tracking-widest font-sans">매진</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      
      {/* 1. 헤더 영역 (AI 스튜디오 디자인) */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-mono text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Daily Manifest</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-4xl md:text-4xl uppercase tracking-tighter leading-none">
              상영 <span className="text-white/20">시간표</span>
            </h1>
            <p className="text-white/20">관람하실 영화와 시간을 선택해주세요.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        
        {/* 2. 탭 버튼 (디자인 변경) */}
        <div className="flex w-full mb-16 bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl">
          {['theater', 'movie'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`flex-1 py-6 text-xs font-bold uppercase tracking-[0.4em] transition-all ${
                activeTab === t ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5 text-black/40'
              }`}
            >
              {t === 'theater' ? '극장별' : '영화별'}
            </button>
          ))}
        </div>

        {/* 3. 필터 섹션 (모던 스타일) */}
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl mb-16">
          {activeTab === 'movie' ? (
            <div className="max-h-48 overflow-y-auto scrollbar-hide">
              <div className="flex gap-3 flex-wrap p-1">
                {movieList.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMovieId(m.id)}
                    className={`px-6 py-3 rounded-sm text-[11px] font-bold border transition-all ${
                      selectedMovieId === m.id 
                        ? 'bg-[#B91C1C] text-white border-[#B91C1C] shadow-lg scale-105' 
                        : 'bg-white text-black/40 border-black/5 hover:border-[#B91C1C] hover:text-black'
                    }`}
                  >
                    {m.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex gap-8 border-b border-black/5 pb-4 overflow-x-auto scrollbar-hide font-sans">
                {regionList.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => {
                      setSelectedRegionId(r.id);
                      const tInR = theaterList.filter(t => String(t.regionId) === String(r.id));
                      if (tInR.length > 0) setSelectedTheaterId(tInR[0].id);
                    }}
                    className={`text-[12px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                      String(selectedRegionId) === String(r.id) ? 'text-[#B91C1C]' : 'text-black/20 hover:text-black'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <div className="max-h-32 overflow-y-auto scrollbar-hide">
                <div className="flex gap-3 flex-wrap p-1">
                  {theaterList.filter(t => String(t.regionId) === String(selectedRegionId)).map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setSelectedTheaterId(t.id)}
                      className={`px-6 py-3 rounded-sm text-[11px] font-bold border transition-all ${
                        String(selectedTheaterId) === String(t.id) 
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg scale-105' 
                          : 'bg-white text-black/40 border-black/5 hover:border-[#B91C1C] hover:text-black'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. 날짜 선택 섹션 (모던 슬라이더 스타일) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs font-sans">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>날짜 선택</span>
            </div>
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors font-sans"
            >
              <Calendar size={16} />
              <span>달력 보기</span>
              <input ref={dateInputRef} type="date" className="absolute opacity-0 pointer-events-none" onChange={handleDateChangeFromPicker} />
            </button>
          </div>

          <div className="relative flex items-center bg-[#FDFDFD] border border-black/5 rounded-sm p-2 shadow-xl">
            <button 
              onClick={handlePrevDates} 
              disabled={dateStartIndex === 0} 
              className="p-4 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex-1 flex items-center justify-between px-4 overflow-hidden">
              {visibleDates.map((d, idx) => {
                const isSelected = isSameDate(d, selectedDate);
                const dayName = getDayName(d);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center justify-center min-w-[90px] py-6 rounded-sm transition-all ${
                      isSelected 
                        ? 'bg-[#B91C1C] text-white shadow-lg scale-105 z-10' 
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <span className="text-3xl font-display leading-none mb-1">{d.getDate()}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-40 font-sans">{dayName}</span>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleNextDates} 
              disabled={dateStartIndex >= allDates.length - 10} 
              className="p-4 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* 5. 상영시간표 목록 (모던 카드 스타일) */}
        {isLoading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-20">
            <div className="w-16 h-16 border-2 border-dashed border-black rounded-full animate-spin"></div>
            <p className="font-display text-2xl uppercase tracking-tight">Synchronizing Archive...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {(activeTab === 'theater' ? timetableByTheater : timetableByMovie).map((item: any) => (
              <div key={item.movieId || item.theaterId} className="bg-[#FDFDFD] border border-black/5 rounded-sm p-10 shadow-xl">
                <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-8">
                  <div className="flex items-center gap-6">
                    <img
                      src={ratingImages[toAgeRatingType(item.ageRating)]}
                      alt={item.ageRating}
                      className="w-10 h-10 object-contain"
                    />
                    <div className="space-y-1">
                      <h3 className="font-display text-4xl uppercase tracking-tight text-[#1A1A1A]">{item.movieTitle || item.theaterName}</h3>
                      {item.durationMin && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 font-sans">
                          <Clock size={12} />
                          <span>{item.durationMin}분</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-3 text-[#B91C1C] opacity-20">
                    <Film size={32} />
                  </div>
                </div>
                {renderScreeningBoxes(item.screenings, item.movieId || selectedMovieId!, item.theaterId || selectedTheaterId!)}
              </div>
            ))}
            {(activeTab === 'theater' ? timetableByTheater : timetableByMovie).length === 0 && (
              <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                <div className="w-24 h-24 border-2 border-dashed border-black rounded-full flex items-center justify-center">
                  <Clock size={40} />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl uppercase tracking-tight">상영 일정이 없습니다</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] max-w-[200px] leading-relaxed font-sans">날짜를 변경하거나 다른 극장을 선택해보세요</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}