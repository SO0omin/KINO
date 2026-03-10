export interface MyPageSummary {
  memberId: number;
  memberName: string;
  profileImage?: string;
  availablePoints: number;
  pendingPoints: number;
  expiringPointsThisMonth: number;
  vipTicketPoints: number;
  vipStorePoints: number;
  vipEventPoints: number;
  pointTier: string;
  nextPointTier?: string | null;
  pointsToNextTier: number;
  availableCouponCount: number;
  paidReservationCount: number;
  reviewCount: number;
  likedMovieCount: number;
}

export interface MemberProfile {
  memberId: number;
  username: string;
  name: string;
  tel?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
  hasPointPassword: boolean;
  socialKakaoLinked: boolean;
  socialGoogleLinked: boolean;
  socialNaverLinked: boolean;
}

export interface MemberProfileUpdateRequest {
  memberId: number;
  name: string;
  tel?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
  pointPasswordUsing: boolean;
}

export interface MemberPasswordUpdateRequest {
  memberId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MyReservationItem {
  reservationId: number;
  movieTitle: string;
  posterUrl?: string;
  theaterName: string;
  screenName: string;
  startTime: string;
  finalAmount: number;
  reservationStatus: string;
  reservationNumber: string;
  paymentStatus: string;
  cancelReason?: string | null;
  seatNames: string[];
  cancellable: boolean;
  paidAt?: string;
  cancelledAt?: string;
  holdExpiresAt?: string;
}

export interface CancelReservationResponse {
  reservationId: number;
  reservationStatus: string;
  paymentStatus: string;
  cancelledAt: string;
}

export type VoucherType = 'MOVIE' | 'STORE';
export type VoucherStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface MyVoucherItem {
  voucherId: number;
  voucherType: VoucherType;
  status: VoucherStatus;
  code: string;
  name: string;
  validFrom?: string;
  validUntil?: string;
  registeredAt?: string;
}

export interface RegisterVoucherRequest {
  memberId: number;
  voucherType: VoucherType;
  code: string;
}

export interface RegisterVoucherResponse {
  voucherId: number;
  voucherType: VoucherType;
  status: VoucherStatus;
  code: string;
  name: string;
  registeredAt: string;
  message: string;
}

export interface MyCouponItem {
  memberCouponId: number;
  couponCode: string;
  couponName: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
  expiresAt: string;
  issuedAt?: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | string;
  couponKind: string;
  sourceType: 'KINO' | 'PARTNER' | string;
  downloadable?: boolean;
}

export interface DownloadAllCouponsResponse {
  downloadedCount: number;
  skippedCount: number;
  totalRequestedCount: number;
  pointAppliedCount?: number;
}

export interface DownloadableCouponItem {
  couponId: number;
  couponCode: string;
  couponName: string;
  discountType: string;
  discountValue: number;
  minPrice: number;
  couponKind: string;
  sourceType: 'KINO' | 'PARTNER' | string;
  validDays: number;
  alreadyOwned: boolean;
}

export interface DownloadableCouponsResponse {
  totalCount: number;
  coupons: DownloadableCouponItem[];
}

export interface DownloadSelectedCouponsResponse {
  downloadedCount: number;
  skippedCount: number;
  totalRequestedCount: number;
  pointAppliedCount: number;
}

export interface MyMembershipCardItem {
  cardId: number;
  channelName: string;
  cardNumber: string;
  cardName: string;
  issuerName: string;
  issuedDate: string;
}

export interface RegisterMembershipCardRequest {
  memberId: number;
  cardNumber: string;
  cvc: string;
}

export interface RegisterMembershipCardResponse {
  cardId: number;
  cardNumber: string;
  cardName: string;
  issuerName: string;
  issuedDate: string;
  message: string;
}

export interface MyPointHistoryItem {
  pointId: number;
  createdAt: string;
  typeLabel: string;
  content: string;
  branchName: string;
  point: number;
}

export interface MyWishMovieItem {
  movieId: number;
  title: string;
  posterUrl?: string;
}

export interface PointPasswordSmsVerifyResponse {
  verificationToken: string;
  message: string;
}

export interface MyReviewItem {
  id: number;
  movieTitle: string;
  content: string;
  createdAt: string;
}
