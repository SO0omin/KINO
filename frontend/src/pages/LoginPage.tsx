import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from "axios";
import { CommonModal } from '../components/common/CommonModal';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // 💡 핵심: 이전 페이지(좌석 선택창 등)에서 넘겨준 돌아갈 주소가 있는지 확인합니다.
  const returnTo = location.state?.returnTo || '/';
  
  // 만약 예매 진행 중 넘어온 거라면, 비회원 탭의 성격이 '조회'가 아니라 '예매'로 바뀝니다.
  const isBookingFlow = !!location.state?.returnTo;

  // 탭 상태 관리 ('MEMBER' or 'GUEST')
  const [activeTab, setActiveTab] = useState<'MEMBER' | 'GUEST'>('MEMBER');

  // 폼 입력 상태 관리
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    reservationNumber: '', // 비회원 조회용
    guestName: '',
    guestTel: '',
    guestPassword: '',     // 비회원 예매용 (4자리)
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
    
    // 1. 회원 로그인 로직
    if (activeTab === 'MEMBER') {
      try {
        const response = await axios.post('/api/auth/login', {
          username: formData.username,
          password: formData.password
        });
        
        const { token, username, name, memberId } = response.data; 
        login(token, username, name, memberId);

        // 💡 로그인 성공 시, 무조건 메인('/')이 아니라 예매하던 곳으로 돌려보냅니다!
        navigate(returnTo, { state: location.state }); 
      } catch (error) {
        setAlertMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsAlertOpen(true);
      }
    } 
    // 2. 비회원 예매/조회 로직 (백엔드 연결 필요)
    else {
      if (isBookingFlow) {
        // TODO: 비회원 정보 등록 (이름, 폰번호, 비밀번호) API 호출 후 결제창 이동
        alert("비회원 예매 로직은 백엔드 API 연결 후 작동합니다.");
      } else {
        // TODO: 비회원 예매 내역 조회 (예매번호, 이름, 폰번호) API 호출
        alert("비회원 예매 조회 로직은 백엔드 API 연결 후 작동합니다.");
      }
    }
  };

  return (
    <div className="min-h-auto bg-[#fdf4e3] flex flex-col items-center pt-20 pb-20">
      
      {/* 헤더 타이틀 */}
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

      {/* 탭 버튼 영역 */}
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
          {isBookingFlow ? '비회원 예매' : '비회원 예매조회'}
        </button>
      </div>

      {/* 폼 컨테이너 */}
      <div className="w-full max-w-[500px] bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* 회원 탭 */}
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

          {/* 비회원 탭 */}
          {activeTab === 'GUEST' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
              {!isBookingFlow && (
                <input type="text" name="reservationNumber" value={formData.reservationNumber} onChange={handleChange} required 
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                  placeholder="예매번호" />
              )}
              <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                placeholder="이름" />
              <input type="tel" name="guestTel" value={formData.guestTel} onChange={handleChange} required 
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                placeholder="휴대폰 번호 (- 제외)" />
              
              {isBookingFlow && (
                <input type="password" name="guestPassword" value={formData.guestPassword} onChange={handleChange} required maxLength={4}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32]" 
                  placeholder="예매용 비밀번호 (숫자 4자리)" />
              )}
            </div>
          )}

          {/* 하단 버튼 및 링크 */}
          <div className="mt-2 flex flex-col gap-4">
            <button 
              type="submit" 
              className={`w-full text-white font-bold py-3 rounded transition-colors ${
                activeTab === 'MEMBER' ? 'bg-[#eb4d32] hover:bg-[#d4452d]' : 'bg-gray-800 hover:bg-black'
              }`}
            >
              {activeTab === 'MEMBER' ? '로그인' : (isBookingFlow ? '비회원 예매 진행' : '예매 내역 조회')}
            </button>

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

      {/* 모달도 깔끔한 스타일로 변경 */}
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