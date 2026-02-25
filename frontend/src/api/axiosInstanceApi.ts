import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); //로컬 스토리지에서 토큰을 꺼냄
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } // 토큰이 있다면, HTTP 헤더에 'Bearer 토큰값' 형태로 몰래 끼워 넣음
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);