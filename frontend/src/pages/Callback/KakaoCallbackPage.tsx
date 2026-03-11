import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const isProcessed = useRef(false);
  const { login } = useAuth();

  useEffect(() => {
    if (isProcessed.current) return;
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      isProcessed.current = true;

      if (window.opener) {
        window.opener.postMessage({ 
          type: 'SOCIAL_LINK', 
          provider: 'KAKAO', 
          code: code 
        }, window.location.origin);
        window.close(); // 할 일 끝났으니 팝업 닫기
        return; // 밑에 있는 axios(일반 로그인) 실행 안 되게 막기!
      }
      
      axios.post('/api/auth/kakao', { code })
        .then(res => {
          const data = res.data;

          if (data.isRegistered) { //isRegistered는 json으로 넘어올때 is가 제거됨
            // 기존 회원: 토큰 저장하고 메인으로!
            login(data.token, data.username, data.name, data.memberId);
            navigate('/', { replace: true });
          } else {
            // 신규 회원: 카카오 정보를 싸들고 SignupPage로!
            navigate('/signup', { 
              replace: true, 
              state: { 
                name: data.name,
                provider: data.provider,
                providerId: data.providerId,
                username: data.username,
                profileImage: data.profileImage
              } 
            });
          }
        })
        .catch(err => {
          console.error(err);
          cinemaAlert("카카오 로그인 인증에 실패했습니다.","알림");
          navigate('/login', { replace: true });
        });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex flex-col items-center justify-center font-mono">
      <div className="w-16 h-16 border-4 border-t-[#eb4d32] border-black rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-bold text-gray-800 tracking-widest uppercase animate-pulse">
        Authenticating...
      </p>
      <p className="text-sm text-gray-500 mt-2 font-bold">카카오 계정을 확인하고 있습니다.</p>
    </div>
  );
};

export default KakaoCallbackPage;