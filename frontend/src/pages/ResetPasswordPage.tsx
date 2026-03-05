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

  // 1. 접속하자마자 URL 주소창에서 '?token=...' 값을 훔쳐옵니다.
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
    if (newPassword.length < 4) {
      showAlert("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      // 💡 주소창에서 뽑아온 토큰과 새 비밀번호를 백엔드로 전송!
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

  const inputClass = `w-full border-[3px] border-black px-4 py-3 text-sm font-bold font-mono bg-white shadow-[4px_4px_0_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all`;
  const btnClass = `w-full bg-[#eb4d32] text-white border-[3px] border-black py-4 text-lg font-bold font-serif italic uppercase shadow-[6px_6px_0_0_#000] hover:bg-black hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all mt-4`;

  return (
    <div className="bg-[#f4f1ea] min-h-screen flex items-center justify-center p-6 paper-texture">
      <div className="max-w-md w-full bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000] p-8">
        
        <div className="text-center mb-8">
          <h2 className="font-serif italic text-3xl uppercase mb-2">New Password</h2>
          <p className="font-mono text-xs text-gray-500 font-bold border-b-2 border-dashed border-gray-300 pb-4">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-xs uppercase font-mono">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              className={inputClass} 
              placeholder="새 비밀번호" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xs uppercase font-mono">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className={inputClass} 
              placeholder="새 비밀번호 확인" 
            />
          </div>

          <button type="submit" className={btnClass}>
            Change Password
          </button>
        </form>

      </div>

      <CommonModal isOpen={isAlertOpen} onClose={handleCloseModal}>
        <div className="bg-white border-[4px] border-black p-6 max-w-sm w-full mx-auto shadow-[8px_8px_0_0_#000]">
          <h3 className="text-xl font-bold font-serif italic uppercase mb-2 border-b-2 border-black pb-2">Notice</h3>
          <p className="font-mono text-sm font-bold my-6 whitespace-pre-line leading-relaxed">{alertMessage}</p>
          <button onClick={handleCloseModal} className="w-full bg-black text-white font-mono font-bold py-3 uppercase hover:bg-[#eb4d32] transition-colors">
            Confirm
          </button>
        </div>
      </CommonModal>
    </div>
  );
};

export default ResetPasswordPage;