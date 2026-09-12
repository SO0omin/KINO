import { useState, useEffect } from 'react';
import axios from 'axios';
import type { MainPageResponse } from '../types/main';

export const useMainData = () => {
  const [data, setData] = useState<MainPageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        setLoading(true);
        // 백엔드 컨트롤러 경로와 일치하게 호출
        const response = await axios.get<MainPageResponse>('http://localhost:8080/api/main');
        setData(response.data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, []);

  return { data, loading, error };
};