import { useState, useEffect, useMemo } from 'react';
import { ticketingApi } from '../api/ticketingApi';
import { ticketingService } from '../services/ticketingService';
import { getLocalDateString } from '../utils/dateUtils';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';

const VISIBLE_COUNT = 10;
const VISIBLE_HOUR_COUNT = 10;

export const useTicketing = (dateList: any[]) => {
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
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedTheaters, setSelectedTheaters] = useState<number[]>([]);
  const [selectedTheatersInfo, setSelectedTheatersInfo] = useState<{id:number; name:string}[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [startIndex, setStartIndex] = useState(0);
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
    } else { alert("Up to 4 theaters can be selected."); }
  };

  const toggleMovie = (id: number) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(prev => prev.filter(mId => mId !== id));
    } else if (selectedMovies.length < 3) {
      setSelectedMovies(prev => [...prev, id]);
    } else { alert("Up to 3 movies can be selected."); }
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