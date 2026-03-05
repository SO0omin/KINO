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
  } | null;

  const [activeTab, setActiveTab] = useState<'MEMBER' | 'GUEST'>('MEMBER');

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

  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMemberData(prev => ({ ...prev, [name]: value }));
    if (name === 'username') setIsUsernameChecked(false); 
  };

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
  };

  const closeAlert = () => setIsAlertOpen(false);
  const closeDuplicateModal = () => setIsDuplicateModalOpen(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
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

  // 💡 로그인 페이지와 동일한 인풋/라벨 스타일로 변경
  const inputClass = "w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#eb4d32] transition-colors bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const getBannerColorClass = (provider?: string) => {
    if (provider === 'KAKAO') return 'bg-[#FEE500] text-black';
    if (provider === 'NAVER') return 'bg-[#03C75A] text-white';
    if (provider === 'GOOGLE') return 'bg-white border border-gray-300 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex flex-col items-center pt-20 pb-20">
      
      {/* 헤더 타이틀 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
        <p className="text-gray-600">Kino Cinema에 오신 것을 환영합니다.</p>
      </div>

      {/* 탭 버튼 영역 (로그인 페이지와 동일) */}
      <div className="flex w-full max-w-[500px] mb-6">
        <button 
          type="button"
          onClick={() => setActiveTab('MEMBER')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'MEMBER' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          회원가입
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('GUEST')} 
          className={`flex-1 py-3 text-lg font-bold border-b-2 transition-colors ${
            activeTab === 'GUEST' 
              ? 'border-[#eb4d32] text-[#eb4d32]' 
              : 'border-gray-300 text-gray-400 hover:text-gray-600'
          }`}
        >
          비회원 등록
        </button>
      </div>

      {/* 폼 컨테이너 (로그인 페이지와 동일한 레이아웃) */}
      <div className="w-full max-w-[500px] bg-white rounded-lg p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {activeTab === 'MEMBER' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
              
              {/* 소셜 연동 안내 배너 */}
              {socialData && socialData.provider && (
                <div className={`rounded p-4 font-bold text-center flex items-center justify-center gap-2 mb-2 ${getBannerColorClass(socialData.provider)}`}>
                  <span className="text-xl">💬</span>
                  {getProviderNameKOR(socialData.provider)} 계정 정보가 불러와졌습니다.
                </div>
              )}

              <div>
                <label className={labelClass}>아이디</label>
                <div className="flex gap-2">
                  <input type="text" name="username" value={memberData.username} onChange={handleMemberChange} required className={inputClass} placeholder="영문, 숫자 조합" />
                  <button type="button" onClick={handleUsernameCheck} className="whitespace-nowrap bg-gray-800 text-white px-5 rounded hover:bg-black transition-colors font-medium">
                    중복확인
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>이메일</label>
                <input type="email" name="email" value={memberData.email} onChange={handleMemberChange} required className={inputClass} placeholder="kino@cinema.com"/>
              </div>

              <div>
                <label className={labelClass}>비밀번호</label>
                <input type="password" name="password" value={memberData.password} onChange={handleMemberChange} required className={inputClass} placeholder="비밀번호를 입력해주세요" />
              </div>

              <div>
                <label className={labelClass}>비밀번호 확인</label>
                <input type="password" name="confirmPassword" value={memberData.confirmPassword} onChange={handleMemberChange} required className={inputClass} placeholder="비밀번호를 다시 한 번 입력해주세요" />
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              <div>
                <label className={labelClass}>이름</label>
                <input type="text" name="name" value={memberData.name} onChange={handleMemberChange} required className={inputClass} placeholder="실명을 입력해주세요"/>
              </div>

              <div>
                <label className={labelClass}>생년월일</label>
                <input type="date" name="birth_date" value={memberData.birth_date} onChange={handleMemberChange} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>휴대폰 번호</label>
                <input type="tel" name="tel" value={memberData.tel} onChange={handleMemberChange} required className={inputClass} placeholder="010-0000-0000" />
              </div>
            </div>
          )}

          {activeTab === 'GUEST' && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="bg-gray-50 rounded p-4 text-sm text-gray-600 mb-2 text-center">
                <p>비회원 예매 및 결제를 위한 필수 정보입니다.</p>
                <p>입력하신 정보는 예매 조회 시 사용되니 정확히 입력해 주세요.</p>
              </div>

              <div>
                <label className={labelClass}>이름</label>
                <input type="text" name="guestName" value={guestData.guestName} onChange={handleGuestChange} required className={inputClass} placeholder="예매자 이름" />
              </div>

              <div>
                <label className={labelClass}>휴대폰 번호</label>
                <input type="tel" name="guestTel" value={guestData.guestTel} onChange={handleGuestChange} required className={inputClass} placeholder="010-0000-0000 (- 제외)" />
              </div>

              <div>
                <label className={labelClass}>예매 비밀번호</label>
                <input type="password" name="guestPassword" value={guestData.guestPassword} onChange={handleGuestChange} required maxLength={4} className={inputClass} placeholder="숫자 4자리" />
              </div>

              <div>
                <label className={labelClass}>비밀번호 확인</label>
                <input type="password" name="guestConfirmPassword" value={guestData.guestConfirmPassword} onChange={handleGuestChange} required maxLength={4} className={inputClass} placeholder="숫자 4자리 확인" />
              </div>
            </div>
          )}

          <div className="mt-4">
            <button type="submit" className="w-full bg-[#eb4d32] text-white font-bold py-3 rounded hover:bg-[#d4452d] transition-colors">
              {activeTab === 'MEMBER' ? '가입 완료하기' : '비회원 등록하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 모달 디자인도 로그인 페이지와 동일하게 둥글고 깔끔하게 변경 */}
      <CommonModal isOpen={isAlertOpen} onClose={closeAlert}>
        <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">알림</h3>
          <p className="text-gray-600 mb-6">{alertMessage}</p>
          <button onClick={closeAlert} className="w-full bg-[#eb4d32] text-white font-bold py-3 rounded hover:bg-[#d4452d] transition-colors">
            확인
          </button>
        </div>
      </CommonModal>

      <CommonModal isOpen={isDuplicateModalOpen} onClose={closeDuplicateModal}>
       <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">가입 안내</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            이미 해당 이메일로 가입된 이력이 있습니다.<br/>로그인 페이지로 이동하시겠습니까?
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')} className="flex-1 bg-[#eb4d32] text-white font-bold py-3 rounded hover:bg-[#d4452d] transition-colors">
              로그인
            </button>
            <button onClick={() => navigate('/find-account')} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded hover:bg-gray-200 transition-colors">
              계정 찾기
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default SignupPage;