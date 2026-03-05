//constants 파일이 없어서 일단 여기배치
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

const NAVER_STATE = "kinocinema_secure_state"; //난수로 변경

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
export const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${NAVER_STATE}&redirect_uri=${NAVER_REDIRECT_URI}`;
export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;