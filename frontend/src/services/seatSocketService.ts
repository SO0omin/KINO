import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { SeatInfoDto } from "../types/dtos/SeatBookingResponseDto";

interface HoldSeatPayload {
  screeningId: number;
  seatIds: number[];
  memberId: number | null;
  guestId: number | null;
}

class SeatSocket {
  private stompClient: Client | null = null;
  private currentSubscription: any = null;

  connect(screeningId: number, callback: (data: SeatInfoDto[]) => void) {
    if (this.stompClient) {
      this.disconnect();
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-seat'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ 좌석 WS 연결 성공');
        
        const subscribeUrl = `/topic/screening/${screeningId}`;
        console.log("📍 구독 시도 주소:", subscribeUrl);

        if (this.currentSubscription) {
          this.currentSubscription.unsubscribe();
        }

        // 새 상영관 구독 시작
        this.currentSubscription = this.stompClient?.subscribe(subscribeUrl, (message: IMessage) => {
          console.log("📩 서버로부터 메시지 수신:", message.body);
          try {
            // 💡 여기서 서버가 보낸 리스트(배열)를 파싱합니다.
            const data: SeatInfoDto[] = JSON.parse(message.body);
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

  // 좌석 점유 요청 전송
  holdSeat(payload: HoldSeatPayload) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("❌ 전송 실패: 소켓이 연결되어 있지 않습니다.");
      return;
    }

    try {
      this.stompClient.publish({
        // 💡 주의: 백엔드 WebSocketConfig에 setApplicationDestinationPrefixes("/app") 설정이 되어있어야 함
        destination: '/app/seat/hold', 
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' }
      });
      console.log("✅ [성공] 서버로 전송 완료!");
    } catch (e) {
      console.error("❌ [에러] publish 중 예외 발생:", e);
    }
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
export const seatService = new SeatSocket();