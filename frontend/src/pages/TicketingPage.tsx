import React, { useState, useEffect } from 'react';
import { ticketingApi } from '../api/ticketingApi';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';

const TicketingPage: React.FC = () => {
  // --- 상태 관리 (States) ---
  const [regions, setRegions] = useState<Region[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedTheaters, setSelectedTheaters] = useState<number[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- 초기 데이터 로드 ---
  useEffect(() => {
    ticketingApi.getRegions().then(res => setRegions(res.data));
    ticketingApi.getMovies().then(res => setMovies(res.data));
  }, []);

  // 지역 선택 시 영화관 로드
  useEffect(() => {
    if (selectedRegionId) {
      ticketingApi.getTheaters(selectedRegionId).then(res => setTheaters(res.data));
    }
  }, [selectedRegionId]);

  // 필터 변경 시 시간표 로드
  useEffect(() => {
    console.log("현재 선택된 정보:", { selectedTheaters, selectedMovies });
    if (selectedTheaters.length > 0 && selectedMovies.length > 0) {
      ticketingApi.getScreenings(selectedTheaters, selectedMovies, selectedDate)
        .then(res => setScreenings(res.data));
    }
  }, [selectedTheaters, selectedMovies, selectedDate]);

  // --- 핸들러 (최대 개수 제한 로직) ---
  const toggleTheater = (id: number) => {
    console.log("선택된 영화관 ID:", id);
    if (selectedTheaters.includes(id)) {
      setSelectedTheaters(selectedTheaters.filter(tId => tId !== id));
    } else if (selectedTheaters.length < 4) {
      setSelectedTheaters([...selectedTheaters, id]);
    } else {
      alert("영화관은 최대 4개까지 선택 가능합니다.");
    }
  };

  const toggleMovie = (id: number) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter(mId => mId !== id));
    } else if (selectedMovies.length < 3) {
      setSelectedMovies([...selectedMovies, id]);
    } else {
      alert("영화는 최대 3개까지 선택 가능합니다.");
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-0 border border-gray-300 h-[600px] bg-white">
        
        {/* 1. 영화관 선택 섹션 */}
        <div className="border-r border-gray-300 flex flex-col">
          <div className="bg-gray-800 text-white p-2 text-center font-bold">THEATER</div>
          <div className="flex h-full">
            <div className="w-1/2 border-r overflow-y-auto">
              {regions.map(r => (
                <div key={r.id} onClick={() => setSelectedRegionId(r.id)} 
                     className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedRegionId === r.id ? 'bg-gray-200' : ''}`}>
                  {r.name}
                </div>
              ))}
            </div>
            <div className="w-1/2 overflow-y-auto">
              {theaters.map(t => (
                <div key={t.id} onClick={() => toggleTheater(t.id)}
                     className={`p-3 cursor-pointer ${selectedTheaters.includes(t.id) ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
                     style={{
        backgroundColor: selectedTheaters.includes(t.id) ? '#ff4d4f' : 'transparent',
        color: selectedTheaters.includes(t.id) ? 'white' : 'black',
        borderBottom: '1px solid #eee'
      }}>
                  
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 영화 선택 섹션 */}
        <div className="border-r border-gray-300">
          <div className="bg-gray-800 text-white p-2 text-center font-bold">MOVIE</div>
          <div className="overflow-y-auto h-[550px]">
            {movies.map(m => (
              <div key={m.id} onClick={() => toggleMovie(m.id)}
                   className={`p-3 border-b cursor-pointer ${selectedMovies.includes(m.id) ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}>
                <span className="text-xs border px-1 mr-2">{m.ageRating}</span>
                {m.title}
              </div>
            ))}
          </div>
        </div>

        {/* 3. 날짜 선택 섹션 */}
        <div className="border-r border-gray-300">
          <div className="bg-gray-800 text-white p-2 text-center font-bold">DATE</div>
          <div className="p-4 text-center">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border p-2 rounded" />
          </div>
        </div>

        {/* 4. 시간표 결과 섹션 */}
        <div className="bg-gray-50 overflow-y-auto">
          <div className="bg-gray-800 text-white p-2 text-center font-bold">TIME</div>
          {screenings.map(s => (
            <div key={s.id} className="p-4 border-b hover:bg-white cursor-pointer" onClick={() => alert(`${s.id}번 상영 모달 열기`)}>
              <div className="font-bold text-red-600">{s.startTime.split('T')[1].substring(0, 5)}</div>
              <div className="text-sm font-semibold">{s.movieTitle}</div>
              <div className="text-xs text-gray-500">{s.screenName} | {s.availableSeats}/{s.totalSeats} 좌석</div>
            </div>
          ))}
          {screenings.length === 0 && <div className="p-10 text-center text-gray-400">조회 결과가 없습니다.</div>}
        </div>

      </div>
    </div>
  );
};

export default TicketingPage;