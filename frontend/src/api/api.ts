import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  timeout: 5000,
});

//  서버로 출발하기 전에 팔찌 차기!
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // 로컬 스토리지에서 토큰 꺼냄
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } // 토큰이 있다면, HTTP 헤더에 'Bearer 토큰값' 형태로 몰래 끼워 넣음
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert("로그인이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.");

      localStorage.removeItem('jwt_token');
      localStorage.removeItem('username');
      localStorage.removeItem('name');
      localStorage.removeItem('memberId');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestId');
      
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);