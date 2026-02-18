import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type TabType = 'FIND_ID' | 'RESET_PW';

const FindAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('FIND_ID');

  // 1. 입력 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '', // PW 찾기 시 필요
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. ID 찾기 제출 핸들러
  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 실무에서는 보통 GET이나 POST로 이름/이메일을 보내 아이디 일부를 가려서 보여줍니다.
      const response = await axios.post('/api/auth/find-id', {
        name: formData.name,
        email: formData.email
      });
      alert(`찾으시는 아이디는 [ ${response.data.username} ] 입니다.`);
    } catch (error: any) {
      alert(error.response?.data?.error || "일치하는 회원 정보가 없습니다.");
    }
  };

  // 3. 비밀번호 재설정 요청 핸들러
  const handleResetPw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 실무에서는 보안상 새 PW를 바로 주지 않고, 이메일로 임시 비밀번호나 링크를 발송합니다.
      const response = await axios.post('/api/auth/reset-password', {
        username: formData.username,
        email: formData.email
      });
      alert("입력하신 이메일로 임시 비밀번호가 발송되었습니다.");
      alert(response.data.tempPw);
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.error || "정보가 일치하지 않습니다.");
    }
  };

  // 공통 스타일
  const inputClass = `w-full border-[3px] border-black px-4 py-3 text-sm font-bold font-mono bg-white shadow-[4px_4px_0_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all`;
  const btnClass = `w-full bg-black text-white border-[3px] border-black py-4 text-lg font-bold font-serif italic uppercase shadow-[6px_6px_0_0_#000] hover:bg-red-700 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all mt-4`;

  return (
    <div className="bg-[#f4f1ea] min-h-screen flex items-center justify-center p-6 paper-texture">
      <div className="max-w-md w-full bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000]">
        
        {/* 상단 탭 스위치 */}
        <div className="flex border-b-[6px] border-black">
          <button
            onClick={() => setActiveTab('FIND_ID')}
            className={`flex-1 py-4 font-mono text-sm font-black tracking-tighter uppercase transition-all ${
              activeTab === 'FIND_ID' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Find ID
          </button>
          <button
            onClick={() => setActiveTab('RESET_PW')}
            className={`flex-1 py-4 font-mono text-sm font-black tracking-tighter uppercase transition-all ${
              activeTab === 'RESET_PW' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Reset PW
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'FIND_ID' ? (
            /* ID 찾기 폼 */
            <form onSubmit={handleFindId} className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h2 className="font-serif italic text-2xl uppercase">Lost your ID?</h2>
                <p className="font-mono text-[10px] text-gray-500 mt-1">ENTER YOUR REGISTERED INFO</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase font-mono">Full Name</label>
                <input type="text" name="name" onChange={handleChange} required className={inputClass} placeholder="이름을 입력하세요" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase font-mono">Email Address</label>
                <input type="email" name="email" onChange={handleChange} required className={inputClass} placeholder="kino@example.com" />
              </div>
              <button type="submit" className={btnClass}>Retrieve ID</button>
            </form>
          ) : (
            /* 비밀번호 재설정 폼 */
            <form onSubmit={handleResetPw} className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h2 className="font-serif italic text-2xl uppercase">Forgot PW?</h2>
                <p className="font-mono text-[10px] text-gray-500 mt-1">WE'LL SEND A TEMPORARY KEY</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase font-mono">Username (ID)</label>
                <input type="text" name="username" onChange={handleChange} required className={inputClass} placeholder="아이디를 입력하세요" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase font-mono">Email Address</label>
                <input type="email" name="email" onChange={handleChange} required className={inputClass} placeholder="가입 시 이메일" />
              </div>
              <button type="submit" className={btnClass}>Send Temp PW</button>
            </form>
          )}

          {/* 하단 보조 링크 */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-black/20 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="font-mono text-xs font-bold hover:text-red-700 underline underline-offset-4"
            >
              BACK TO BOX OFFICE (LOGIN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindAccountPage;