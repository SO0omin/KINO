import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CommonModal } from '../components/CommonModal'; // 기존 모달 컴포넌트 활용

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birth_date: '',
    tel: '',
    email: ''
  });

  // 상태 관리: 중복 체크 여부 및 모달 제어
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'username') setIsUsernameChecked(false); // 아이디 변경 시 중복 체크 초기화
  };

  // 1. 아이디 중복 체크 핸들러
  const handleUsernameCheck = async () => {
    if (!formData.username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.get('/api/auth/check-username', {
        params: {
            username: formData.username
        }
      });
      if (response.data.available) {
        alert("사용 가능한 아이디입니다.");
        setIsUsernameChecked(true);
      } else {
        alert("이미 사용 중인 아이디입니다.");
        setIsUsernameChecked(false);
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("중복 체크 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUsernameChecked) {
      alert("아이디 중복 체크를 진행해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post('/api/auth/signup', formData);
      alert("회원가입이 완료되었습니다.");
      navigate('/login');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;

        // 2. 이메일 중복 시 특정 모달 안내 로직
        if (errorMessage.includes("이메일")) {
          setModalContent({
            title: "가입 정보 확인",
            message: "이미 해당 이메일로 가입된 이력이 있습니다. 로그인 페이지로 이동하시겠습니까?"
          });
          setIsModalOpen(true);
        } else {
          alert(errorMessage);
        }
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  const inputClass = `
    w-full border-[3px] border-black px-4 py-3 text-sm font-bold font-mono 
    bg-white shadow-[4px_4px_0_0_#000] focus:outline-none focus:translate-x-[4px] 
    focus:translate-y-[4px] focus:shadow-none transition-all placeholder:text-black/30
  `;

  // 중복체크 버튼 스타일
  const checkBtnClass = `
    px-4 border-[3px] border-black bg-black text-white font-mono text-xs font-bold 
    uppercase shadow-[4px_4px_0_0_#000] hover:bg-red-700 hover:translate-x-[2px] 
    hover:translate-y-[2px] hover:shadow-none transition-all disabled:bg-gray-400
  `;

  return (
    <div className="bg-[#f4f1ea] min-h-screen flex items-center justify-center p-6 relative paper-texture">
      <div className="max-w-xl w-full bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000] relative z-10">
        <div className="bg-black text-white p-6 text-center border-b-[6px] border-black">
          <p className="font-mono text-xs tracking-[0.3em] text-white/60 mb-2">JOIN THE CLUB</p>
          <h1 className="font-serif italic text-4xl uppercase tracking-tighter">Membership</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 아이디 + 중복체크 버튼 */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">ID (Username)</label>
              <div className="flex gap-4">
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputClass} placeholder="Enter your ID" />
                <button type="button" onClick={handleUsernameCheck} className={checkBtnClass}>Check</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="kino@cinema.com" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="김키노" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Birth Date</label>
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-bold text-xs uppercase tracking-widest font-mono">Telephone</label>
              <input type="tel" name="tel" value={formData.tel} onChange={handleChange} required className={inputClass} placeholder="010-0000-0000" />
            </div>
          </div>

          <div className="mt-8 border-t-2 border-dashed border-black/20 pt-8">
            <button type="submit" className="w-full bg-red-700 text-white border-[4px] border-black py-4 text-xl font-black font-serif italic tracking-widest uppercase shadow-[6px_6px_0_0_#000] hover:bg-black hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all">
              Issue Ticket (Sign Up)
            </button>
          </div>
        </form>
      </div>

      {/* 이메일 중복 안내 모달 */}
      <CommonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="font-serif italic text-2xl mb-4">{modalContent.title}</h2>
          <p className="font-mono text-sm mb-6">{modalContent.message}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="flex-1 bg-black text-white py-2 font-mono text-xs uppercase border-2 border-black"
            >
              로그인으로 이동
            </button>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="flex-1 bg-white text-black py-2 font-mono text-xs uppercase border-2 border-black"
            >
              닫기
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default SignupPage;