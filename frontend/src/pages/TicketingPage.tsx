import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ticketingApi } from '../api/ticketingApi';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';
import SeatPreviewModal from '../components/ticketing/SeatPreviewModal';
import FilmStrip from '../components/ticketing/FilmStrip';

interface SelectedTheaterInfo { id: number; name: string; }

const getRatingStyle = (rating: string) => {
  const r = (rating || "").toLowerCase().replace('age_', '').trim();
  let color = 'bg-[#4a4a4a]';
  let text = r.toUpperCase();

  if (r === 'all') { 
    color = 'bg-[#1a5f2e]'; 
    text = 'ALL'; 
  } else if (r === '12') { 
    color = 'bg-[#c99000]'; 
    text = '12';
  } else if (r === '15') { 
    color = 'bg-[#a35200]'; 
    text = '15';
  } else if (r === '18') { 
    color = 'bg-[#7d1a1a]'; 
    text = '18';
  }

  return { color, text };
};

const getLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      fullDate: getLocalDateString(d),
      dateNum: d.getDate(),
      dayName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()],
      isWeekend: d.getDay() === 0,
      isSaturday: d.getDay() === 6,
    });
  }
  return dates;
};

const dateList = generateDates();
const VISIBLE_COUNT = 10;
const VISIBLE_HOUR_COUNT = 10;

