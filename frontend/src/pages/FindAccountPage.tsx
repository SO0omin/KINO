import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonModal } from '../components/common/CommonModal';
import axios from 'axios';

type TabType = 'FIND_ID' | 'RESET_PW';

const FindAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('FIND_ID');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '', 
  });

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onModalClose, setOnModalClose] = useState<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (msg: string, callback?: () => void) => {
    setAlertMessage(msg);
    setOnModalClose(() => callback || null); 
    setIsAlertOpen(true);
  };

  const handleCloseModal = () => {
    setIsAlertOpen(false);
    if (onModalClose) {
      onModalClose(); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/find-id', {
        name: formData.name,
        email: formData.email
      });
      showAlert(`회원님의 아이디는 [ ${response.data.username} ] 입니다.`);
    } catch (error: any) {
      showAlert(error.response?.data?.error || "일치하는 회원 정보가 없습니다.");
    }
  };

  const handleResetPw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password-request', {
        username: formData.username,
        email: formData.email
      });
      
      setIsLoading(false);
      showAlert(`입력하신 이메일로 비밀번호 재설정 링크가 발송되었습니다.\n메일을 확인해 주세요.`, () => {
        navigate('/login');
      });
    } catch (error: any) {
      setIsLoading(false);
      showAlert(error.response?.data?.error || "입력하신 정보와 일치하는 계정이 없습니다.");
    }
  };

  // 💡 Kino Cinema 공통 인풋/라벨 스타일
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
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#B91C1C]"></div>
            <p className="font-sans text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
            <div className="h-px w-12 bg-[#B91C1C]"></div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-4">
            Find <span className="text-white/20">Account</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            아이디 또는 비밀번호 찾기
          </p>
        </div>
      </div>

      <div className="max-w-[500px] mx-auto px-6">
        
        {/* 탭 버튼 영역 */}
        <div className="flex mb-8 border-b border-black/10">
          <button 
            type="button"
            onClick={() => setActiveTab('FIND_ID')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'FIND_ID' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Find ID
            {activeTab === 'FIND_ID' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('RESET_PW')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'RESET_PW' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Reset PW
            {activeTab === 'RESET_PW' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
        </div>

        {/* 폼 컨테이너 */}
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
          
          <div className="bg-black/5 border border-black/5 rounded-sm p-5 text-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-2">Notice</h3>
            <p className="text-[11px] font-bold text-black/60 leading-relaxed">
              가입 시 입력하신 정보를 정확히 입력해 주세요.
            </p>
          </div>

          {activeTab === 'FIND_ID' ? (
            <form onSubmit={handleFindId} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                  className={inputClass} placeholder="가입 시 등록한 성함" />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className={inputClass} placeholder="kino@cinema.com" />
              </div>
              <div className="mt-4 border-t border-black/5 pt-6">
                <button type="submit" 
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Find My ID
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPw} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className={labelClass}>User ID</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required 
                  className={inputClass} placeholder="찾으실 계정의 아이디" />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                  className={inputClass} placeholder="가입 시 등록한 이메일" />
              </div>
              <div className="mt-4 border-t border-black/5 pt-6">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isLoading 
                      ? 'bg-black/5 text-black/20 cursor-not-allowed' 
                      : 'bg-[#1A1A1A] text-white shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? 'Requesting...' : 'Request Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-black/5 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Kino 테마 공통 모달 */}
      <CommonModal isOpen={isAlertOpen} onClose={handleCloseModal}>
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden min-w-[320px]">
          <div className="bg-[#B91C1C] text-white px-6 py-4 flex items-center justify-center border-b border-[#991B1B]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Notice</h3>
          </div>
          <div className="p-8 flex flex-col items-center">
            <p className="text-sm font-medium text-[#1A1A1A] text-center mb-8 leading-relaxed whitespace-pre-line">
              {alertMessage}
            </p>
            <button 
              onClick={handleCloseModal} 
              className="w-full bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm hover:bg-[#B91C1C] transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default FindAccountPage;