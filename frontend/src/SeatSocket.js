import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
class SeatSocket {
    stompClient = null;
    currentSubscription = null;
    connect(screeningId, onMessage) {
        // 이미 연결되어 있고 같은 screeningId를 구독 중이라면 중복 실행 방지
        if (this.stompClient?.connected) {
            console.log('이미 소켓이 연결되어 있습니다.');
            return;
        }
        this.stompClient = new Client({
            // 💡 서버의 withSockJS() 설정과 맞추기 위해 SockJS 사용
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-seat'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ 좌석 WS 연결 성공');
                const subscribeUrl = `/topic/screening/${screeningId}`;
                console.log("📍 구독 시도 주소:", subscribeUrl);
                // 기존 구독이 있다면 해제
                if (this.currentSubscription) {
                    this.currentSubscription.unsubscribe();
                }
                // 새 상영관 구독 시작
                this.currentSubscription = this.stompClient?.subscribe(subscribeUrl, (message) => {
                    console.log("📩 서버로부터 메시지 수신:", message.body);
                    try {
                        const data = JSON.parse(message.body);
                        onMessage(data);
                    }
                    catch (error) {
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
    holdSeat(payload) {
        console.log("🚀 [전송 시도] 페이로드:", payload);
        if (!this.stompClient || !this.stompClient.connected) {
            console.error("❌ 전송 실패: 소켓이 연결되어 있지 않습니다.");
            return;
        }
        try {
            this.stompClient.publish({
                destination: '/app/seat/hold',
                body: JSON.stringify(payload),
            });
            console.log("✅ [성공] 서버로 전송 완료!");
        }
        catch (e) {
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
export const seatService = new SeatSocket();
