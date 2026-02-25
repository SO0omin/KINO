import React from 'react';
import { Link } from 'react-router-dom';

const QuickMenuSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="w-full bg-[#111] border border-white/5 py-7 px-12 flex items-center justify-between shadow-2xl shadow-black/50">
        
        {/* 1. 영화 검색 (왼쪽) */}
        <div className="flex-[0.8] relative group">
          <input 
            type="text" 
            placeholder="영화명을 입력해 주세요" 
            className="w-full bg-transparent border-b border-zinc-800 py-2 pl-2 pr-10 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-purple-600 transition-all font-medium"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-purple-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>

        {/* 세로 구분선 (더 시크하게 짧게) */}
        <div className="h-6 w-px bg-white/5 mx-16 hidden md:block" />

        {/* 2. 메뉴 아이콘들 (오른쪽) */}
        <div className="flex-1 flex items-center justify-between">
          
          <Link to="/schedule" className="group flex items-center gap-4">
            <div className="text-zinc-500 group-hover:text-purple-500 transition-all group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span className="text-xs font-black italic uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">상영시간표</span>
          </Link>

          <div className="h-3 w-px bg-white/10" />

          <Link to="/boxoffice" className="group flex items-center gap-4">
            <div className="text-zinc-500 group-hover:text-purple-500 transition-all group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><line x1="7" y1="3" x2="7" y2="18"/><line x1="17" y1="3" x2="17" y2="18"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="12" x2="22" y2="12"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
            </div>
            <span className="text-xs font-black italic uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">박스오피스</span>
          </Link>

          <div className="h-3 w-px bg-white/10" />

          <Link to="/ticketing" className="group flex items-center gap-4">
            <div className="text-zinc-500 group-hover:text-purple-500 transition-all group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5.25A2.25 2.25 0 0 1 4.25 3h15.5A2.25 2.25 0 0 1 22 5.25V9"/><path d="M22 15v3.75A2.25 2.25 0 0 1 19.75 21H4.25A2.25 2.25 0 0 1 2 18.75V15"/><rect width="20" height="6" x="2" y="9" rx="2"/></svg>
            </div>
            <span className="text-xs font-black italic uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">빠른예매</span>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default QuickMenuSection;