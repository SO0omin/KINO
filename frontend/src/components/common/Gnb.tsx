import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, Search, Calendar, User } from "lucide-react";

export const Gnb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, name, logout } = useAuth();

  // 메인 네비게이션 링크 데이터
  const mainNavLinks = [
    { label: "영화", path: "/movie-list" },
    { label: "예매", path: "/ticketing" }, // 기존 TICKETING 라우트 연결
    { label: "상영시간표", path: "/timetables" },
    { label: "극장", path: "/theater-list" },
    { label: "스토어", path: "/store" },
    { label: "혜택", path: "/benefits" },
  ];

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
  };

  return (
    <div className="w-full relative z-50">
      {/* Top Bar (최상단 유틸리티 메뉴) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-2 flex justify-between items-center text-sm text-gray-600">
          {/* 좌측 메뉴 */}
          <div className="flex gap-6">
            <Link to="/vip" className="hover:text-[#eb4d32] transition-colors">VIP LOUNGE</Link>
            <Link to="/membership" className="hover:text-[#eb4d32] transition-colors">멤버십</Link>
            <Link to="/cs" className="hover:text-[#eb4d32] transition-colors">고객센터</Link>
          </div>
          
          {/* 우측 메뉴 (인증 상태에 따라 변경) */}
          <div className="flex gap-6 items-center">
            {isLoggedIn ? (
              <>
                <span className="font-medium text-black">{name}님, 환영합니다!</span>
                <button onClick={handleLogout} className="hover:text-[#eb4d32] transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#eb4d32] transition-colors">로그인</Link>
                <Link to="/signup" className="hover:text-[#eb4d32] transition-colors">회원가입</Link>
              </>
            )}
            <Link to="/ticketing" className="hover:text-[#eb4d32] transition-colors font-medium">
              빠른예매
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation (메인 헤더 및 네비게이션) */}
      <header className="bg-white border-b-2 border-gray-300">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          
          {/* 로고 및 아이콘 영역 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-gray-800">
              <button className="hover:text-[#eb4d32] transition-colors">
                <Menu size={24} />
              </button>
              <button className="hover:text-[#eb4d32] transition-colors">
                <Search size={24} />
              </button>
            </div>
            
            {/* 중앙 로고 */}
            <Link to="/" className="text-4xl font-black text-[#eb4d32] tracking-tighter">
              KINO
            </Link>
            
            <div className="flex items-center gap-4 text-gray-800">
              <button className="hover:text-[#eb4d32] transition-colors">
                <Calendar size={24} />
              </button>
              {/* 유저 아이콘 클릭 시 로그인 여부에 따라 마이페이지 또는 로그인 창으로 이동 */}
              <Link to={isLoggedIn ? "/my-page" : "/login"} className="hover:text-[#eb4d32] transition-colors">
                <User size={24} />
              </Link>
            </div>
          </div>

          {/* 메인 메뉴 라우팅 영역 */}
          <nav className="flex justify-center gap-12 text-lg font-medium text-gray-800 mt-2">
            {mainNavLinks.map((link) => {
              // 현재 경로와 일치하면 색상 강조 (Active 처리)
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#eb4d32] font-bold" : "hover:text-[#eb4d32]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

        </div>
      </header>
    </div>
  );
};

export default Gnb;