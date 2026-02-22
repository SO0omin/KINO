import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import { CommonModal } from '../components/CommonModal';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 탭 상태 관리 ('MEMBER' or 'GUEST')
  const [activeTab, setActiveTab] = useState<'MEMBER' | 'GUEST'>('MEMBER');

  // 폼 입력 상태 관리
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    reservationNumber: '',
    guestName: '',
    guestTel: '',
  });

  // 모달 상태
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage] = useState("");
  const [onModalClose] = useState<(() => void) | null>(null);

  /* 커스텀 모달 호출 헬퍼 함수
  const showAlert = (msg: string, callback?: () => void) => {
    setAlertMessage(msg);
    setOnModalClose(() => callback || null);
    setIsAlertOpen(true);
  };*/

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsAlertOpen(false);
    if (onModalClose) {
      onModalClose();
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'MEMBER') {
      try {
        const response = await axios.post('/api/auth/login', formData);
        
        const { token, username, name, memberId } = response.data; 
        
        login(token, username, name, memberId);

        alert(`환영합니다, ${username}님.`);
        navigate('/'); 
      } catch (error) {
        // ...
      }
    }
  };

  // 공통 인풋 스타일
  const inputClass = `
    w-full border-[3px] border-black px-4 py-3 text-sm font-bold font-mono 
    bg-white shadow-[4px_4px_0_0_#000] focus:outline-none focus:translate-x-[4px] 
    focus:translate-y-[4px] focus:shadow-none transition-all placeholder:text-black/30
  `;

  return (
    <div className="bg-[#f4f1ea] min-h-screen flex items-center justify-center p-6 relative paper-texture">
      
      {/* 폼 컨테이너 */}
      <div className="max-w-md w-full bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000] relative z-10 overflow-hidden">
        
        {/* 헤더 영역 */}
        <div className="bg-black text-white p-6 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-white/60 mb-2">BOX OFFICE</p>
          <h1 className="font-serif italic text-4xl uppercase tracking-tighter">
            {activeTab === 'MEMBER' ? 'Member Login' : 'Guest Lookup'}
          </h1>
        </div>

        {/* 탭(Tab) 전환 버튼 영역 */}
        <div className="flex border-y-[4px] border-black bg-white">
          <button 
            type="button"
            onClick={() => setActiveTab('MEMBER')} 
            className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs border-r-[4px] border-black transition-all ${
              activeTab === 'MEMBER' 
                ? 'bg-[#f4f1ea] text-black shadow-[inset_0_-4px_0_0_#b91c1c]'
                : 'bg-white text-black/40 hover:bg-[#f4f1ea] hover:text-black'
            }`}
          >
            회원 로그인
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('GUEST')} 
            className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all ${
              activeTab === 'GUEST' 
                ? 'bg-[#f4f1ea] text-black shadow-[inset_0_-4px_0_0_#b91c1c]'
                : 'bg-white text-black/40 hover:bg-[#f4f1ea] hover:text-black'
            }`}
          >
            비회원 예매조회
          </button>
        </div>

        {/* 입력 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 bg-[#f4f1ea]">
          
          {/* 조건부 렌더링: MEMBER 탭일 때 */}
          {activeTab === 'MEMBER' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-widest font-mono">ID (Username)</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputClass} placeholder="Enter your ID" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-widest font-mono">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
              </div>
            </div>
          )}

          {/* 조건부 렌더링: GUEST 탭일 때 */}
          {activeTab === 'GUEST' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-widest font-mono">Reservation No.</label>
                <input type="text" name="reservationNumber" value={formData.reservationNumber} onChange={handleChange} required className={inputClass} placeholder="예매번호" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-widest font-mono">Guest Name</label>
                <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required className={inputClass} placeholder="예매자 이름" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-widest font-mono">Telephone</label>
                <input type="tel" name="guestTel" value={formData.guestTel} onChange={handleChange} required className={inputClass} placeholder="010-0000-0000" />
              </div>
            </div>
          )}

          {/* 하단 버튼 및 추가 링크 */}
          <div className="mt-4 pt-6 border-t-2 border-dashed border-black/20 flex flex-col gap-4">
            <button 
              type="submit" 
              className="w-full bg-black text-white border-[4px] border-black py-4 text-xl font-black font-serif italic tracking-widest uppercase shadow-[6px_6px_0_0_#000] hover:bg-red-700 hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all"
            >
              {activeTab === 'MEMBER' ? 'Login' : 'Check Ticket'}
            </button>

            {/* 회원가입 유도 링크 (MEMBER 탭일 때만 보여줌) */}
            {activeTab === 'MEMBER' && (
              <div className="mt-4 flex items-center justify-center">
                <Link 
                  to="/find-account" 
                  className="font-mono text-xs font-bold tracking-widest text-red-700 hover:text-black transition-colors underline decoration-2 underline-offset-4"
                >
                  아이디/비밀번호 찾기
                </Link>
              </div>
            )}
          </div>
          
        </form>

      </div>

     {/* 모달 */}
      <CommonModal isOpen={isAlertOpen} onClose={handleCloseModal}>
        <div className="border-[4px] border-black p-6 bg-white shadow-[8px_8px_0_0_#000]">
          <h3 className="font-serif italic text-2xl uppercase font-black mb-4 border-b-2 border-black pb-2">Notice</h3>
          <div className="font-mono text-sm font-bold uppercase tracking-widest mb-6 leading-relaxed text-black/80 whitespace-pre-wrap">
            {alertMessage}
          </div>
          <button 
            onClick={handleCloseModal} 
            className="w-full bg-black text-white font-mono font-bold uppercase py-3 border-2 border-black hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </CommonModal>
    </div>
  );
};

export default LoginPage;