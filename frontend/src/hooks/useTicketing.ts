import { useState, useEffect, useMemo } from 'react';
import { ticketingApi } from '../api/ticketingApi';
import { ticketingService } from '../services/ticketingService';
import { getLocalDateString } from '../utils/dateUtils';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';
import { cinemaAlert } from '../utils/alert';

const VISIBLE_COUNT = 10;
//const VISIBLE_HOUR_COUNT = 10;

export const useTicketing = (dateList: any[], initialMovieId?: number, initialTheaterId?: number, initialRegionId?: number, initialDate?: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScreeningData, setSelectedScreeningData] = useState<Screening | null>(null);
  const [currentSeats, setCurrentSeats] = useState<any[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SPECIAL'>('ALL');
  const [specialTypes, setSpecialTypes] = useState<string[]>([]);
  const [selectedSpecialType, setSelectedSpecialType] = useState<string | null>(null);
  const [availableMovieIds, setAvailableMovieIds] = useState<number[]>([]);
  const [availableTheaterIds, setAvailableTheaterIds] = useState<number[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(initialRegionId || null);
  const [selectedMovies, setSelectedMovies] = useState<number[]>(initialMovieId ? [initialMovieId] : []);
  const [selectedTheaters, setSelectedTheaters] = useState<number[]>(initialTheaterId ? [initialTheaterId] : []);
  const [selectedTheatersInfo, setSelectedTheatersInfo] = useState<{id:number; name:string}[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>( initialDate ? initialDate : getLocalDateString(new Date()));
  const [startIndex, setStartIndex] = useState(() => {
  if (initialDate && dateList.length > 0) {
    const foundIndex = dateList.findIndex(d => d.fullDate === initialDate);
    return foundIndex !== -1 ? Math.max(0, Math.min(foundIndex, dateList.length - VISIBLE_COUNT)) : 0;
  }
  return 0;
});
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [startHourIndex, setHourStartIndex] = useState(6);

  

  useEffect(() => {
    ticketingService.getSortedRegions().then(setRegions);
    ticketingApi.getMovies().then((res) => setMovies(res.data));
    ticketingApi.getSpecialTypes().then((res) => setSpecialTypes(res.data));
  }, []);

  useEffect(() => {
    if (activeTab === 'ALL') setSelectedSpecialType(null);
    else setSelectedRegionId(null);
    setTheaters([]);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ALL' && selectedRegionId) {
      ticketingApi.getTheaters(selectedRegionId, null).then((res) => setTheaters(res.data));
    } else if (activeTab === 'SPECIAL' && selectedSpecialType) {
      ticketingApi.getTheaters(null, selectedSpecialType).then((res) => setTheaters(res.data));
    }
  }, [selectedRegionId, selectedSpecialType, activeTab]);

  useEffect(() => {
    if (selectedTheaters.length > 0 || selectedMovies.length > 0) {
      const typeFilter = activeTab === 'SPECIAL' ? 'SPECIAL' : null;
      ticketingApi.getScreenings(selectedTheaters, selectedMovies, selectedDate, typeFilter).then((res) => setScreenings(res.data));
    } else { setScreenings([]); }
  }, [selectedTheaters, selectedMovies, selectedDate, activeTab]);

  useEffect(() => {
    if (selectedTheaters.length > 0 || activeTab === 'SPECIAL') {
      let colorFilter: string | null = null;
      if (activeTab === 'SPECIAL') {
        colorFilter = selectedTheaters.length > 0 ? 'SPECIAL' : (selectedSpecialType || 'SPECIAL');
      }
      ticketingApi.getAvailableMovieIds(selectedTheaters, selectedDate, colorFilter).then((res) => setAvailableMovieIds(res.data));
    } else { setAvailableMovieIds([]); }
  }, [selectedTheaters, selectedDate, selectedSpecialType, activeTab]);

  useEffect(() => {
    if (selectedMovies.length > 0) {
      ticketingApi.getAvailableTheaterIds(selectedMovies, selectedDate).then((res) => setAvailableTheaterIds(res.data));
    } else { setAvailableTheaterIds([]); }
  }, [selectedMovies, selectedDate]);

  useEffect(() => {
    if (screenings.length > 0) {
      const hours = screenings.map(s => parseInt((s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime).substring(0, 2)));
      const minHour = Math.min(...hours);
      setSelectedHour(minHour);
      setHourStartIndex(Math.max(0, Math.min(minHour - 4, 14)));
    } else { setSelectedHour(null); }
  }, [screenings]);
  
  useEffect(() => {
        // theaters(전체 극장 목록)가 들어왔고, 넘어온 ID가 있는데, 하단 박스가 아직 비어있다면!
        if (initialTheaterId && theaters && theaters.length > 0 && selectedTheatersInfo.length === 0) {
            
            // 전체 극장 리스트에서 넘어온 ID와 일치하는 극장을 찾습니다.
            const targetTheater = theaters.find(t => t.id === initialTheaterId);

            if (targetTheater) {
                // ✅ 1. 하단 [Select Venue] 박스에 극장 이름 쏙 넣기!
                setSelectedTheatersInfo([{ id: targetTheater.id, name: targetTheater.name }]);
                
                // ✅ 2. 굳이 서울을 누르지 않아도 알아서 '서울' 탭이 열리도록 지역ID 세팅!
                if (targetTheater.regionId) {
                    setSelectedRegionId(targetTheater.regionId); 
                }
            }
        }
    }, [theaters, initialTheaterId]); // 전체 극장 리스트가 세팅될 때 발동

    // 영화 쪽도 마찬가지로 이름 세팅해 주기
    useEffect(() => {
        if (initialMovieId && movies && movies.length > 0 && selectedMovies.length === 0) {
            const targetMovie = movies.find(m => m.id === initialMovieId);
            if (targetMovie) {
                // 하단 [Select Movie] 박스에 영화 이름 쏙 넣기!
                // (이 부분은 작성해두신 상태 관리 함수명에 맞게 변경하세요)
                // 예: setSelectedMoviesInfo([{ id: targetMovie.id, title: targetMovie.title }]); 
            }
        }
    }, [movies, initialMovieId]);

  // 날짜 관련 핸들러 분리
  const onDateButtonClick = (date: string) => setSelectedDate(date);
  
  const onCalendarChange = (newDate: string) => {
    setSelectedDate(newDate);
    const newIndex = dateList.findIndex(d => d.fullDate === newDate);
    if (newIndex !== -1) {
      setStartIndex(Math.max(0, Math.min(newIndex, dateList.length - VISIBLE_COUNT)));
    }
  };

  const handleTimeClick = (s: Screening) => {
    setSelectedScreeningData(s);
    ticketingApi.getScreeningSeats(s.id).then((res) => {
      setCurrentSeats(res.data);
      setIsModalOpen(true);
    });
  };

  const toggleTheater = (id: number, name?: string) => {
    if (selectedTheaters.includes(id)) {
      setSelectedTheaters(prev => prev.filter(tId => tId !== id));
      setSelectedTheatersInfo(prev => prev.filter(t => t.id !== id));
    } else if (selectedTheaters.length < 4) {
      const targetName = name || theaters.find(t => t.id === id)?.name || "Theater";
      setSelectedTheaters(prev => [...prev, id]);
      setSelectedTheatersInfo(prev => [...prev, { id, name: targetName }]);
    } else { cinemaAlert("최대 4개의 상영관을 선택하실 수 있습니다.","알림"); }
  };

  const toggleMovie = (id: number) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(prev => prev.filter(mId => mId !== id));
    } else if (selectedMovies.length < 3) {
      setSelectedMovies(prev => [...prev, id]);
    } else { cinemaAlert("최대 3개의 영화를 선택하실 수 있습니다.","알림"); }
  };

  const movieSet = useMemo(() => new Set(availableMovieIds), [availableMovieIds]);
  const theaterSet = useMemo(() => new Set(availableTheaterIds), [availableTheaterIds]);
  const availableHours = useMemo(() => {
    const hours = new Set<number>();
    screenings.forEach(s => hours.add(parseInt((s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime).substring(0, 2))));
    return hours;
  }, [screenings]);

  const groupedScreenings = useMemo(() => {
    return screenings
      .filter(s => {
        if (selectedHour === null) return true;
        const startHour = parseInt((s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime).substring(0, 2));
        return startHour >= selectedHour;
      })
      .reduce((acc, s) => {
        if (!acc[s.movieTitle]) acc[s.movieTitle] = [];
        acc[s.movieTitle].push(s);
        return acc;
      }, {} as Record<string, Screening[]>);
  }, [screenings, selectedHour]);

  return {
    states: { 
      isModalOpen, selectedScreeningData, currentSeats, regions, theaters, movies, screenings, 
      activeTab, specialTypes, selectedSpecialType, selectedRegionId, selectedTheaters, 
      selectedTheatersInfo, selectedMovies, selectedDate, startIndex, selectedHour, startHourIndex 
    },
    setters: { 
      setIsModalOpen, setActiveTab, setSelectedSpecialType, setSelectedRegionId, 
      setStartIndex, setSelectedHour, setHourStartIndex, onDateButtonClick, onCalendarChange 
    },
    handlers: { handleTimeClick, toggleTheater, toggleMovie },
    memos: { movieSet, theaterSet, availableHours, groupedScreenings }
  };
};