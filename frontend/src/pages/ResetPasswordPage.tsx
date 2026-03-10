import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CommonModal } from '../components/common/CommonModal';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onModalClose, setOnModalClose] = useState<(() => void) | null>(null);

  // 1. 접속하자마자 URL 주소창에서 '?token=...' 값을 가져옵니다.
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get('token');
    
    if (!urlToken) {
      showAlert("유효하지 않은 접근입니다. 올바른 링크로 접속해주세요.", () => {
        navigate('/login');
      });
    } else {
      setToken(urlToken);
    }
  }, [location, navigate]);

  const showAlert = (msg: string, callback?: () => void) => {
    setAlertMessage(msg);
    setOnModalClose(() => callback || null);
    setIsAlertOpen(true);
  };

  const handleCloseModal = () => {
    setIsAlertOpen(false);
    if (onModalClose) onModalClose();
  };

  // 2. 폼 제출 로직
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showAlert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) { // 💡 Kino Cinema 기준에 맞춰 최소 8자로 안내
      showAlert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      showAlert("비밀번호가 성공적으로 변경되었습니다.\n새로운 비밀번호로 로그인해주세요!", () => {
        navigate('/login');
      });
    } catch (error: any) {
      showAlert(error.response?.data?.error || "비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.");
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
            Reset <span className="text-white/20">Password</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            새로운 비밀번호를 설정해주세요
          </p>
        </div>
      </div>

      {/* 폼 컨테이너 */}
      <div className="max-w-[500px] mx-auto px-6">
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
          
          <div className="bg-black/5 border border-black/5 rounded-sm p-5 text-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-2">Notice</h3>
            <p className="text-[11px] font-bold text-black/60 leading-relaxed">
              안전한 서비스 이용을 위해<br/>
              영문, 숫자, 특수문자를 조합하여 설정해 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                className={inputClass} 
                placeholder="새 비밀번호 입력" 
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className={inputClass} 
                placeholder="새 비밀번호 재입력" 
              />
              {/* 비밀번호 일치 실시간 피드백 */}
              {confirmPassword.length > 0 && (
                <div className="mt-2 px-1">
                  {newPassword === confirmPassword ? (
                    <p className="text-[#03C75A] text-[10px] font-bold uppercase tracking-widest">
                      ✓ 비밀번호가 일치합니다
                    </p>
                  ) : (
                    <p className="text-[#B91C1C] text-[10px] font-bold uppercase tracking-widest">
                      ✘ 비밀번호가 일치하지 않습니다
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-black/5 pt-6">
              <button 
                type="submit" 
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Change Password
              </button>
            </div>
          </form>
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

export default ResetPasswordPage;