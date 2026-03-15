import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from "axios";
import { CommonModal } from '../components/common/CommonModal';
import { useAuth } from '../contexts/AuthContext';
import { cinemaAlert } from '../utils/alert';
import { KAKAO_AUTH_URL, NAVER_AUTH_URL, GOOGLE_AUTH_URL } from '../constants/socialAuth'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, guestLogin } = useAuth();

  const returnTo = location.state?.returnTo || '/';
  const isBookingFlow = !!location.state?.returnTo;

  const [activeTab, setActiveTab] = useState<'MEMBER' | 'GUEST'>('MEMBER');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    guestName: '',
    guestTel: '',
    guestPassword: '',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [Message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'MEMBER') {
      try {
        const response = await axios.post('/api/auth/login', {
          username: formData.username,
          password: formData.password
        });
        
        const { token, username, name, memberId } = response.data; 
        login(token, username, name, memberId);
        navigate(returnTo, { state: location.state }); 
      } catch (error) {
        cinemaAlert("아이디 또는 비밀번호가 일치하지 않습니다.", "알림");
      }
    } 
    else {
      try {
        const payload = {
          name: formData.guestName,
          tel: formData.guestTel,
          password: formData.guestPassword
        };
        const response = await axios.post('/api/auth/guest-login', payload);
        const { token, guestId, name } = response.data;
        
        guestLogin(token, guestId, name);
        navigate(`/mypage/reservations?guestId=${guestId}`, { replace: true }); 

      } catch (error: any) {
        const errMsg = error.response?.data?.error || "비회원 정보가 일치하지 않거나 등록되지 않았습니다.";
        cinemaAlert(errMsg, "알림");
      }
    }
  };

  // 💡 공통 인풋/라벨 스타일
  const inputClass = "w-full border border-black/10 rounded-sm p-4 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20 bg-white";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2";

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#B91C1C] selection:text-white pb-20">
      
      {/* Header Area */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-16 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-sans text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-4xl md:text-4xl uppercase tracking-tighter leading-none">
              {isBookingFlow ? (
                <>Ticket <span className="text-white/20">Booking</span></>
              ) : (
                <>Log <span className="text-white/20">In</span></>
              )}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              {isBookingFlow ? '예매 진행을 위해 로그인해주세요' : '서비스 이용을 위해 로그인해주세요'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[500px] mx-auto px-6">
        
        {/* 탭 버튼 영역 */}
        <div className="flex mb-8 border-b border-black/10">
          <button 
            type="button"
            onClick={() => setActiveTab('MEMBER')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'MEMBER' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Member
            {activeTab === 'MEMBER' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('GUEST')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'GUEST' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Guest
            {activeTab === 'GUEST' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
        </div>

        {/* 폼 컨테이너 */}
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {activeTab === 'MEMBER' && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>User ID</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} required 
                    className={inputClass} placeholder="아이디" />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required 
                    className={inputClass} placeholder="비밀번호" />
                </div>
              </div>
            )}

            {activeTab === 'GUEST' && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required 
                    className={inputClass} placeholder="이름" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="guestTel" value={formData.guestTel} onChange={handleChange} required 
                    className={inputClass} placeholder="010-0000-0000 (- 제외)" />
                </div>
                <div>
                  <label className={labelClass}>Booking Password</label>
                  <input type="password" name="guestPassword" value={formData.guestPassword} onChange={handleChange} required maxLength={4}
                    className={inputClass} placeholder="예매용 비밀번호 (숫자 4자리)" />
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-6">
              <button 
                type="submit" 
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {activeTab === 'MEMBER' ? 'Sign In' : (isBookingFlow ? 'Continue as Guest' : 'Check Guest Booking')}
              </button>
              
              {/* 💡 소셜 로그인 버튼 영역 */}
              {activeTab === 'MEMBER' && (
                <div className="flex flex-col items-center mt-4 w-full">
                  {/* 구분선 */}
                  <div className="flex w-full items-center mb-6">
                    <div className="flex-grow border-t border-black/5"></div>
                    <span className="mx-4 text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">
                      Social Login
                    </span>
                    <div className="flex-grow border-t border-black/5"></div>
                  </div>
                  
                  {/* 아이콘 버튼 컨테이너 */}
                  <div className="flex items-center justify-center gap-8">
                    {/* 카카오 */}
                    <button 
                      type="button"
                      onClick={() => window.location.href = KAKAO_AUTH_URL}
                      className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1 focus:outline-none"
                    >
                      <div className="w-12 h-12 rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden border border-black/5">
                        <img src="/src/assets/kakao_login_btn.png" alt="Kakao" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/20 group-hover:text-[#B91C1C] transition-colors">Kakao</span>
                    </button>

                    {/* 네이버 */}
                    <button 
                      type="button"
                      onClick={() => window.location.href = NAVER_AUTH_URL}
                      className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1 focus:outline-none"
                    >
                      <div className="w-12 h-12 rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden border border-black/5">
                        <img src="/src/assets/naver_login_btn.png" alt="Naver" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/20 group-hover:text-[#B91C1C] transition-colors">Naver</span>
                    </button>

                    {/* 구글 */}
                    <button 
                      type="button"
                      onClick={() => window.location.href = GOOGLE_AUTH_URL}
                      className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1 focus:outline-none"
                    >
                      <div className="w-12 h-12 rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden border border-black/5 bg-white">
                        <img src="/src/assets/google_g_logo.svg" alt="Google" className="h-7 w-7 object-contain" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/20 group-hover:text-[#B91C1C] transition-colors">Google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 하단 링크 영역 */}
              <div className="flex items-center justify-center gap-4 text-[13px] font-bold uppercase tracking-widest text-black/40 mt-4 pt-6 border-t border-black/5">
                {activeTab === 'MEMBER' ? (
                  <>
                    <Link to="/find-account" className="hover:text-[#B91C1C] transition-colors">아이디/비밀번호 찾기</Link>
                    <span className="text-black/20">|</span>
                    <Link to="/signup" className="hover:text-[#B91C1C] transition-colors">회원가입</Link>
                  </>
                ) : (
                  <Link
                    to="/signup"
                    state={{ initialTab: 'GUEST' }}
                    className="hover:text-[#B91C1C] transition-colors"
                  >
                    비회원 등록
                  </Link>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
