import { useState, useEffect } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import type { Seat } from '../types/ticketing';

export const useSeatWebSocket = (isOpen: boolean, screeningId: number | undefined, initialSeats: Seat[]) => {
  const [currentSeats, setCurrentSeats] = useState<Seat[]>(initialSeats);

  // 1. 초기 데이터 동기화 및 로그 출력
  useEffect(() => {
    if (initialSeats.length > 0) {
      setCurrentSeats(initialSeats);
      if (isOpen) {
        console.log("현재 모달의 유효 좌석 ID 리스트:", initialSeats.map(s => s.id));
      }
    }
  }, [initialSeats, isOpen]);

  // 2. 실시간 웹소켓 연결
  useEffect(() => {
    if (!isOpen || !screeningId) return;

    const socket = new SockJS('http://localhost:8080/ws-kino');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/screening/${screeningId}`, (message) => {
        const updatedData = JSON.parse(message.body);
        console.log("[Websocket] 데이터 수신:", updatedData); 

        setCurrentSeats((prevSeats) => {
          const targetSeat = prevSeats.find(s => Number(s.id) === Number(updatedData.seatId));
          if (targetSeat) {
            console.log(`${updatedData.seatId}번 좌석의 상태를 ${updatedData.status}로 바꿉니다.`);
          } else {
            console.error(`에러: 현재 화면(screeningId: ${screeningId})에는 ID ${updatedData.seatId}인 좌석이 존재하지 않습니다`);
          }

          return prevSeats.map((s) =>
            Number(s.id) === Number(updatedData.seatId) 
              ? { ...s, status: updatedData.status } : s
          );
        });
      });
    });

    return () => {
      if (stompClient.connected) stompClient.disconnect(() => {});
    };
  }, [isOpen, screeningId]);

  return { currentSeats };
};