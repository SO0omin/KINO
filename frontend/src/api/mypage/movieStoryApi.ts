import { api } from '../api';
import type { MyReviewItem, MyWishMovieItem } from './types';

type VerifyReservationResponse = {
  movieId: number;
  movieTitle: string;
};

type CreateReviewRequest = {
  memberId: number;
  movieId: number | null;
  reservationNumber: string;
  content: string;
  scoreDirection: number;
  scoreStory: number;
  scoreVisual: number;
  scoreActor: number;
  scoreOst: number;
};

export async function toggleMovieLike(movieId: number, memberId: number): Promise<boolean> {
  try {
    const response = await api.post(`/api/movies/${movieId}/likes`, { memberId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '찜 처리에 실패했습니다.');
  }
}

export async function removeMovieLike(movieId: number, memberId: number) {
  try {
    const response = await api.delete(`/api/movies/${movieId}/likes?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '찜 취소에 실패했습니다.');
  }
}

export async function getMyWishMovies(memberId: number): Promise<MyWishMovieItem[]> {
  try {
    const response = await api.get(`/api/movies/likes?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '보고싶어 목록을 불러오지 못했습니다.');
  }
}

export async function getMyReviews(memberId: number): Promise<MyReviewItem[]> {
  try {
    const response = await api.get(`/api/mypage/reviews?memberId=${memberId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '리뷰 목록을 불러오지 못했습니다.');
  }
}

export async function verifyReservationForReview(reservationNumber: string): Promise<VerifyReservationResponse> {
  try {
    const response = await api.get(`/api/reservations/verify/${reservationNumber}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || '유효하지 않은 예매 번호입니다. 번호를 확인해주세요.');
  }
}

export async function checkReviewAvailability(reservationNumber: string) {
  try {
    const response = await api.get(`/api/reviews/check-availability/${reservationNumber}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || '유효하지 않은 예매 번호입니다. 번호를 확인해주세요.');
  }
}

export async function createReview(payload: CreateReviewRequest) {
  try {
    const response = await api.post('/api/reviews', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || '리뷰 등록 실패');
  }
}
