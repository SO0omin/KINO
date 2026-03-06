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
  guestLogin: (token: string, guestId: number, name: string) => void;
  logout: () => void;
}

// 빈 컨텍스트 만들기
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<number | null>(null);

  const parseJwtPayload = (token: string): any | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // 💡 로그아웃 함수 (useEffect 안에서 쓰기 위해 위로 올렸습니다)
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

  // 앱 켜질 때(새로고침 시) 로컬스토리지 검사해서 복구
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserName = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    const storedMemberId = localStorage.getItem('memberId');
    const storedGuestId = localStorage.getItem('guestId'); // 비회원 복구용
    const storedIsGuest = localStorage.getItem('isGuest');
    
    if (token) {
      try {
        // 🚨 1. JWT 토큰 만료 검사 로직 추가 🚨
        const decodedPayload = parseJwtPayload(token);
        if (!decodedPayload) {
          logout();
          return;
        }
        const exp = decodedPayload.exp * 1000; // 초 단위를 밀리초로 변환
        const now = Date.now();

        // 만료 시간이 현재 시간보다 과거라면 (즉, 만료되었다면)
        if (now >= exp) {
          console.log("🚨 토큰이 만료되었습니다. 자동으로 로그아웃됩니다.");
          logout(); // 깨끗하게 정보 지우기
          return;   // 💡 복구 로직을 실행하지 않고 여기서 함수 종료!
        }

        // 2. 만료되지 않았다면 정상적으로 상태 복구
        if (storedIsGuest === 'true' && storedName && storedGuestId) {
          const parsedGuestId = Number(storedGuestId);
          if (!Number.isFinite(parsedGuestId) || parsedGuestId <= 0) {
            logout();
            return;
          }
          // 비회원 복구
          setIsGuest(true);
          setIsLoggedIn(false);
          setUsername("");
          setMemberId(null);
          setName(storedName);
          setGuestId(parsedGuestId);
        } else if (storedUserName && storedName && storedMemberId) {
          // 회원 복구
          setIsLoggedIn(true);
          setIsGuest(false);
          setGuestId(null);
          setUsername(storedUserName);
          setName(storedName);
          setMemberId(Number(storedMemberId));
        }
      } catch (error) {
        console.error("토큰 검증 중 오류 발생:", error);
        // 토큰이 손상되었을 때도 강제 로그아웃
        logout(); 
      }
    }
  }, []);

  // 로그인 함수
  const login = (token: string, username: string, name: string, memberId: number) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('name', name);
    localStorage.setItem('memberId', String(memberId));
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestId');
    setIsLoggedIn(true);
    setIsGuest(false);
    setUsername(username);
    setName(name);
    setMemberId(memberId);
    setGuestId(null);
  };

  // 비회원 로그인 함수
  const guestLogin = (token: string, guestId: number, name: string) => {
    const payload = parseJwtPayload(token);
    const claimedGuestId = Number(payload?.guestId);
    const resolvedGuestId = Number.isFinite(guestId) && guestId > 0
      ? guestId
      : (Number.isFinite(claimedGuestId) && claimedGuestId > 0 ? claimedGuestId : null);
    if (!resolvedGuestId) {
      throw new Error('비회원 인증 정보가 없습니다.');
    }

    localStorage.setItem('jwt_token', token); 
    localStorage.removeItem('username');
    localStorage.removeItem('memberId');
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestId', String(resolvedGuestId));
    localStorage.setItem('name', name);

    setIsGuest(true);
    setIsLoggedIn(false); 
    setUsername("");
    setMemberId(null);
    setGuestId(resolvedGuestId);
    setName(name);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isGuest, username, name, memberId, guestId, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅 만들기
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 써야 합니다.');
  return context;
};
