import axios from 'axios';
import { cinemaAlert } from '../utils/alert';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let isRedirecting = false;

// 로그인/회원가입/계정찾기는 401을 "인증 실패 안내"로 쓰기 때문에
// 세션 만료 처리(로그아웃 + 리다이렉트) 대상에서 제외합니다.
const isAuthEndpoint = (url?: string) => !!url && url.includes('/api/auth/');

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
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !isAuthEndpoint(error.config?.url)) {

      if (!isRedirecting) {
        isRedirecting = true; // 자물쇠 잠금

        cinemaAlert("세션이 만료되었습니다. 다시 로그인해 주세요.", "알림");

        localStorage.clear();

        setTimeout(() => {
          window.location.href = '/login';
          isRedirecting = false;
        }, 10);
      }

      return new Promise(() => {});
    }

    // 그 외의 에러(로그인 실패, 500 서버 에러 등)는 컴포넌트로 넘겨줍니다.
    return Promise.reject(error);
  }
);
