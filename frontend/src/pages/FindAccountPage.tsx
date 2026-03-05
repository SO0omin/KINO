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

  // 💡 메일 발송 중일 때 보여줄 로딩 상태 추가
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
    setIsLoading(true); // 메일 발송 로딩 켜기

    try {
      // 💡 백엔드가 메일을 보내고 올 때까지 기다립니다.
      await axios.post('/api/auth/reset-password-request', {
        username: formData.username,
        email: formData.email
      });
      
      setIsLoading(false);
      showAlert(`입력하신 이메일로 임시 비밀번호가 발송되었습니다.\n로그인 후 반드시 비밀번호를 변경해주세요.`, () => {
        navigate('/login');
      });
    } catch (error: any) {
      setIsLoading(false);
      showAlert(error.response?.data?.error || "입력하신 정보와 일치하는 계정이 없습니다.");
    }
  };

  // 💡 로그인/회원가입 페이지와 동일한 인풋 스타일 적용
  const inputClass = "w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32] transition-colors bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex flex-col items-center pt-20 pb-20 font-mono">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">계정 찾기</h1>
        <p className="text-gray-600">가입 시 입력한 정보를 정확히 입력해 주세요.</p>
      </div>

      <div className="flex w-full max-w-[400px] mb-6">
        <button 
          type="button"
          onClick={() => setActiveTab('FIND_ID')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'FIND_ID' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          아이디 찾기
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('RESET_PW')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'RESET_PW' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          비밀번호 찾기
        </button>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        
        {activeTab === 'FIND_ID' ? (
          <form onSubmit={handleFindId} className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-in-out]">
            <div>
              <label className={labelClass}>이름</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="가입 시 등록한 실명" />
            </div>
            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="kino@cinema.com" />
            </div>
            <button type="submit" className="w-full bg-[#eb4d32] text-white font-bold py-3 rounded mt-2 hover:bg-[#d4452d] transition-colors">
              아이디 찾기
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPw} className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-in-out]">
            <div>
              <label className={labelClass}>아이디</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputClass} placeholder="찾으실 계정의 아이디" />
            </div>
            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="가입 시 등록한 이메일" />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded mt-2 transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#eb4d32] hover:bg-[#d4452d]'
              } text-white`}
            >
              {isLoading ? '발송 중...' : '임시 비밀번호 발송'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>

      <CommonModal isOpen={isAlertOpen} onClose={handleCloseModal}>
        <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">알림</h3>
          <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">{alertMessage}</p>
          <button onClick={handleCloseModal} className="w-full bg-[#eb4d32] text-white font-bold py-3 rounded hover:bg-[#d4452d] transition-colors">
            확인
          </button>
        </div>
      </CommonModal>
    </div>
  );
};

export default FindAccountPage;