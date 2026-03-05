import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const isProcessed = useRef(false);
  const { login } = useAuth();

  useEffect(() => {
    if (isProcessed.current) return;
    
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      isProcessed.current = true;
      
      axios.post('/api/auth/google', { code })
        .then(res => {
          const data = res.data;
          
          if (data.isRegistered || data.registered) {
            login(data.token, data.username, data.name, data.memberId);
            navigate('/', { replace: true });
          } else {
            navigate('/signup', { 
              replace: true, 
              state: { 
                provider: data.provider,       // 'GOOGLE'
                providerId: data.providerId,   // 구글 고유 식별자 (sub)
                name: data.name,               // 구글 실명
                username: data.username,       // 임시 생성 아이디
                email: data.email,
                profileImage: data.profileImage,
              } 
            });
          }
        })
        .catch(err => {
          console.error("구글 로그인 에러:", err);
          alert("구글 로그인 인증에 실패했습니다.");
          navigate('/login', { replace: true });
        });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex flex-col items-center justify-center font-mono">
      {/* 💡 구글 파란색(#4285F4) 포인트 */}
      <div className="w-16 h-16 border-4 border-t-[#4285F4] border-black rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-bold text-gray-800 tracking-widest uppercase animate-pulse">
        Authenticating...
      </p>
      <p className="text-sm text-gray-500 mt-2 font-bold">구글 계정을 확인하고 있습니다.</p>
    </div>
  );
};

export default GoogleCallbackPage;