import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Film, Ticket } from 'lucide-react';

const QuickMenuSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 relative z-40 -mt-20">
      <div className="bg-white border border-black/5 p-1 shadow-2xl rounded-sm">
        <div className="bg-[#FDFDFD] p-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* 1. Search - Modern Sleek Style */}
          <div className="flex-1 w-full relative group">
            <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-4">Search Archive</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="ENTER TITLE..." 
                className="w-full bg-black/5 border border-black/10 py-4 pl-6 pr-14 font-sans text-sm text-[#1A1A1A] placeholder:text-black/20 focus:outline-none focus:border-[#B91C1C] transition-all uppercase tracking-widest rounded-sm"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#B91C1C] transition-colors">
                <Search size={22} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px h-24 bg-black/10 mx-4" />

          {/* 2. Quick Links - Modern Grid Style */}
          <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <Link to="/ticketing" className="group flex items-center gap-6 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] shadow-lg">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Schedule</span>
                <span className="block font-sans text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-white/80">Daily Manifest</span>
              </div>
            </Link>

            <Link to="/boxoffice" className="group flex items-center gap-6 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] shadow-lg">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Film size={24} strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Box Office</span>
                <span className="block font-sans text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-white/80">Top Reels</span>
              </div>
            </Link>

            <Link to="/ticketing" className="group flex items-center gap-6 p-6 bg-black/5 hover:bg-[#B91C1C] transition-all duration-300 rounded-sm border border-black/5 hover:border-[#B91C1C] shadow-lg">
              <div className="p-3 bg-black/10 group-hover:bg-white/20 rounded-sm transition-colors text-[#1A1A1A] group-hover:text-white">
                <Ticket size={24} strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <span className="block font-display text-xl uppercase tracking-tight text-[#1A1A1A] group-hover:text-white">Quick Book</span>
                <span className="block font-sans text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-white/80">Direct Entry</span>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickMenuSection;
