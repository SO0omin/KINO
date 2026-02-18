import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import {
  preparePayment,
  confirmPayment,
  getReservationDetail,
  type ReservationDetailResponse,
} from '../api/paymentApi';

import type { PrepareRequest, ConfirmRequest } from '../types/dto/payment.dto';

/**
 * Toss 클라이언트 키 (공개 키)
 * - 실제 배포 환경에서는 .env로 분리 권장
 */
const CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

/**
 * Toss 결제 타입(프론트에서 선택한 결제수단)
 */
export type TossPaymentType = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE_PHONE';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);

  const [reservationDetail, setReservationDetail] =
    useState<ReservationDetailResponse | null>(null);

  const isWidgetReady = true;

  const fetchReservationDetail = async (reservationId: number) => {
    try {
      const data = await getReservationDetail(reservationId);
      setReservationDetail(data);
    } catch (error) {
      console.error('예약 정보 조회 실패:', error);
    }
  };

  /**
   * 결제 시작 함수
   * - 서버 prepare로 금액/orderId 확정
   * - Toss 결제창 호출
   */
  const requestPayment = async (
    prepareData: PrepareRequest,
    paymentType: TossPaymentType = 'CARD'
  ) => {
    setIsLoading(true);

    try {
      // 1) 서버에서 결제 준비 처리(금액 확정 + 좌석 HELD + 쿠폰 HOLD)
      const prepareResponse = await preparePayment(prepareData);

      // 2) Toss SDK 로드
      const tossPayments: any = await loadTossPayments(CLIENT_KEY);

      // 3) 결제창 호출 (선택한 결제수단 반영)
      await tossPayments.requestPayment(paymentType, {
        amount: prepareResponse.finalAmount,
        orderId: prepareResponse.orderId,
        orderName: prepareResponse.orderName,

        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,

        customerName: 'KINO 고객',
      });

    } catch (error: any) {
      console.error('결제 에러:', error);

      // 사용자가 결제창에서 취소한 경우
      if (error?.code === 'USER_CANCEL') {
        return;
      }

      alert(`결제 실패: ${error?.message ?? '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 결제 최종 확정 함수 (success 페이지에서 호출)
   */
  const confirm = async (request: ConfirmRequest) => {
    return await confirmPayment(request);
  };

  /**
   * 위젯 모드 호환용(현재는 로그만)
   */
  const updateAmount = async (amount: number) => {
    console.log('가격 업데이트:', amount);
  };

  return {
    isWidgetReady,
    isLoading,
    reservationDetail,
    fetchReservationDetail,
    requestPayment,
    confirm,
    updateAmount,
  };
}
