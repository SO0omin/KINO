import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { cinemaAlert } from '../../utils/alert';

const NaverCallbackPage = () => {
  const navigate = useNavigate();
  const isProcessed = useRef(false);
  const { login } = useAuth();

  useEffect(() => {
    // React 18의 StrictMode로 인한 중복 실행 방지
    if (isProcessed.current) return;
    
    // URL에서 code와 state 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      isProcessed.current = true;

      if (window.opener) {
        window.opener.postMessage({ 
          type: 'SOCIAL_LINK', 
          provider: 'NAVER', 
          code: code,
          state: state
        }, window.location.origin);
        window.close(); // 팝업 닫기
        return; // 실행 중단!
      }
      
      // 💡 네이버는 code와 함께 state 값도 필수로 보내야 합니다.
      axios.post('/api/auth/naver', { code, state })
        .then(res => {
          const data = res.data;
          //console.log("네이버 서버 응답 데이터:", data);

          if (data.isRegistered) {
            // 기존 회원: 토큰 저장하고 메인으로 이동
            login(data.token, data.username, data.name, data.memberId);
            navigate('/', { replace: true });
          } else {
            // 신규 회원: 네이버에서 받아온 정보를 들고 회원가입 폼으로 이동
            navigate('/signup', { 
              replace: true, 
              state: { 
                name: data.name,               // 실명
                provider: data.provider,       // 'NAVER'
                providerId: data.providerId,   // 네이버 고유 식별자
                username: data.username,       // 임시 생성된 아이디
                profileImage: data.profileImage,
                tel: data.tel,                 // 💡 네이버에서 가져온 휴대전화번호
                birth_date: data.birth_date    // 💡 네이버에서 가져온 생년월일
              } 
            });
          }
        })
        .catch(err => {
          console.error("네이버 로그인 에러:", err);
          cinemaAlert("네이버 로그인 인증에 실패했습니다.","알림");
          navigate('/login', { replace: true });
        });
    } else {
      // code나 state가 없는 비정상적인 접근일 경우
      cinemaAlert("비정상적인 로그인 접근입니다.","알림");
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex flex-col items-center justify-center font-mono">
      <div className="w-16 h-16 border-4 border-t-[#03C75A] border-black rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-bold text-gray-800 tracking-widest uppercase animate-pulse">
        Authenticating...
      </p>
      <p className="text-sm text-gray-500 mt-2 font-bold">네이버 계정을 확인하고 있습니다.</p>
    </div>
  );
};

export default NaverCallbackPage;