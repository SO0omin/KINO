import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CommonModal } from '../components/common/CommonModal';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const socialData = location.state as { 
    name?: string; 
    provider?: 'KAKAO' | 'NAVER' | 'GOOGLE'; 
    providerId?: string; 
    username?: string;
    profileImage?: string;
    tel?: string;          
    birth_date?: string;
    email?: string;
    initialTab?: 'MEMBER' | 'GUEST';
  } | null;

  const [activeTab, setActiveTab] = useState<'MEMBER' | 'GUEST'>(
    socialData?.initialTab === 'GUEST' ? 'GUEST' : 'MEMBER'
  );

  const [memberData, setMemberData] = useState({
    username: socialData?.username || '',
    password: '',
    confirmPassword: '',
    name: socialData?.name || '',
    birth_date: socialData?.birth_date || '',
    tel: socialData?.tel || '',
    email: socialData?.email || '', 
    provider: socialData?.provider || 'LOCAL',
    providerId: socialData?.providerId || '', 
    profileImage: socialData?.profileImage || ''
  });

  const [guestData, setGuestData] = useState({
    guestName: '',
    guestTel: '',
    guestPassword: '',
    guestConfirmPassword: ''
  });

  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const getProviderNameKOR = (provider?: string) => {
    if (provider === 'KAKAO') return '카카오';
    if (provider === 'NAVER') return '네이버';
    if (provider === 'GOOGLE') return '구글';
    return '';
  };

  useEffect(() => {
    if (socialData && socialData.provider) {
      const providerName = getProviderNameKOR(socialData.provider);
      showAlert(`${providerName} 계정 정보가 입력되었습니다. 나머지 정보를 입력해주세요!`);
    }
  }, [socialData]);

  const closeAlert = () => setIsAlertOpen(false);
  const closeDuplicateModal = () => setIsDuplicateModalOpen(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const formatTel = (value: string) => {
    const target = value.replace(/[^0-9]/g, '').slice(0, 11);
    if (target.length <= 3) return target;
    if (target.length <= 7) return `${target.slice(0, 3)}-${target.slice(3)}`;
    return `${target.slice(0, 3)}-${target.slice(3, 7)}-${target.slice(7)}`;
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'tel') {
      finalValue = formatTel(value);
    }

    setMemberData(prev => ({ ...prev, [name]: finalValue }));
    
    if (name === 'password') {
      validatePassword(finalValue);
    }
    if (name === 'username') {
      setIsUsernameChecked(false);
    }
  };

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'guestTel') {
      finalValue = formatTel(value);
    }

    setGuestData(prev => ({ ...prev, [name]: finalValue }));
  };

  const [pwValidation, setPwValidation] = useState({
    length: false,
    english: false,
    number: false,
    special: false,
    noPersonal: true, 
  });

  const validatePassword = (password: string) => {
    const specChars = /[`~!@#$%^&*|'";:\₩\\?]/;
    const isLength = password.length >= 8 && password.length <= 20;
    const hasEnglish = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = specChars.test(password);

    const cleanTel = memberData.tel.replace(/[^0-9]/g, "");
    const isPersonalSafe = 
      !password.includes(memberData.username) && 
      (cleanTel.length < 4 || !password.includes(cleanTel.slice(-4))) && 
      (cleanTel.length < 8 || !password.includes(cleanTel.slice(3, 7))) && 
      !password.includes(memberData.birth_date.replace(/-/g, "")); 

    setPwValidation({
      length: isLength,
      english: hasEnglish,
      number: hasNumber,
      special: hasSpecial,
      noPersonal: isPersonalSafe
    });
  };

  const handleUsernameCheck = async () => {
    if (!memberData.username) {
      showAlert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.get('/api/auth/check-username', {
        params: { username: memberData.username }
      });
      if (response.data.available) {
        showAlert("사용 가능한 아이디입니다.");
        setIsUsernameChecked(true);
      } else {
        showAlert("이미 사용 중인 아이디입니다.");
        setIsUsernameChecked(false);
      }
    } catch (error) {
      showAlert("중복 체크 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'MEMBER') {
      if (!isUsernameChecked) {
        showAlert("아이디 중복 체크를 진행해주세요.");
        return;
      }

      const { length, english, number, special, noPersonal } = pwValidation;
      if (!length || !english || !number || !special || !noPersonal) {
        showAlert("비밀번호 설정 조건을 모두 만족해야 합니다.");
        return;
      }

      if (memberData.password !== memberData.confirmPassword) {
        showAlert("비밀번호가 일치하지 않습니다.");
        return;
      }

      try {
        await axios.post('/api/auth/signup', memberData);
        showAlert("회원가입이 완료되었습니다.");
        setTimeout(() => navigate('/login'), 1500); 
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error || "";
          if (errorMessage.includes("이메일")) {
            setIsDuplicateModalOpen(true); 
          } else {
            showAlert(errorMessage);
          }
        } else {
          showAlert("회원가입 중 오류가 발생했습니다.");
        }
      }
    } else {
      if (guestData.guestPassword !== guestData.guestConfirmPassword) {
        showAlert("비밀번호가 일치하지 않습니다.");
        return;
      }
      try {
        await axios.post('/api/auth/guest-signup', {
          name: guestData.guestName,
          tel: guestData.guestTel,
          password: guestData.guestPassword
        });
        showAlert("비회원 정보 등록이 완료되었습니다.");
        setTimeout(() => navigate('/login'), 1500);
      } catch (error) {
        showAlert("비회원 등록 중 오류가 발생했습니다.");
      }
    }
  };

  // 💡 로그인 페이지와 동일한 인풋/라벨 스타일 적용
  const inputClass = "w-full border border-black/10 rounded-sm p-4 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C] outline-none transition-all placeholder:text-black/20 bg-white";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2";

  const getBannerColorClass = (provider?: string) => {
    if (provider === 'KAKAO') return 'bg-[#FEE500] text-black border-transparent';
    if (provider === 'NAVER') return 'bg-[#03C75A] text-white border-transparent';
    if (provider === 'GOOGLE') return 'bg-white text-[#1A1A1A] border-black/10';
    return 'bg-black/5 text-[#1A1A1A] border-transparent';
  };

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
            Sign <span className="text-white/20">Up</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            키노 시네마 회원가입
          </p>
        </div>
      </div>

      <div className="max-w-[500px] mx-auto px-6">
        
        {/* 탭 버튼 영역 */}
        <div className="flex mb-8 border-b border-black/10">
          <button 
            type="button"
            onClick={() => setActiveTab('MEMBER')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'MEMBER' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Member
            {activeTab === 'MEMBER' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('GUEST')} 
            className={`flex-1 py-4 text-[15px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'GUEST' 
                ? 'text-[#B91C1C]' 
                : 'text-black/40 hover:text-black'
            }`}
          >
            Guest
            {activeTab === 'GUEST' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B91C1C]"></div>
            )}
          </button>
        </div>

        {/* 폼 컨테이너 */}
        <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {activeTab === 'MEMBER' && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* 소셜 연동 안내 배너 */}
                {socialData && socialData.provider && (
                  <div className={`rounded-sm border p-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-2 ${getBannerColorClass(socialData.provider)}`}>
                    <span className="text-lg">💬</span>
                    {getProviderNameKOR(socialData.provider)} 연동 계정입니다
                  </div>
                )}

                <div>
                  <label className={labelClass}>User ID</label>
                  <div className="flex gap-2">
                    <input type="text" name="username" value={memberData.username} onChange={handleMemberChange} required 
                      className={inputClass} placeholder="영문, 숫자 조합" />
                    <button type="button" onClick={handleUsernameCheck} 
                      className="whitespace-nowrap bg-[#1A1A1A] text-white px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#B91C1C] transition-colors">
                      Check ID
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" name="email" value={memberData.email} onChange={handleMemberChange} required 
                    className={inputClass} placeholder="kino@cinema.com"/>
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" name="password" value={memberData.password} onChange={handleMemberChange} required 
                    className={inputClass} placeholder="비밀번호를 입력해주세요" />
                  
                  <div className="mt-4 p-4 bg-black/5 border border-black/5 rounded-sm space-y-2 text-[10px] font-bold uppercase tracking-widest">
                    <p className={pwValidation.length ? "text-[#03C75A]" : "text-black/40"}>
                      {pwValidation.length ? "✓" : "○"} 8 ~ 20자 사이 입력
                    </p>
                    <p className={(pwValidation.english && pwValidation.number && pwValidation.special) ? "text-[#03C75A]" : "text-black/40"}>
                      { (pwValidation.english && pwValidation.number && pwValidation.special) ? "✓" : "○"} 영문, 숫자, 특수문자 조합
                    </p>
                    <p className={pwValidation.noPersonal ? "text-[#03C75A]" : "text-black/40"}>
                      {pwValidation.noPersonal ? "✓" : "○"} 아이디/전화/생일 포함 금지
                    </p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={memberData.confirmPassword} onChange={handleMemberChange} required 
                    className={inputClass} placeholder="비밀번호 재입력" />
                  {memberData.confirmPassword.length > 0 && (
                    <div className="mt-2 px-1">
                      {memberData.password === memberData.confirmPassword ? (
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

                <div className="border-t border-black/5 my-2"></div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="name" value={memberData.name} onChange={handleMemberChange} required 
                    className={inputClass} placeholder="실명을 입력해주세요"/>
                </div>

                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" name="birth_date" value={memberData.birth_date} onChange={handleMemberChange} required 
                    className={`${inputClass} font-mono`} />
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="tel" value={memberData.tel} onChange={handleMemberChange} required 
                    className={inputClass} placeholder="010-0000-0000" />
                </div>
              </div>
            )}

            {activeTab === 'GUEST' && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-black/5 border border-black/5 rounded-sm p-5 text-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B91C1C] mb-2">Notice</h3>
                  <p className="text-[11px] font-bold text-black/60 leading-relaxed">
                    비회원 예매 및 결제를 위한 필수 정보입니다.<br/>
                    입력하신 정보는 예매 내역 조회 시 사용됩니다.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="guestName" value={guestData.guestName} onChange={handleGuestChange} required 
                    className={inputClass} placeholder="예매자 이름" />
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="guestTel" value={guestData.guestTel} onChange={handleGuestChange} required 
                    className={inputClass} placeholder="010-0000-0000 (- 제외)" />
                </div>

                <div>
                  <label className={labelClass}>Booking Password</label>
                  <input type="password" name="guestPassword" value={guestData.guestPassword} onChange={handleGuestChange} required maxLength={4} 
                    className={`${inputClass} font-mono tracking-widest`} placeholder="예매용 숫자 4자리" />
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" name="guestConfirmPassword" value={guestData.guestConfirmPassword} onChange={handleGuestChange} required maxLength={4} 
                    className={`${inputClass} font-mono tracking-widest`} placeholder="예매용 숫자 4자리 확인" />
                </div>
              </div>
            )}

            <div className="mt-6">
              <button 
                type="submit" 
                disabled={activeTab === 'MEMBER' && Object.values(pwValidation).includes(false)}
                className={`w-full py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === 'MEMBER' && Object.values(pwValidation).includes(false)
                    ? "bg-black/5 text-black/20 cursor-not-allowed border border-black/10" 
                    : "bg-[#1A1A1A] text-white shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                {activeTab === 'MEMBER' ? 'Complete Sign Up' : 'Register Guest Info'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 기본 알림 모달 */}
      <CommonModal isOpen={isAlertOpen} onClose={closeAlert}>
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden min-w-[320px]">
          <div className="bg-[#B91C1C] text-white px-6 py-4 flex items-center justify-center border-b border-[#991B1B]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Notice</h3>
          </div>
          <div className="p-8 flex flex-col items-center">
            <p className="text-sm font-medium text-[#1A1A1A] text-center mb-8 leading-relaxed">
              {alertMessage}
            </p>
            <button 
              onClick={closeAlert} 
              className="w-full bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm hover:bg-[#B91C1C] transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </CommonModal>

      {/* 이메일 중복 시 안내 모달 */}
      <CommonModal isOpen={isDuplicateModalOpen} onClose={closeDuplicateModal}>
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden min-w-[340px]">
          <div className="bg-[#B91C1C] text-white px-6 py-4 flex items-center justify-center border-b border-[#991B1B]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Account Exists</h3>
          </div>
          <div className="p-8 flex flex-col items-center">
            <p className="text-sm font-medium text-[#1A1A1A] text-center mb-8 leading-relaxed">
              이미 해당 이메일로 가입된 이력이 있습니다.<br/>로그인 페이지로 이동하시겠습니까?
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => navigate('/login')} 
                className="flex-1 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm hover:bg-[#B91C1C] transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/find-account')} 
                className="flex-1 bg-white border border-black/10 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm hover:border-black/30 transition-colors"
              >
                Find Account
              </button>
            </div>
          </div>
        </div>
      </CommonModal>

    </div>
  );
};

export default SignupPage;