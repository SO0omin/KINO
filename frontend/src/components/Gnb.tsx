import React from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { useAuth }from "../contexts/AuthContext";
//import { api } from "../api/axiosInstance";

const Gnb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, name, logout } = useAuth();

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "TICKETING", path: "/ticketing" },
    //{ label: "SEAT BOOKING", path: "/seat-booking" },
  ];

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout(); 
    alert("로그아웃 되었습니다.");
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
  };

  return (
    // 예매 페이지의 배경색(#f4f1ea)과 굵은 하단 테두리 적용
    <nav className="bg-[#f4f1ea] border-b-[6px] border-black relative z-50">
      <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
        
        {/* 좌측 로고: 이후에 로고 이미지로 교체*/}
        <Link to="/" className="font-serif italic text-4xl font-black tracking-tighter uppercase text-black hover:opacity-70 transition-opacity">
          KINO 
        </Link>

        {/* 우측 메뉴: 예매 페이지의 버튼 스타일(그림자 + 클릭 시 눌리는 효과) 차용 */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  font-mono text-xs font-bold uppercase tracking-[0.2em] 
                  border-2 border-black px-5 py-2 transition-all duration-200
                  ${isActive 
                    ? "bg-black text-white shadow-none translate-x-[4px] translate-y-[4px]" // 활성화된 메뉴는 눌린 상태
                    : "bg-white text-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]" // 기본 상태 & 호버
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* 구분선 */}
          <div className="w-px h-8 bg-black/20 mx-2"></div>

          {isLoggedIn ? ( //로그인 후
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black/80">
                안녕하세요, {name}님!
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-xs font-bold uppercase tracking-[0.2em] border-2 border-black px-5 py-2 bg-white text-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
              >
                LOGOUT
              </button>
            </div>
          ) : ( // 로그인 전
            <>
              <Link
                to="/signup"
                className="font-mono text-xs font-bold uppercase tracking-[0.2em] border-2 border-black px-5 py-2 bg-white text-black shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
              >
                SIGNUP
              </Link>
              <Link
                to="/login"
                className="font-mono text-xs font-bold uppercase tracking-[0.2em] border-2 border-black px-5 py-2 bg-red-700 text-white shadow-[4px_4px_0_0_#000] hover:bg-black hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
              >
                LOGIN
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Gnb;