import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from "axios";
import { CommonModal } from '../components/common/CommonModal';
import { useAuth } from '../contexts/AuthContext';
// 💡 카카오, 네이버, 구글 인증 URL을 한 곳에서 관리하는 것을 추천합니다.
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

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => setIsAlertOpen(false);

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
        setAlertMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsAlertOpen(true);
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
        setAlertMessage(errMsg);
        setIsAlertOpen(true);
      }
    }
  };

  return (
    <div className="min-h-auto bg-[#fdf4e3] flex flex-col items-center pt-20 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isBookingFlow ? '예매하기' : '로그인'}
        </h1>
        <p className="text-gray-600">
          {isBookingFlow 
            ? '로그인 혹은 비회원 정보를 입력해주세요.' 
            : '서비스 이용을 위해 로그인이 필요합니다.'}
        </p>
      </div>

      <div className="flex w-full max-w-[500px] mb-6">
        <button 
          type="button"
          onClick={() => setActiveTab('MEMBER')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'MEMBER' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          회원 로그인
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('GUEST')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'GUEST' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          비회원 로그인
        </button>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {activeTab === 'MEMBER' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
              <input type="text" name="username" value={formData.username} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32] transition-colors" 
                placeholder="아이디" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32] transition-colors" 
                placeholder="비밀번호" />
            </div>
          )}

          {activeTab === 'GUEST' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
              <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                placeholder="이름" />
              <input type="tel" name="guestTel" value={formData.guestTel} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                placeholder="휴대폰 번호 (- 제외)" />
              <input type="password" name="guestPassword" value={formData.guestPassword} onChange={handleChange} required maxLength={4}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                placeholder="예매용 비밀번호 (숫자 4자리)" />
            </div>
          )}

          <div className="mt-2 flex flex-col gap-4">
            <button 
              type="submit" 
              className={`w-full text-white font-bold py-3 rounded transition-colors ${
                activeTab === 'MEMBER' ? 'bg-[#eb4d32] hover:bg-[#d4452d]' : 'bg-gray-800 hover:bg-black'
              }`}
            >
              {activeTab === 'MEMBER' ? '로그인' : (isBookingFlow ? '비회원 예매 진행' : '예매 내역 조회')}
            </button>
            
            {/* 💡 소셜 로그인 버튼 영역 */}
            {activeTab === 'MEMBER' && (
              <div className="flex flex-col items-center mt-8 px-4 w-full">
                {/* 구분선 (빈티지 시네마 스타일) */}
                <div className="relative flex w-full max-w-sm py-2 items-center mb-6">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-mono tracking-[0.2em] uppercase">
                    SNS Login
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                {/* 아이콘 버튼 컨테이너 */}
                <div className="flex items-center justify-center gap-10">
                  
                  {/* 1. 카카오 */}
                  <button 
                    type="button"
                    onClick={() => window.location.href = KAKAO_AUTH_URL}
                    className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <div className="w-11 h-11 flex items-center justify-center">
                      <img 
                        src="/src/assets/kakao_login_btn.png" 
                        alt="Kakao" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Kakao</span>
                  </button>

                  {/* 2. 네이버 */}
                  <button 
                    type="button"
                    onClick={() => window.location.href = NAVER_AUTH_URL}
                    className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <div className="w-11 h-11 flex items-center justify-center">
                      <img 
                        src="/src/assets/naver_login_btn.png" 
                        alt="Naver" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Naver</span>
                  </button>

                  {/* 3. 구글 (이미지 버전) */}
                  <button 
                    type="button"
                    onClick={() => window.location.href = GOOGLE_AUTH_URL}
                    className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <div className="w-11 h-11 flex items-center justify-center">
                      <img 
                        src="/src/assets/google_login_btn.png" 
                        alt="Google" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Google</span>
                  </button>

                </div>
              </div>
            )}

            {activeTab === 'MEMBER' && (
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-2">
                <Link to="/find-account" className="hover:text-gray-800 transition-colors">아이디/비밀번호 찾기</Link>
                <span>|</span>
                <Link to="/signup" className="hover:text-gray-800 transition-colors">회원가입</Link>
              </div>
            )}
            {activeTab === 'GUEST' && (
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-2">
                <Link to="/signup" className="hover:text-gray-800 transition-colors">비회원 회원가입</Link>
              </div>
            )}
          </div>
        </form>
      </div>

      <CommonModal isOpen={isAlertOpen} onClose={handleCloseModal}>
        <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">알림</h3>
          <p className="text-gray-600 mb-6">{alertMessage}</p>
          <button 
            onClick={handleCloseModal} 
            className="w-full bg-[#eb4d32] text-white font-bold py-3 rounded hover:bg-[#d4452d] transition-colors"
          >
            확인
          </button>
        </div>
      </CommonModal>
    </div>
  );
};

export default LoginPage;
