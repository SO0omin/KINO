import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { SeatStatusMessage } from "../types/dtos/seatBooking.dto";
import { API_BASE_URL } from "../api/api";

class SeatSocket {
  private stompClient: Client | null = null;
  private currentSubscription: any = null;

  connect(screeningId: number, callback: (data: SeatStatusMessage[]) => void) {
    if (this.stompClient) {
      this.disconnect();
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL || window.location.origin}/ws-seat`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ 좌석 WS 연결 성공');

        // 좌석 선점/해제 전용 채널 (예매 모달의 /topic/screening/{id}와 분리)
        const subscribeUrl = `/topic/seats/${screeningId}`;
        console.log("📍 구독 시도 주소:", subscribeUrl);

        if (this.currentSubscription) {
          this.currentSubscription.unsubscribe();
        }

        // 새 상영관 구독 시작
        this.currentSubscription = this.stompClient?.subscribe(subscribeUrl, (message: IMessage) => {
          try {
            // 서버는 [{ seatId, status }, ...] 형태로 변경된 좌석만 보냅니다.
            const data: SeatStatusMessage[] = JSON.parse(message.body);
            console.log("🔍 [WS 파싱 완료] 업데이트 될 좌석 데이터:", data);
            callback(data);
          } catch (error) {
            console.error("데이터 파싱 에러:", error);
          }
        });
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame.headers['message']);
        console.error('상세 에러 내용:', frame.body);
      },

      onWebSocketClose: () => {
        console.log('🔌 WebSocket 연결 종료');
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    this.stompClient?.deactivate();
    this.stompClient = null;
    console.log('👋 소켓 연결 해제 완료');
  }
}

// 싱글톤으로 내보내기 (아주 좋은 패턴입니다!)
export const seatSocketService = new SeatSocket();
