import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import {
  preparePayment,
  confirmPayment,
  getReservationDetail,
} from '../api/paymentApi';

import type {
  PrepareRequest,
  ConfirmRequest,
  ReservationDetailResponse,
} from '../types/dto/payment.dto';

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY ?? '';

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

  const requestPayment = async (
    prepareData: PrepareRequest,
    paymentType: TossPaymentType = 'CARD'
  ) => {
    setIsLoading(true);

    try {
      if (!CLIENT_KEY) {
        throw new Error('토스 클라이언트 키가 설정되지 않았습니다. (.env의 VITE_TOSS_CLIENT_KEY 확인)');
      }

      const prepareResponse = await preparePayment(prepareData);

      const tossPayments: any = await loadTossPayments(CLIENT_KEY);
      const reservationId = prepareData.reservationId;

      await tossPayments.requestPayment(paymentType, {
        amount: prepareResponse.finalAmount,
        orderId: prepareResponse.orderId,
        orderName: prepareResponse.orderName,

        successUrl: `${window.location.origin}/payment/success?reservationId=${reservationId}`,
        failUrl: `${window.location.origin}/payment/fail?reservationId=${reservationId}`,

        customerName: 'KINO 고객',
      });

    } catch (error: any) {
      console.error('결제 에러:', error);

      if (error?.code === 'USER_CANCEL') {
        return;
      }

      alert(`결제 실패: ${error?.message ?? '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirm = async (request: ConfirmRequest) => {
    return await confirmPayment(request);
  };

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
