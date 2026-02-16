import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import {
  preparePayment,
  confirmPayment,
  getReservationDetail,
  type ReservationDetailResponse
} from '../api/paymentApi';

import type { PrepareRequest, ConfirmRequest } from '../types/dto/payment.dto';

/**
 * Toss 클라이언트 키 (공개 키)
 *
 * - 프론트엔드에 노출되어도 되는 키입니다.
 * - 실제 배포 환경에서는 .env로 분리하는 것을 권장합니다.
 */
const CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

/**
 * 결제 관련 로직을 캡슐화한 커스텀 훅입니다.
 *
 * 전체 흐름:
 * 1. 결제 페이지 진입 → 예약 상세 조회
 * 2. 결제 버튼 클릭 → preparePayment 호출 (서버 금액 확정 + 좌석 HELD)
 * 3. Toss 결제창 오픈
 * 4. successUrl에서 confirmPayment 호출 → 최종 결제 확정
 */
export function usePayment() {
  /**
   * 결제 요청 진행 중 여부
   * - 버튼 비활성화, 로딩 스피너 등에 사용
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 결제 페이지에 표시할 예약 상세 정보
   */
  const [reservationDetail, setReservationDetail] =
    useState<ReservationDetailResponse | null>(null);

  /**
   * 현재는 위젯 모드를 사용하지 않으므로 항상 true로 둡니다.
   * (추후 결제 위젯을 사용할 경우 SDK 로딩 상태로 대체 가능)
   */
  const isWidgetReady = true;

  /**
   * 예약 상세 정보 조회
   *
   * 사용 시점:
   * - 결제 페이지 진입 시 1회 호출
   */
  const fetchReservationDetail = async (reservationId: number) => {
    try {
      const data = await getReservationDetail(reservationId);
      setReservationDetail(data);
    } catch (error) {
      console.error('예약 정보 조회 실패:', error);
      // 필요 시 사용자 알림 처리 가능
    }
  };

  /**
   * 결제 시작 함수
   *
   * 내부 처리 단계:
   * 1. 서버에 prepare 요청 → 금액 재계산 및 주문번호(orderId) 생성
   * 2. Toss SDK 로드
   * 3. Toss 결제창 호출
   *
   * 중요:
   * - 결제 금액은 반드시 서버가 반환한 finalAmount를 사용해야 합니다.
   * - 프론트에서 계산한 금액은 신뢰하지 않습니다.
   */
  const requestPayment = async (prepareData: PrepareRequest) => {
    setIsLoading(true);

    try {
      // 1. 서버에서 결제 준비 처리
      const prepareResponse = await preparePayment(prepareData);

      // 2. Toss SDK 로드
      const tossPayments: any = await loadTossPayments(CLIENT_KEY);

      // 3. 결제창 호출
      await tossPayments.requestPayment('CARD', {
        amount: prepareResponse.finalAmount,
        orderId: prepareResponse.orderId,
        orderName: prepareResponse.orderName,

        // 결제 완료 후 리다이렉트될 URL
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
   * 결제 최종 확정 함수
   *
   * 사용 위치:
   * - success 페이지에서 URL 쿼리(paymentKey, orderId, amount)를 읽어 호출
   */
  const confirm = async (request: ConfirmRequest) => {
    return await confirmPayment(request);
  };

  /**
   * 위젯 모드 호환용 함수
   *
   * 현재는 실제 동작이 필요 없으므로
   * 인터페이스 유지 목적의 빈 함수로 둡니다.
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
    updateAmount
  };
}
