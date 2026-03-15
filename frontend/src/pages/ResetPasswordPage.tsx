import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { cinemaAlert } from '../utils/alert';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // 실시간 개인정보 비교를 위해 서버에서 받아올 유저 정보
  const [userInfo, setUserInfo] = useState({
    username: '',
    tel: '',
    birth_date: ''
  });

  // 실시간 검증 상태 관리 (대소문자, 개인정보 항목 포함)
  const [pwValidation, setPwValidation] = useState({
    length: false,
    english: false, // 대소문자 혼용 여부
    number: false,
    special: false,
    noPersonal: false, // 아이디/전화/생일 포함 금지
  });

  // 토큰에 해당하는 사용자의 비교용 정보를 가져오는 API
  const fetchUserInfo = async (urlToken: string) => {
    try {
      const response = await axios.get(`/api/auth/reset-password-info?token=${urlToken}`);
      setUserInfo({
        username: response.data.username || '',
        tel: response.data.tel || '',
        // 백엔드 DTO 필드명(birthDate)에 맞게 매핑
        birth_date: response.data.birthDate || response.data.birth_date || '' 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "만료되거나 유효하지 않은 링크입니다.";
      
      cinemaAlert(errorMessage, "알림", () => {
        navigate('/login');
      });
    }
  };

  // 1. URL 토큰 확인 및 유저 정보 가져오기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get('token');
    
    if (!urlToken) {
      cinemaAlert("유효하지 않은 접근입니다. 올바른 링크로 접속해주세요.", "INVALID ACCESS", () => {
        navigate('/login');
      });
    } else {
      setToken(urlToken);
      fetchUserInfo(urlToken);
    }
  }, [location, navigate]);

  // 2. 비밀번호 실시간 검사 로직 (SignupPage 로직 이식)
  const validatePassword = (password: string) => {
    const specChars = /[`~!@#$%^&*|'";:\₩\\?]/;
    
    const isLength = password.length >= 8 && password.length <= 20;
    // 영어 대문자와 소문자가 모두 포함되어야 함
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasEnglish = hasUpper && hasLower;
    
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = specChars.test(password);

    // 개인정보 포함 여부 검사
    const cleanTel = userInfo.tel.replace(/[^0-9]/g, "");
    const cleanBirth = userInfo.birth_date.replace(/-/g, "");

    const isIdSafe = userInfo.username ? !password.includes(userInfo.username) : true;
    const isTelSafe = cleanTel.length >= 4 ? (!password.includes(cleanTel.slice(-4)) && !password.includes(cleanTel.slice(3, 7))) : true;
    const isBirthSafe = cleanBirth ? !password.includes(cleanBirth) : true;

    const isNotEmpty = password.length > 0;

    setPwValidation({
      length: isLength,
      english: hasEnglish,
      number: hasNumber,
      special: hasSpecial,
      noPersonal: isNotEmpty && isIdSafe && isTelSafe && isBirthSafe
    });
  };

  // 비밀번호 입력 또는 유저 정보 로드 시 검증 실행
  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword, userInfo]);

  // 3. 폼 제출 로직
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 유효성 검사
    const { length, english, number, special, noPersonal } = pwValidation;
    if (!length || !english || !number || !special || !noPersonal) {
      cinemaAlert("비밀번호 설정 조건을 모두 만족해야 합니다.", "VALIDATION ERROR");
      return;
    }

    if (newPassword !== confirmPassword) {
      cinemaAlert("비밀번호가 서로 일치하지 않습니다.", "VALIDATION ERROR");
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      // 성공 시 콜백으로 로그인 페이지 이동
      cinemaAlert(
        "비밀번호가 성공적으로 변경되었습니다.\n새로운 비밀번호로 로그인해주세요!", 
        "SUCCESS", 
        () => navigate('/login')
      );
    } catch (error: any) {
      cinemaAlert(
        error.response?.data?.error || "비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.", 
        "ERROR"
      );
    }
  };

  console.log(userInfo);

  const inputClass = "w-full border border-black/10 rounded-sm p-4 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20 bg-white";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2";

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#B91C1C] selection:text-white pb-20">
      
      {/* Header Area */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-12 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-mono text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema Archive</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-4xl md:text-4xl uppercase tracking-tighter leading-none">
              Reset <span className="text-white/20">Password</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[500px] mx-auto px-6">
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
          
          {/* Notice 박스 */}
          <div className="bg-black/5 border border-black/5 rounded-sm p-5 text-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-2">Notice</h3>
            <p className="text-[11px] font-bold text-black/60 leading-relaxed">
              안전한 서비스 이용을 위해<br/>
              영문 대소문자, 숫자, 특수문자를 조합하여 설정해 주세요.
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
                placeholder="대소문자 포함 8~20자 입력" 
              />

              {/* 실시간 검증 UI */}
              <div className="mt-4 p-4 bg-black/5 border border-black/5 rounded-sm space-y-2 text-[10px] font-bold uppercase tracking-widest">
                <p className={pwValidation.length ? "text-[#03C75A]" : "text-black/40"}>
                  {pwValidation.length ? "✓" : "○"} 8 ~ 20자 사이 입력
                </p>
                <p className={(pwValidation.english && pwValidation.number && pwValidation.special) ? "text-[#03C75A]" : "text-black/40"}>
                  {(pwValidation.english && pwValidation.number && pwValidation.special) ? "✓" : "○"} 영문(대소문자), 숫자, 특수문자 조합
                </p>
                <p className={pwValidation.noPersonal ? "text-[#03C75A]" : "text-black/40"}>
                  {pwValidation.noPersonal ? "✓" : "○"} 아이디/전화/생일 포함 금지
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className={inputClass} 
                placeholder="비밀번호 재입력" 
              />
              {confirmPassword.length > 0 && (
                <div className="mt-2 px-1">
                  {newPassword === confirmPassword ? (
                    <p className="text-[#03C75A] text-[10px] font-bold uppercase tracking-widest">✓ 비밀번호가 일치합니다</p>
                  ) : (
                    <p className="text-[#B91C1C] text-[10px] font-bold uppercase tracking-widest">✘ 비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-black/5 pt-6">
              <button 
                type="submit" 
                disabled={Object.values(pwValidation).includes(false) || newPassword !== confirmPassword}
                className={`w-full py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  Object.values(pwValidation).includes(false) || newPassword !== confirmPassword
                    ? "bg-black/5 text-black/20 cursor-not-allowed border border-black/10"
                    : "bg-[#1A1A1A] text-white shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;