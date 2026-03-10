import { api } from '../api';

export const linkSocialAccountApi = async (provider: string, code: string) => {
  const response = await api.post('/api/mypage/social/link', {
    provider,
    code,
  });
  return response.data;
};

export const unlinkSocialAccountApi = async (provider: string) => {
  const response = await api.delete(`/api/mypage/social/unlink?provider=${provider}`);
  return response.data;
};
