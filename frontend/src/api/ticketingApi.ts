import axios from 'axios';
import type { Region, Theater, Movie, Screening } from '../types/ticketing';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/ticketing',
});

export const ticketingApi = {
  // 1. 모든 지역 조회
  getRegions: () => api.get<Region[]>('/regions'),

  // 2. 지역별 영화관 조회
  getTheaters: (regionId: number) => 
    api.get<Theater[]>(`/theaters?regionId=${regionId}`),

  // 3. 모든 영화 조회 (필터용 목록)
  getMovies: () => api.get<Movie[]>('/movies'),

  // 4. 특정 조건에서 상영 중인 영화 ID 목록 조회
  getAvailableMovieIds: (theaterIds: number[], date: string) => {
    const params = new URLSearchParams();
    theaterIds.forEach(id => params.append('theaterIds', id.toString()));
    params.append('date', date);
    return api.get<number[]>(`/available-movies?${params.toString()}`);
  },

  // 5. 최종 상세 시간표 조회
  getScreenings: (theaterIds: number[], movieIds: number[], date: string) => {
    const params = new URLSearchParams();
    theaterIds.forEach(id => params.append('theaterIds', id.toString()));
    movieIds.forEach(id => params.append('movieIds', id.toString()));
    params.append('date', date);
    return api.get<Screening[]>(`/screenings?${params.toString()}`);
  }
};