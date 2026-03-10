import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTicketing } from '../hooks/useTicketing';
import { generateDateList } from '../utils/dateUtils';
import { mapRatingToStyle } from '../mappers/ticketingMapper';
import type { Screening } from '../types/ticketing';
import SeatPreviewModal from '../components/ticketing/SeatPreviewModal';
import FilmStrip from '../components/ticketing/FilmStrip';
import ratingImages, { type AgeRatingType } from "../utils/getRatingImage";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Film, Clock, Search } from 'lucide-react';

const VISIBLE_COUNT = 10;
const VISIBLE_HOUR_COUNT = 10;

const TicketingPage: React.FC = () => {
    const location = useLocation();
    const preSelectedMovieId = location.state?.movieId || location.state?.preSelectedMovieId;
    const preSelectedTheaterId = location.state?.theaterId || location.state?.preSelectedTheaterId || null;
    const preSelectedRegionId = location.state?.regionId || null;
    const preSelectedDate = location.state?.selectedDate || null;

    const dateList = generateDateList(30);
    const { states, setters, handlers, memos } = useTicketing(dateList, preSelectedMovieId, preSelectedTheaterId, preSelectedRegionId, preSelectedDate);
    const dateInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white">
            
            {/* Header Area */}
            <div className="bg-[#1A1A1A] text-white pt-15 pb-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
                </div>
                
                <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-[#B91C1C]"></div>
                            <p className="font-mono text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
                            <div className="h-px w-12 bg-[#B91C1C]"></div>
                        </div>
                        <h1 className="font-display text-2xl md:text-7xl uppercase tracking-tighter leading-none">
                            예매<span className="text-white/20"></span>
                        </h1>
                        <FilmStrip />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
                
                {/* Date Selector */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>Select Date</span>
                        </div>
                        <button 
                            onClick={() => dateInputRef.current?.showPicker()}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors"
                        >
                            <Calendar size={16} />
                            <span>Calendar View</span>
                            <input ref={dateInputRef} type="date" className="absolute opacity-0 pointer-events-none" value={states.selectedDate} onChange={(e) => setters.onCalendarChange(e.target.value)} />
                        </button>
                    </div>

                    <div className="relative flex items-center bg-[#FDFDFD] border border-black/5 rounded-sm p-2 shadow-xl">
                        <button 
                            onClick={() => setters.setStartIndex(Math.max(0, states.startIndex - 1))} 
                            disabled={states.startIndex === 0} 
                            className="p-4 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                        <div className="flex-1 flex items-center justify-between px-4 overflow-hidden">
                            {dateList.slice(states.startIndex, states.startIndex + VISIBLE_COUNT).map((d) => (
                                <button 
                                    key={d.fullDate} 
                                    onClick={() => setters.onDateButtonClick(d.fullDate)} 
                                    className={`flex flex-col items-center justify-center min-w-[100px] py-6 rounded-sm transition-all ${
                                        states.selectedDate === d.fullDate 
                                            ? 'bg-[#B91C1C] text-white shadow-lg scale-105 z-10' 
                                            : 'hover:bg-black/5'
                                    }`}
                                >
                                    <span className={`text-3xl font-display leading-none mb-1 ${d.isWeekend && states.selectedDate !== d.fullDate ? 'text-[#B91C1C]' : ''}`}>{d.dateNum}</span>
                                    <span className={`text-[10px] font-bold tracking-widest uppercase ${d.isWeekend && states.selectedDate !== d.fullDate ? 'text-[#B91C1C]' : 'opacity-40'}`}>{d.dayName}</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setters.setStartIndex(Math.min(dateList.length - VISIBLE_COUNT, states.startIndex + 1))} 
                            disabled={states.startIndex + VISIBLE_COUNT >= dateList.length} 
                            className="p-4 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Selection Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    
                    {/* Theater Selection */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>Theater</span>
                        </div>
                        
                        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl flex flex-col h-[600px]">
                            <div className="flex border-b border-black/5">
                                <button
                                    onClick={() => setters.setActiveTab('ALL')}
                                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        states.activeTab === 'ALL' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5'
                                    }`}
                                >
                                    Regions
                                </button>
                                <button
                                    onClick={() => setters.setActiveTab('SPECIAL')}
                                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        states.activeTab === 'SPECIAL' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-black/5'
                                    }`}
                                >
                                    Special
                                </button>
                            </div>

                            <div className="flex-1 flex min-h-0">
                                <div className="w-1/2 border-r border-black/5 overflow-y-auto bg-black/[0.02]">
                                    {(states.activeTab === 'ALL' ? states.regions : states.specialTypes.map(t => ({ id: t, name: t }))).map((r: any) => (
                                        <button
                                            key={r.id}
                                            onClick={() => states.activeTab === 'ALL' ? setters.setSelectedRegionId(r.id) : setters.setSelectedSpecialType(r.name)}
                                            className={`w-full p-5 text-left text-[11px] font-bold uppercase tracking-widest border-b border-black/5 transition-all ${
                                                (states.activeTab === 'ALL' ? states.selectedRegionId === r.id : states.selectedSpecialType === r.name) 
                                                    ? 'bg-white text-[#B91C1C] shadow-sm' 
                                                    : 'text-black/40 hover:text-black hover:bg-white'
                                            }`}
                                        >
                                            {r.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-1/2 overflow-y-auto bg-white">
                                    {states.theaters.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handlers.toggleTheater(t.id, t.name)}
                                            className={`w-full p-5 text-left text-xs font-medium border-b border-black/5 transition-all ${
                                                states.selectedTheaters.includes(t.id)
                                                    ? 'bg-[#B91C1C]/5 text-[#B91C1C] font-bold'
                                                    : 'text-black/60 hover:bg-black/[0.02]'
                                            } ${!memos.theaterSet.has(t.id) && states.selectedMovies.length > 0 ? 'opacity-30' : ''}`}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Theaters Summary */}
                            <div className="p-6 bg-[#F8F8F8] border-t border-black/5">
                                <div className="flex flex-wrap gap-2">
                                    {states.selectedTheatersInfo.length === 0 ? (
                                        <div className="w-full py-4 border border-dashed border-black/10 rounded-sm flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Select Venue (Max 4)</span>
                                        </div>
                                    ) : (
                                        states.selectedTheatersInfo.map((t) => (
                                            <div key={t.id} className="bg-white border border-black/5 px-3 py-2 rounded-sm flex items-center gap-2 shadow-sm">
                                                <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[80px]">{t.name}</span>
                                                <button onClick={() => handlers.toggleTheater(t.id)} className="text-[#B91C1C] hover:scale-125 transition-transform">×</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Movie Selection */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>Movie</span>
                        </div>

                        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl flex flex-col h-[600px]">
                            <div className="flex-1 overflow-y-auto bg-white">
                                {states.movies.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => handlers.toggleMovie(m.id)}
                                        className={`w-full p-5 text-left border-b border-black/5 transition-all flex items-center gap-4 group ${
                                            states.selectedMovies.includes(m.id)
                                                ? 'bg-[#B91C1C]/5 text-[#B91C1C]'
                                                : 'text-black/60 hover:bg-black/[0.02]'
                                        } ${!memos.movieSet.has(m.id) && states.selectedTheaters.length > 0 ? 'opacity-30' : ''}`}
                                    >
                                        <img 
                                            src={ratingImages[m.ageRating as AgeRatingType] || ratingImages.ALL} 
                                            alt={m.ageRating}
                                            className="w-6 h-6 object-contain transition-all" 
                                        />
                                        <span className="text-xs font-bold uppercase tracking-tight truncate group-hover:text-[#B91C1C] transition-colors">{m.title}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Movies Summary */}
                            <div className="p-6 bg-[#F8F8F8] border-t border-black/5">
                                <div className="grid grid-cols-3 gap-3">
                                    {states.selectedMovies.length === 0 ? (
                                        <div className="col-span-3 py-8 border border-dashed border-black/10 rounded-sm flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Select Movie (Max 3)</span>
                                        </div>
                                    ) : (
                                        states.selectedMovies.map((mId) => {
                                            const movie = states.movies.find(m => m.id === mId);
                                            return (
                                                <div key={mId} className="relative aspect-[2/3] bg-white border border-black/5 rounded-sm overflow-hidden shadow-md group">
                                                    {movie?.posterUrl ? (
                                                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center p-2 text-center">
                                                            <span className="text-[8px] font-bold uppercase leading-tight">{movie?.title}</span>
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => handlers.toggleMovie(mId)}
                                                        className="absolute top-1 right-1 w-5 h-5 bg-[#B91C1C] text-white rounded-full flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                            <div className="w-8 h-px bg-[#B91C1C]"></div>
                            <span>Schedule</span>
                        </div>

                        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl flex flex-col h-[600px]">
                            {/* Time Filter */}
                            <div className="flex items-center bg-white border-b border-black/5 p-4 gap-4">
                                <button onClick={() => setters.setHourStartIndex(Math.max(0, states.startHourIndex - 1))} disabled={states.startHourIndex === 0} className="p-2 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex-1 flex items-center justify-around overflow-hidden">
                                    {Array.from({ length: 24 }).slice(states.startHourIndex, states.startHourIndex + VISIBLE_HOUR_COUNT).map((_, idx) => {
                                        const hour = states.startHourIndex + idx;
                                        const hasMovie = memos.availableHours.has(hour);
                                        return (
                                            <button 
                                                key={hour} 
                                                disabled={!hasMovie} 
                                                onClick={() => setters.setSelectedHour(hour)} 
                                                className={`w-10 h-10 flex flex-col items-center justify-center rounded-sm transition-all border ${
                                                    states.selectedHour === hour 
                                                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-lg scale-110' 
                                                        : 'border-transparent text-black/40 hover:border-black/20 hover:text-black' 
                                                } ${!hasMovie && 'opacity-10 cursor-not-allowed'}`}
                                            >
                                                <span className="font-mono text-xs font-bold leading-none">{String(hour).padStart(2, '0')}</span>
                                                <span className="text-[7px] uppercase mt-0.5 tracking-tighter font-bold">HR</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setters.setHourStartIndex(Math.min(14, states.startHourIndex + 1))} disabled={states.startHourIndex + VISIBLE_HOUR_COUNT >= 24} className="p-2 hover:bg-black hover:text-white transition-all disabled:opacity-10 rounded-sm">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Screenings List */}
                            <div className="flex-1 overflow-y-auto p-8 bg-white/50 custom-scrollbar">
                                {Object.keys(memos.groupedScreenings).length > 0 ? (
                                    Object.entries(memos.groupedScreenings).map(([title, items]) => {
                                        const screeningItems = items as Screening[];
                                        const ratingStyle = mapRatingToStyle(screeningItems[0]?.ageRating || 'ALL');
                                        const finalKey = ratingStyle.text === 'ALL' ? 'ALL' : `AGE_${ratingStyle.text}`;
                                        const groups = screeningItems.reduce((acc, s) => { const key = `${s.theaterName}|${s.screenType}`; if (!acc[key]) acc[key] = []; acc[key].push(s); return acc; }, {} as Record<string, Screening[]>);
                                        
                                        return (
                                            <div key={title} className="mb-12 last:mb-0">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <img 
                                                        src={ratingImages[finalKey as AgeRatingType] || ratingImages.ALL} 
                                                        alt={finalKey}
                                                        className="w-8 h-8 object-contain" 
                                                    />
                                                    <h3 className="font-display text-3xl uppercase tracking-tight text-[#1A1A1A]">{title}</h3>
                                                </div>
                                                
                                                {Object.entries(groups).map(([key, times]) => {
                                                    const [tName, sType] = key.split('|');
                                                    const screeningTimes = times as Screening[];
                                                    return (
                                                        <div key={key} className="mb-8 last:mb-0">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-black text-white px-2 py-0.5 rounded-sm">{sType}</span>
                                                                <span className="text-xs font-bold uppercase tracking-widest text-black/40">{tName}</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                {screeningTimes.map((s) => {
                                                                    const time = s.startTime.includes('T') ? s.startTime.split('T')[1].substring(0, 5) : s.startTime.substring(0, 5);
                                                                    const isSoldOut = s.availableSeats === 0;
                                                                    return (
                                                                        <button 
                                                                            key={s.id} 
                                                                            disabled={isSoldOut}
                                                                            onClick={() => handlers.handleTimeClick(s)} 
                                                                            className={`group relative p-4 bg-white border border-black/5 rounded-sm transition-all duration-300 flex flex-col gap-2 text-left shadow-sm hover:shadow-xl hover:border-[#B91C1C]/30 ${isSoldOut ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                                                        >
                                                                            <div className="font-display text-2xl group-hover:text-[#B91C1C] transition-colors">{time}</div>
                                                                            <div className="flex flex-col items-center pt-2 border-t border-black/5">
                                                                                <div className="text-[10px] font-bold">
                                                                                    <span className="text-[#B91C1C]">{s.availableSeats}</span>
                                                                                    <span className="text-black/20"> / {s.totalSeats}</span>
                                                                                </div>
                                                                                <div className="text-[9px] font-mono font-bold text-black/20 uppercase">{s.screenName}</div>
                                                                            </div>
                                                                            {isSoldOut && (
                                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                                    <span className="text-white text-[10px] font-bold border border-white px-2 py-1 uppercase tracking-widest">Sold Out</span>
                                                                                </div>
                                                                            )}
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
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                                        <div className="w-24 h-24 border-2 border-dashed border-black rounded-full flex items-center justify-center">
                                            <Clock size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-display text-2xl uppercase tracking-tight">Awaiting Selection</p>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">Select venue and movie to view available sessions</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SeatPreviewModal key={states.selectedScreeningData?.id} isOpen={states.isModalOpen} onClose={() => setters.setIsModalOpen(false)} screening={states.selectedScreeningData} seats={states.currentSeats} />
        </div>
    );
};

export default TicketingPage;
