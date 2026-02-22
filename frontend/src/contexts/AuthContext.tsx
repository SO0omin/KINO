import React, { createContext, useContext, useState, useEffect } from 'react';

// 꺼내 쓸 데이터들의 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  name: string;
  memberId: number | null; // 💡 예매할 때 쓸 회원번호!
  login: (token: string, username: string, name: string, memberId: number) => void;
  logout: () => void;
}

//빈 컨텍스트 만들기
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);

  //앱 켜질 때(새로고침 시) 로컬스토리지 검사해서 복구
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserName = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    const storedId = localStorage.getItem('memberId');
    
    if (token && storedUserName && storedName && storedId) {
      setIsLoggedIn(true);
      setUsername(storedUserName);
      setName(storedName);
      setMemberId(Number(storedId));
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

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('memberId');
    setIsLoggedIn(false);
    setUsername("");
    setName("");
    setMemberId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, name, memberId, login, logout }}>
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