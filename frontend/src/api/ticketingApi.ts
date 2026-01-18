import axios from 'axios';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/ticketing',
});

export const ticketingApi = {
  // 1. 모든 지역 조회
  getRegions: () => api.get<Region[]>('/regions'),

  // 2. 스페셜관 목록 조회
  getSpecialTypes: () => api.get<string[]>('/special-types'),

  // 3. 지역별 영화관 조회
  getTheaters: (regionId?: number | null, specialType?: string | null) => {
    const params: any = {};
    if (regionId) params.regionId = regionId;
    if (specialType) params.specialType = specialType;
    return api.get<Theater[]>('/theaters', { params });
  },

  // 4. 모든 영화 조회 (필터용 목록)
  getMovies: () => api.get<Movie[]>('/movies'),

  // 5. 특정 조건에서 상영 중인 영화 ID 목록 조회
  getAvailableMovieIds: (theaterIds: number[], date: string, specialType?: string | null) =>
    api.get<number[]>('/available-movies', {
      params: {
        theaterIds: theaterIds.length > 0 ? theaterIds.join(',') : null,
        date,
        specialType
      }
    }),

  // 6. 특정 영화들을 상영 중인 상영관 ID 목록 조회 (역방향 필터링용)
  getAvailableTheaterIds: (movieIds: number[], date: string) => {
    const params = new URLSearchParams();
    movieIds.forEach(id => params.append('movieIds', id.toString()));
    params.append('date', date);
    return api.get<number[]>(`/available-theaters?${params.toString()}`);
  },

  // 7. 최종 상세 시간표 조회
  getScreenings: (theaterIds: number[], movieIds: number[], date: string, specialType?: string | null) => {
    const params: any = { 
      theaterIds: theaterIds.length > 0 ? theaterIds.join(',') : null, 
      movieIds: movieIds.length > 0 ? movieIds.join(',') : null, 
      date 
    };
    if (specialType) params.specialType = specialType;
    return api.get<Screening[]>('/screenings', { params });
  },

  // a. 특정 상영 일정의 좌석 상태 조회 API
  getScreeningSeats: (screeningId: number) => {
    return api.get(`/screenings/${screeningId}/seats`);
  },
};