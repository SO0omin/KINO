import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const QuickMenuSection = () => {
  const [keyword, setKeyword] = useState(""); // 검색어 상태
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    navigate('/movie-list', { state: { keyword: keyword } });
  };

  return (
    <section className="max-w-7xl mx-auto px-10">
      <div className="w-full bg-white border-[6px] border-black p-1 shadow-[16px_16px_0_0_#000] relative">
        {/* Decorative Inner Border */}
        <div className="border-2 border-black/10 p-8 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* 1. Search - Vintage Ledger Style */}
          <form onSubmit={handleSearch} className="flex-1 w-full relative group">
            <label className="absolute -top-12 left-0 font-typewriter text-[10px] text-black/40 uppercase tracking-widest">Search Archive</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="ENTER TITLE..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-black py-4 pl-2 pr-12 font-mono text-lg text-black placeholder:text-black/20 focus:outline-none focus:border-red-800 transition-all uppercase"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
            </div>
          </form>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-24 bg-black/10 mx-4" />

          {/* 2. Quick Links - Classic Program Style */}
          <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            <Link to="/timetables" className="group flex flex-col items-center text-center gap-4 p-4 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black">
              <div className="p-3 border-2 border-black group-hover:border-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="space-y-1">
                <span className="block font-serif text-lg italic tracking-tight">Schedule</span>
                <span className="block font-mono text-[9px] uppercase tracking-widest opacity-60 group-hover:opacity-100">Daily Manifest</span>
              </div>
            </Link>

            <Link to="/movie-list" className="group flex flex-col items-center text-center gap-4 p-4 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black">
              <div className="p-3 border-2 border-black group-hover:border-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><line x1="7" y1="3" x2="7" y2="18"/><line x1="17" y1="3" x2="17" y2="18"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="12" x2="22" y2="12"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
              </div>
              <div className="space-y-1">
                <span className="block font-serif text-lg italic tracking-tight">Box Office</span>
                <span className="block font-mono text-[9px] uppercase tracking-widest opacity-60 group-hover:opacity-100">Top Reels</span>
              </div>
            </Link>

            <Link to="/ticketing" className="group flex flex-col items-center text-center gap-4 p-4 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black">
              <div className="p-3 border-2 border-black group-hover:border-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5.25A2.25 2.25 0 0 1 4.25 3h15.5A2.25 2.25 0 0 1 22 5.25V9"/><path d="M22 15v3.75A2.25 2.25 0 0 1 19.75 21H4.25A2.25 2.25 0 0 1 2 18.75V15"/><rect width="20" height="6" x="2" y="9" rx="2"/></svg>
              </div>
              <div className="space-y-1">
                <span className="block font-serif text-lg italic tracking-tight">Quick Book</span>
                <span className="block font-mono text-[9px] uppercase tracking-widest opacity-60 group-hover:opacity-100">Direct Entry</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black -translate-x-2 -translate-y-2"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-black translate-x-2 -translate-y-2"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-black -translate-x-2 translate-y-2"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-black translate-x-2 translate-y-2"></div>
      </div>
    </section>
  );
};

export default QuickMenuSection;
