import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, Film, Ticket } from 'lucide-react';

const QuickMenuSection = () => {
  const [keyword, setKeyword] = useState(""); // 검색어 상태
  const navigate = useNavigate();

  // 검색 핸들러 로직
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate('/movie-list', { state: { keyword: keyword } });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 relative z-40 -mt-12 md:-mt-16">
      {/* 메인 컨테이너 */}
      <div className="bg-white border border-black/5 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm">
        <div className="bg-[#FDFDFD] p-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* 1. Search Section */}
          <form onSubmit={handleSearch} className="flex-1 w-full relative group">
            <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-4 font-sans">
              Search Archive
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="ENTER MOVIE TITLE..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-black/5 border border-black/10 py-4 pl-6 pr-14 font-sans text-sm text-[#1A1A1A] placeholder:text-black/20 focus:outline-none focus:border-[#B91C1C] focus:bg-white transition-all uppercase tracking-widest rounded-sm"
              />
              <button 
                type="submit" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#B91C1C] transition-colors hover:scale-110 transition-transform"
              >
                <Search size={22} strokeWidth={3} />
              </button>
            </div>
          </form>

          {/* 수직 구분선 (데스크톱 전용) */}
          <div className="hidden lg:block w-px h-20 bg-black/10 mx-4" />

          {/* 2. Quick Links: 버튼형 그리드 디자인 */}
          <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* 상영시간표 링크 */}
            <Link to="/timetables" className="group flex items-center gap-5 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] hover:shadow-[0_10px_20px_rgba(185,28,28,0.2)]">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Schedule</span>
                <span className="block font-sans text-[9px] font-bold uppercase tracking-widest text-black/30 group-hover:text-white/70">Daily List</span>
              </div>
            </Link>

            {/* 박스오피스 링크 */}
            <Link to="/movie-list" className="group flex items-center gap-5 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] hover:shadow-[0_10px_20px_rgba(185,28,28,0.2)]">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Schedule</span>
                <span className="block font-sans text-[9px] font-bold uppercase tracking-widest text-black/30 group-hover:text-white/70">Daily List</span>
              </div>
            </Link>

            {/* 빠른예매 링크 */}
            <Link to="/ticketing" className="group flex items-center gap-5 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] hover:shadow-[0_10px_20px_rgba(185,28,28,0.2)]">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Ticket size={24} strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Booking</span>
                <span className="block font-sans text-[9px] font-bold uppercase tracking-widest text-black/30 group-hover:text-white/70">Direct Entry</span>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickMenuSection;