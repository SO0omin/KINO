import { useState } from 'react';
// v2 패키지 사용
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { preparePayment, confirmPayment, getReservationDetail, type ReservationDetailResponse } from '../api/paymentApi';
import type { PrepareRequest, ConfirmRequest } from '../types/dto/payment.dto';

// 님이 가진 'API 개별 연동 키' (test_ck_...)
const CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; 

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  // [복구] 아까 사라졌던 상태 변수 다시 추가
  const [reservationDetail, setReservationDetail] = useState<ReservationDetailResponse | null>(null);

  // 위젯을 안 쓰므로 항상 준비된 상태로 간주
  const isWidgetReady = true;

  // [복구] 예약 정보 가져오는 함수
  const fetchReservationDetail = async (reservationId: number) => {
    try {
      const data = await getReservationDetail(reservationId);
      setReservationDetail(data);
    } catch (error) {
      console.error("예약 정보 조회 실패:", error);
    }
  };

  const requestPayment = async (prepareData: PrepareRequest) => {
    setIsLoading(true);
    try {
      // 1. 백엔드 주문 생성
      const prepareResponse = await preparePayment(prepareData);
      
      // 2. 토스 SDK 로드 (타입 에러 방지를 위해 any 사용)
      const tossPayments: any = await loadTossPayments(CLIENT_KEY);

      // 3. 결제창 띄우기 (API 키 방식)
      await tossPayments.requestPayment('CARD', {
        amount: prepareResponse.finalAmount,
        orderId: prepareResponse.orderId,
        orderName: prepareResponse.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: 'KINO 고객',
      });

    } catch (error: any) {
      console.error("결제 에러:", error);
      if (error.code === 'USER_CANCEL') {
        // 사용자 취소
      } else {
        alert(`결제 실패: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirm = async (request: ConfirmRequest) => {
      return await confirmPayment(request);
  };

  // [수정] 숫자를 인자로 받도록 수정 (PaymentPage 에러 해결용)
  const updateAmount = async (amount: number) => {
    // 위젯 모드가 아니므로 여기서는 아무것도 안 해도 됨 (에러만 안 나게 빈 함수 유지)
    console.log("가격 업데이트:", amount);
  };

  return { 
    isWidgetReady, 
    isLoading, 
    reservationDetail,     // 이제 리턴해줌
    fetchReservationDetail, // 이제 리턴해줌
    requestPayment, 
    confirm, 
    updateAmount 
  };
}