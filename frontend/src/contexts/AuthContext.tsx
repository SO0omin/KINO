import React, { createContext, useContext, useState, useEffect } from 'react';

// 꺼내 쓸 데이터들의 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  username: string;
  name: string;
  memberId: number | null; // 💡 예매할 때 쓸 회원번호!
  guestId: number | null;
  login: (token: string, username: string, name: string, memberId: number) => void;
  guestLogin: (guestId: number, name: string) => void;
  logout: () => void;
}

//빈 컨텍스트 만들기
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<number | null>(null);

  //앱 켜질 때(새로고침 시) 로컬스토리지 검사해서 복구
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserName = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    const storedMemberId = localStorage.getItem('memberId');
    const storedGuestId = localStorage.getItem('guestId'); // 비회원 복구용
    const storedIsGuest = localStorage.getItem('isGuest');
    
   if (token && storedUserName && storedName && storedMemberId) {
      setIsLoggedIn(true);
      setUsername(storedUserName);
      setName(storedName);
      setMemberId(Number(storedMemberId));
    } 
    // 2. 비회원 복구 (결제하다가 새로고침했을 때 정보 안 날아가게)
    else if (storedIsGuest === 'true' && storedName && storedGuestId) {
      setIsGuest(true);
      setName(storedName);
      setGuestId(Number(storedGuestId));
    }
  }, []);

  // 로그인 함수
  const login = (token: string, username: string, name: string, memberId: number) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('name', name);
    localStorage.setItem('memberId', String(memberId)); // 로컬스토리지는 문자열만 저장됨
    setIsLoggedIn(true);
    setUsername(username);
    setName(name);
    setMemberId(memberId);
  };

  // 비회원 로그인 함수
  const guestLogin = (guestId: number, name: string) => {
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestId', String(guestId));
    localStorage.setItem('name', name);

    setIsGuest(true);
    setIsLoggedIn(false); // 정식 로그인은 아님
    setGuestId(guestId);
    setName(name);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('memberId');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestId');

    setIsLoggedIn(false);
    setIsGuest(false);
    setUsername("");
    setName("");
    setMemberId(null);
    setGuestId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isGuest, username, name, memberId, guestId, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//커스텀 훅 만들기
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 써야 합니다.');
  return context;
};