export interface MovieDTO {
  id: number;
  title: string;
  ageRating: string;
  durationMin: number;
  posterUrl: string;
  trailerUrl: string | null;
  status: string;
  avgRating: number;
  latestReviews: string[];
}

export interface CouponDTO {
  id: number;
  name: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
}

export interface ReviewSummary {
  movieTitle: string;
  avgRating: number;
  bestComment: string;
}

export interface TheaterStat {
  regionName: string;
  theaterCount: number;
}

export interface MainPageResponse {
  heroTrailers: MovieDTO[];
  bookingRank: MovieDTO[];
  activeCoupons: CouponDTO[];
  topReviews: ReviewSummary[];
  regionStats: TheaterStat[];
}