const TicketingPage: React.FC = () => {
  // --- [Dynamically Inject External Resources] ---
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const tailwindScript = document.createElement('script');
      tailwindScript.id = 'tailwind-cdn';
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(tailwindScript);
    }

    if (!document.getElementById('google-fonts')) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);

      const fontLink = document.createElement('link');
      fontLink.id = 'google-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Montserrat:wght@300;400;600;700&family=Courier+Prime:wght@400;700&family=Special+Elite&display=swap';
      document.head.appendChild(fontLink);
    }
  }, []);

  // --- [Internal Styles] ---
  const vintageStyles = `
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'Courier Prime', monospace; }
    .font-typewriter { font-family: 'Special Elite', cursive; }
    
    .grainy::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.05;
      background-image: url('https://grainy-gradients.vercel.app/noise.svg');
    }

    @keyframes flicker {
      0% { opacity: 0.97; }
      5% { opacity: 0.95; }
      10% { opacity: 0.9; }
      15% { opacity: 0.95; }
      20% { opacity: 0.98; }
      25% { opacity: 0.95; }
      30% { opacity: 0.9; }
      100% { opacity: 1; }
    }
    .projector-glow {
      animation: flicker 0.15s infinite;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #eee;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 0px;
    }

    .paper-texture {
      background-image: url('https://www.transparenttextures.com/patterns/p6.png');
    }

  `;

  // --- [State Management] ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScreeningData, setSelectedScreeningData] = useState<Screening | null>(null);
  const [currentSeats, setCurrentSeats] = useState<any[]>([]);

  const handleTimeClick = (s: Screening) => {
    setSelectedScreeningData(s);
    ticketingApi.getScreeningSeats(s.id).then((res) => {
      setCurrentSeats(res.data);
      setIsModalOpen(true);
    });
  };

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
  const [selectedTheatersInfo, setSelectedTheatersInfo] = useState<SelectedTheaterInfo[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [startIndex, setStartIndex] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [startHourIndex, setHourStartIndex] = useState(6);

  // --- [Data Fetching Effects] ---
  useEffect(() => {
    ticketingApi.getRegions().then((res: { data: Region[] }) => setRegions(res.data));
    ticketingApi.getMovies().then((res: { data: Movie[] }) => setMovies(res.data));
    ticketingApi.getSpecialTypes().then((res: { data: string[] }) => setSpecialTypes(res.data));
  }, []);

  useEffect(() => {
    if (activeTab === 'ALL') setSelectedSpecialType(null);
    else setSelectedRegionId(null);
    setTheaters([]);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ALL' && selectedRegionId) {
      ticketingApi.getTheaters(selectedRegionId, null).then((res: { data: Theater[] }) => setTheaters(res.data));
    } else if (activeTab === 'SPECIAL' && selectedSpecialType) {
      ticketingApi.getTheaters(null, selectedSpecialType).then((res: { data: Theater[] }) => setTheaters(res.data));
    }
  }, [selectedRegionId, selectedSpecialType, activeTab]);

  useEffect(() => {
    if (selectedTheaters.length > 0 || selectedMovies.length > 0) {
      const typeFilter = activeTab === 'SPECIAL' ? 'SPECIAL' : null;
      ticketingApi.getScreenings(selectedTheaters, selectedMovies, selectedDate, typeFilter)
        .then((res: { data: Screening[] }) => setScreenings(res.data));
    } else { 
      setScreenings([]); 
    }
  }, [selectedTheaters, selectedMovies, selectedDate, activeTab]); 

  useEffect(() => {
    if (selectedTheaters.length > 0 || activeTab === 'SPECIAL') {
      let colorFilter: string | null = null;
      if (activeTab === 'SPECIAL') {
        colorFilter = selectedTheaters.length > 0 ? 'SPECIAL' : (selectedSpecialType || 'SPECIAL');
      }
      ticketingApi.getAvailableMovieIds(selectedTheaters, selectedDate, colorFilter)
        .then((res: { data: number[] }) => setAvailableMovieIds(res.data));
    } else {
      setAvailableMovieIds([]);
    }
  }, [selectedTheaters, selectedDate, selectedSpecialType, activeTab]);

  useEffect(() => {
    if (selectedMovies.length > 0) {
      ticketingApi.getAvailableTheaterIds(selectedMovies, selectedDate).then((res: { data: number[] }) => setAvailableTheaterIds(res.data));
    } else { setAvailableTheaterIds([]); }
  }, [selectedMovies, selectedDate]);

  const movieSet = useMemo(() => new Set(availableMovieIds), [availableMovieIds]);
  const theaterSet = useMemo(() => new Set(availableTheaterIds), [availableTheaterIds]);

  useEffect(() => {
    if (screenings.length > 0) {
      const hours = screenings.map(s => {
        const timeStr = s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime;
        return parseInt(timeStr.substring(0, 2));
      });
      const minHour = Math.min(...hours);
      setSelectedHour(minHour);
      const targetStartIndex = minHour - 4;
      setHourStartIndex(Math.max(0, Math.min(targetStartIndex, 24 - VISIBLE_HOUR_COUNT)));
    } else { setSelectedHour(null); }
  }, [screenings]);

  const toggleTheater = (id: number, name?: string) => {
    if (selectedTheaters.includes(id)) {
      setSelectedTheaters(selectedTheaters.filter(tId => tId !== id));
      setSelectedTheatersInfo(selectedTheatersInfo.filter(t => t.id !== id));
    } else if (selectedTheaters.length < 4) {
      const targetName = name || theaters.find(t => t.id === id)?.name || "Theater";
      setSelectedTheaters([...selectedTheaters, id]);
      setSelectedTheatersInfo([...selectedTheatersInfo, { id, name: targetName }]);
    } else { alert("Up to 4 theaters can be selected."); }
  };

  const toggleMovie = (id: number) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter(mId => mId !== id));
    } else if (selectedMovies.length < 3) {
      setSelectedMovies([...selectedMovies, id]);
    } else { alert("Up to 3 movies can be selected."); }
  };

  const availableHours = useMemo(() => {
    const hours = new Set<number>();
    screenings.forEach(s => {
      const timeStr = s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime;
      hours.add(parseInt(timeStr.substring(0, 2)));
    });
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

  return (
    <div className="bg-[#f4f1ea] text-black min-h-screen relative overflow-x-hidden paper-texture">
      <style dangerouslySetInnerHTML={{ __html: vintageStyles }} />

      {/* Enhanced Header */}
      <div className="bg-black text-white pt-12 pb-8 relative">
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center projector-glow">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-20 bg-white/40"></div>
              <p className="font-mono text-sm tracking-[0.3em] text-white/60 uppercase">Swift Booking • Online Now</p>
              <div className="h-px w-20 bg-white/40"></div>
            </div>
            <FilmStrip />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-12 flex flex-col gap-0 font-sans relative">
        
        {/* Date Reel Style */}
        <div className="border-[6px] border-black bg-white flex items-center h-24 relative overflow-hidden mb-12 shadow-[12px_12px_0_0_#000]">
          <button 
            onClick={() => startIndex > 0 && setStartIndex(startIndex - 1)} 
            disabled={startIndex === 0} 
            className="px-8 h-full text-4xl font-light text-black hover:bg-black hover:text-white transition-all disabled:opacity-20 z-10"
          >
            ‹
          </button>
          
          <div className="flex-1 flex items-center justify-between px-4 h-full relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            {dateList.slice(startIndex, startIndex + VISIBLE_COUNT).map((d) => (
              <div 
                key={d.fullDate} 
                onClick={() => setSelectedDate(d.fullDate)} 
                className={`flex flex-col items-center justify-center cursor-pointer min-w-[85px] h-full transition-all relative border-x border-black/5 ${selectedDate === d.fullDate ? 'bg-black text-white scale-105 z-20 shadow-xl' : 'hover:bg-[#e6dcc5]'}`}
              >
                <span className={`text-2xl font-mono font-bold ${d.isWeekend && selectedDate !== d.fullDate ? 'text-red-600' : ''}`}>{d.dateNum}</span>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${d.isWeekend && selectedDate !== d.fullDate ? 'text-red-600' : 'opacity-60'}`}>{d.dayName}</span>
                {selectedDate === d.fullDate && <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-red-600 rounded-full"></div>}
              </div>
            ))}
          </div>

          <button 
            onClick={() => startIndex + VISIBLE_COUNT < dateList.length && setStartIndex(startIndex + 1)} 
            disabled={startIndex + VISIBLE_COUNT >= dateList.length} 
            className="px-8 h-full text-4xl font-light text-black hover:bg-black hover:text-white transition-all disabled:opacity-20 z-10"
          >
            ›
          </button>

          <div 
            className="border-l-[6px] border-black px-8 h-full flex items-center justify-center bg-[#f4f1ea] cursor-pointer hover:bg-[#e6dcc5] transition-colors group" 
            onClick={() => dateInputRef.current?.showPicker()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <input 
              ref={dateInputRef} 
              type="date" 
              className="absolute opacity-0 pointer-events-none" 
              value={selectedDate} 
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                const newIndex = dateList.findIndex(d => d.fullDate === newDate);
                if (newIndex !== -1) setStartIndex(Math.max(0, Math.min(newIndex, dateList.length - VISIBLE_COUNT)));
              }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-0 border-[6px] border-black h-[800px] bg-white shadow-[20px_20px_0_0_#000] relative">
          
          {/* 1. THEATER SECTION */}
          <div className="border-r-[6px] border-black flex flex-col h-full bg-[#f4f1ea]">
            <div className="bg-black text-white py-4 text-center font-serif text-2xl italic tracking-widest uppercase border-b-4 border-black">Theater</div>
            <div className="flex border-b-4 border-black h-14 shrink-0 bg-white">
              <button onClick={() => setActiveTab('ALL')} className={`flex-1 text-xs font-bold uppercase tracking-[0.2em] transition-all border-r-2 border-black/10 ${activeTab === 'ALL' ? 'bg-black text-white' : 'hover:bg-[#e6dcc5]'}`}>Regions</button>
              <button onClick={() => setActiveTab('SPECIAL')} className={`flex-1 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'SPECIAL' ? 'bg-black text-white' : 'hover:bg-[#e6dcc5]'}`}>Special</button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/2 border-r-4 border-black/20 overflow-y-auto custom-scrollbar bg-white/40">
                {activeTab === 'ALL' ? regions.map(r => (<div key={r.id} onClick={() => setSelectedRegionId(r.id)} className={`p-5 cursor-pointer text-xs font-bold uppercase tracking-widest border-b border-black/5 transition-colors ${selectedRegionId === r.id ? 'bg-black text-white' : 'hover:bg-white'}`}>{r.name}</div>)) : specialTypes.map(type => (<div key={type} onClick={() => setSelectedSpecialType(type)} className={`p-5 cursor-pointer text-xs font-bold uppercase tracking-widest border-b border-black/5 transition-colors ${selectedSpecialType === type ? 'bg-black text-white' : 'hover:bg-white'}`}>{type}</div>))}
              </div>
              <div className="w-1/2 overflow-y-auto custom-scrollbar bg-white">
                {theaters.map(t => {
                  const isSelected = selectedTheaters.includes(t.id);
                  const isActualShowing = theaterSet.has(t.id);
                  return (
                    <div key={t.id} onClick={() => toggleTheater(t.id, t.name)} className={`p-5 cursor-pointer text-sm font-medium border-b border-black/5 transition-all ${isSelected ? 'bg-red-700 text-white font-bold' : 'text-black hover:bg-[#f4f1ea]'} ${!isActualShowing && selectedMovies.length > 0 ? 'opacity-50' : ''}`}>{t.name}</div>
                  );
                })}
              </div>
            </div>
            
            {/* Selected Theaters Display (2x2 Grid) */}
            <div className="p-4 bg-black/5 min-h-[160px] border-t-[6px] border-black">
              <div className="grid grid-cols-2 gap-2">
                {selectedTheatersInfo.length === 0 ? (
                  <div className="col-span-2 h-28 flex flex-col items-center justify-center text-gray-500 text-[10px] text-center p-4 border-2 border-dashed border-black/20 uppercase tracking-widest leading-relaxed">Select Venue<br/>(Max 4)</div>
                ) : (
                  <>
                    {selectedTheatersInfo.map(t => (
                      <div key={t.id} className="flex items-center justify-between border-2 border-black px-2 py-2 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.1)] h-12">
                        <span className="text-[12px] uppercase font-bold truncate flex-1 tracking-tighter leading-none">{t.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleTheater(t.id); }} 
                          className="text-red-700 font-bold ml-1 hover:scale-125 transition-transform text-lg outline-none focus:outline-none focus-visible:outline-none !ring-0 !shadow-none !bg-transparent !border-none !p-0 select-none"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {Array.from({ length: 4 - selectedTheatersInfo.length }).map((_, i) => (
                      <div key={`empty-t-${i}`} className="border-2 border-dashed border-black/10 h-12 flex items-center justify-center text-xs opacity-20 font-bold">+</div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. MOVIE SECTION */}
          <div className="border-r-[6px] border-black flex flex-col h-full bg-[#f4f1ea]">
            <div className="bg-black text-white py-4 text-center font-serif text-2xl italic tracking-widest uppercase border-b-4 border-black">Movie</div>
            <div className="overflow-y-auto flex-1 custom-scrollbar bg-white">
              {movies.map(m => {
                const ratingInfo = getRatingStyle(m.ageRating);
                const isSelected = selectedMovies.includes(m.id);
                const isActualShowing = movieSet.has(m.id);
                return (
                  <div key={m.id} onClick={() => toggleMovie(m.id)} className={`p-5 cursor-pointer border-b border-black/10 transition-all flex items-center group ${isSelected ? 'bg-black text-white' : 'text-black hover:bg-[#f4f1ea]'} ${!isActualShowing && selectedTheaters.length > 0 ? 'opacity-50' : ''}`}>
                    <span className={`${ratingInfo.color} text-white text-[10px] font-bold w-7 h-7 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000] shrink-0 mr-4 uppercase font-mono`}>{ratingInfo.text}</span>
                    <span className="text-sm font-bold uppercase tracking-tight truncate group-hover:italic">{m.title}</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Movies Display (Poster) */}
            <div className="p-5 bg-black/5 min-h-[160px] border-t-[6px] border-black">
              <div className="grid grid-cols-3 gap-3 h-full">
                {selectedMovies.length === 0 ? (
                  <div className="col-span-3 h-28 flex flex-col items-center justify-center text-gray-500 text-[10px] text-center p-4 border-2 border-dashed border-black/20 uppercase tracking-widest leading-relaxed">
                    Select Movie<br/>(Max 3)
                  </div>
                ) : (
                  <>
                    {selectedMovies.map(mId => {
                      const movie = movies.find(m => m.id === mId);
                      return (
                        <div key={mId} className="relative aspect-[2/3] border-2 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
                          <div className="absolute inset-0 p-2 flex items-center justify-center">
                            <p className="text-[10px] text-center font-bold leading-tight uppercase overflow-hidden">
                              {movie?.title}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleMovie(mId); }} 
                            className="absolute -top-2 -right-2 bg-red-700 text-white w-6 h-6 border-2 border-black flex items-center justify-center text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {Array.from({ length: 3 - selectedMovies.length }).map((_, i) => (
                      <div key={`empty-m-${i}`} className="aspect-[2/3] border-2 border-dashed border-black/10 bg-transparent flex items-center justify-center">
                        <span className="text-black/10 text-3xl font-light">+</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 3 & 4 통합: TIME SECTION */}
          <div className="flex flex-col col-span-2 bg-[#f4f1ea] h-full overflow-hidden">
            <div className="bg-black text-white py-4 text-center font-serif text-2xl italic tracking-widest uppercase border-b-4 border-black">Schedule</div>
            
            {/* Hour Selector */}
            <div className="flex items-center border-b-4 border-black h-20 bg-white px-4 relative z-10 shadow-md"> 
              <button 
                onClick={() => startHourIndex > 0 && setHourStartIndex(startHourIndex - 1)} 
                disabled={startHourIndex === 0} 
                className="w-14 h-full flex items-center justify-center text-4xl font-light hover:bg-black hover:text-white transition-all disabled:opacity-10"
              >
                ‹
              </button>
              <div className="flex-1 flex items-center justify-around h-full overflow-hidden mx-4">
                {Array.from({ length: 24 }).slice(startHourIndex, startHourIndex + VISIBLE_HOUR_COUNT).map((_, idx) => {
                  const hour = startHourIndex + idx;
                  const hasMovie = availableHours.has(hour);
                  return (
                    <button 
                      key={hour} 
                      disabled={!hasMovie} 
                      onClick={() => setSelectedHour(hour)} 
                      className={`w-12 h-12 flex flex-col items-center justify-center font-mono text-sm font-bold transition-all border-2 ${selectedHour === hour ? 'border-black bg-black text-white rotate-3 scale-110 shadow-lg' : 'border-transparent text-black hover:border-black/30' } ${!hasMovie && 'opacity-10 cursor-not-allowed grayscale'}`}
                    >
                      {String(hour).padStart(2, '0')}
                      <span className="text-[7px] uppercase mt-0.5 tracking-tighter">HR</span>
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => startHourIndex + VISIBLE_HOUR_COUNT < 24 && setHourStartIndex(startHourIndex + 1)} 
                disabled={startHourIndex + VISIBLE_HOUR_COUNT >= 24} 
                className="w-14 h-full flex items-center justify-center text-4xl font-light hover:bg-black hover:text-white transition-all disabled:opacity-10"
              >
                ›
              </button>
            </div>
            
            {/* Screening List */}
            <div className="p-8 text-left flex-1 overflow-y-auto bg-white/20 custom-scrollbar"> 
              {Object.keys(groupedScreenings).length > 0 ? (
                (Object.entries(groupedScreenings) as [string, Screening[]][]).map(([title, items]) => {
                  const ratingInfo = getRatingStyle(items[0]?.ageRating || 'ALL');
                  const theaterGroups = items.reduce((acc, s) => { const key = `${s.theaterName}|${s.screenType}`; if (!acc[key]) acc[key] = []; acc[key].push(s); return acc; }, {} as Record<string, Screening[]>);
                  return (
                    <div key={title} className="mb-10 border-l-[8px] border-black pl-6">
                      <div className="flex items-center gap-3 mb-5">
                        <span className={`${ratingInfo.color} text-white text-[10px] font-bold w-7 h-7 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000] uppercase font-mono`}>{ratingInfo.text}</span>
                        <h3 className="font-serif text-3xl italic tracking-tighter text-black uppercase">{title}</h3>
                      </div>
                      {(Object.entries(theaterGroups) as [string, Screening[]][]).map(([groupKey, times]) => {
                        const [theaterName, screenType] = groupKey.split('|');
                        return (
                          <div key={groupKey} className="mb-6">
                            <div className="flex items-baseline gap-3 mb-3 border-b border-black/10 pb-1">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest !bg-black !text-white px-2 py-0.5">{screenType}</span>
                                <span className="font-serif text-lg text-black/60 italic">{theaterName}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {times.map((s) => {
                                const rawTime = s.startTime.includes('T') ? s.startTime.split('T')[1].substring(0, 5) : s.startTime.substring(0, 5);
                                return (
                                  <button key={s.id} onClick={() => handleTimeClick(s)} className="border-2 border-black p-2 !bg-white hover:!bg-black hover:!text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] flex flex-col gap-1 relative overflow-hidden group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                                    <div className="font-mono text-xl font-bold tracking-tighter group-hover:text-white">{rawTime}</div>
                                    <div className="flex justify-between items-end border-t border-black/5 group-hover:border-white/20 pt-1">
                                      <div className="text-[10px] font-bold"><span className="!text-red-700 group-hover:!text-red-400">{s.availableSeats}</span><span className="text-black/30 group-hover:text-white/30">/{s.totalSeats}</span></div>
                                      <div className="text-[9px] font-mono text-black/40 group-hover:text-white/40">{s.screenName.replace('관', '')}관</div>
                                    </div>
                                    {s.availableSeats === 0 && <div className="absolute inset-0 !bg-black/60 flex items-center justify-center rotate-[-10deg]"><span className="text-white text-[10px] font-bold border-2 border-white px-1 uppercase">Sold Out</span></div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 border-4 border-dashed border-black/10 rounded-full flex items-center justify-center"><span className="font-serif text-3xl italic text-black/20">?</span></div>
                  <p className="font-serif text-2xl italic text-black/30 uppercase tracking-tighter">Awaiting Selection</p>
                  <p className="font-mono text-[9px] text-black/40 uppercase tracking-widest max-w-[200px] leading-relaxed">Select venue and movie reels to see the daily manifest.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer/Credits Section */}
        <div className="mt-16 flex flex-col items-center gap-10">
            <div className="w-full flex items-center gap-8 px-10">
                <div className="flex-1 h-1.5 border-y border-black"></div>
                <div className="font-serif italic text-4xl uppercase tracking-tighter">The End</div>
                <div className="flex-1 h-1.5 border-y border-black"></div>
            </div>
            
            <div className="max-w-2xl text-center space-y-4">
              <p className="font-typewriter text-[11px] text-black/60 uppercase leading-relaxed tracking-widest">
                Tickets are valid for the selected session only. Please arrive 10 minutes before the screening.
                Recording and photography are strictly prohibited inside the auditorium.
              </p>
              <div className="flex items-center justify-center gap-6 opacity-30 grayscale scale-75">
                  <img src="https://img.icons8.com/ios-filled/50/000000/movie-projector.png" alt="projector" className="w-12 h-12" />
                  <div className="h-10 w-px bg-black"></div>
                  <img src="https://img.icons8.com/ios-filled/50/000000/film-reel.png" alt="film" className="w-12 h-12" />
                  <div className="h-10 w-px bg-black"></div>
                  <img src="https://img.icons8.com/ios-filled/50/000000/star.png" alt="stars" className="w-12 h-12" />
              </div>
            </div>
        </div>
      </div>

      <SeatPreviewModal 
        key={selectedScreeningData?.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screening={selectedScreeningData}
        seats={currentSeats}
      />
      
      {/* Final Credits Footer */}
      <footer className="bg-black text-white/40 py-16 mt-5 text-center relative">
        <div className="max-w-4xl mx-auto px-10">
          <FilmStrip />
          <div className="mt-12 space-y-6 font-mono text-[10px] uppercase tracking-[0.5em]">
            <p>© 1928 - 2026 GOLDEN AGE CINEMA EXHIBITIONS</p>
            <p className="opacity-20 leading-loose">
              Special thanks to the projectionists, ushers, and patrons of fine cinema.<br/>
              Distributed by Vintage Film Works, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TicketingPage;