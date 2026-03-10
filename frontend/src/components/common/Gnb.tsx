import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Search, User, X } from "lucide-react";

export const Gnb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isGuest, name, logout } = useAuth();

  // 검색창 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const mainNavLinks = [
    { label: "영화", path: "/movie-list" },
    { label: "예매", path: "/ticketing" },
    { label: "상영시간표", path: "/timetables" },
    { label: "극장", path: "/theater-list" },
  ];

  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    navigate("/"); 
  };

  // 검색 실행 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate('/movie-list', { state: { keyword } });
    setIsSearchOpen(false); // 검색 후 창 닫기
    setKeyword(""); // 검색어 초기화
  };

  return (
    <nav className="w-full relative z-50 bg-white border-b border-black/5 font-sans">
      
      {/* 1. 최상단 유틸리티 메뉴 */}
      <div className="w-full border-b border-black/5 bg-[#FDFDFD]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/40">
          <div /> {/* 좌측 여백 */}
          <div className="flex gap-6 items-center">
            {isLoggedIn || isGuest ? (
              <>
                <span className="text-[#1A1A1A]">
                  {name}님 {isGuest && <span className="text-[#B91C1C]">(비회원)</span>} 환영합니다!
                </span>
                <button onClick={handleLogout} className="hover:text-[#B91C1C] transition-colors">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#1A1A1A] transition-colors">로그인</Link>
                <Link to="/signup" className="hover:text-[#1A1A1A] transition-colors">회원가입</Link>
              </>
            )}
            <Link to="/ticketing" className="hover:text-[#B91C1C] transition-colors">
              빠른예매
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 메인 네비게이션 헤더 */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-24 flex items-center justify-between bg-white relative z-20">
        
        {/* 로고 영역 */}
        <Link to="/" className="flex flex-col leading-none cursor-pointer" onClick={() => setIsSearchOpen(false)}>
          <span className="font-display text-4xl tracking-tighter text-[#B91C1C] uppercase">Kino</span>
          <span className="font-bold text-[10px] tracking-[0.5em] text-black/20 ml-1">ARCHIVE</span>
        </Link>

        {/* 중앙 라우팅 링크 */}
        <div className="hidden md:flex items-center gap-12">
          {mainNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.label} 
                to={link.path} 
                onClick={() => setIsSearchOpen(false)}
                className={`text-sm font-bold tracking-widest transition-colors relative group ${
                  isActive ? 'text-[#1A1A1A]' : 'text-black/40 hover:text-[#1A1A1A]'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#B91C1C] transition-all group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`}></span>
              </Link>
            );
          })}
        </div>

        {/* 우측 아이콘 영역: 검색 & 마이페이지 (레드 포인트) */}
        <div className="flex items-center gap-6">
          {/* 검색 토글 버튼 */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-[#B91C1C] hover:text-[#991B1B] hover:scale-110 transition-all duration-300"
            title="영화 검색"
          >
            {isSearchOpen ? <X size={28} strokeWidth={2.5} /> : <Search size={26} strokeWidth={2.5} />}
          </button>

          {/* 마이페이지 링크 */}
          <Link 
            to={isGuest ? "/mypage/reservations" : isLoggedIn ? "/mypage" : "/login"}
            onClick={() => setIsSearchOpen(false)}
            title="마이페이지"
            className="text-[#B91C1C] hover:text-[#991B1B] hover:scale-110 transition-all duration-300"
          >
            <User size={28} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* 3. 숨겨진 드롭다운 검색창 패널 */}
      <div 
        className={`absolute top-full left-0 w-full bg-[#FDFDFD] border-b border-black/5 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden z-10 ${
          isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색할 영화 제목을 입력하세요..." 
              className="w-full bg-white border border-black/10 py-5 pl-6 pr-16 font-sans text-base text-[#1A1A1A] placeholder:text-black/20 focus:outline-none focus:border-[#B91C1C] transition-all rounded-sm shadow-inner"
            />
            <button 
              type="submit" 
              className="absolute right-5 text-[#B91C1C] hover:scale-110 transition-transform"
            >
              <Search size={26} strokeWidth={3} />
            </button>
          </form>
        </div>
      </div>

    </nav>
  );
};

export default Gnb;