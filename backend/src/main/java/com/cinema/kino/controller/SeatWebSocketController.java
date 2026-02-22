/* ========================
살사건 좌석 이벤트 처리
WebSocket
======================== */
package com.cinema.kino.controller;

import com.cinema.kino.dto.SeatSelectRequestDto;
import com.cinema.kino.dto.SeatStatusResponseDto;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.service.SeatCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SeatWebSocketController {

    private final SeatCommandService seatCommandService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/seat/hold")
    public void holdSeat(@Payload SeatSelectRequestDto request) {
        // 💡 로그 추가
        System.out.println("🚀 [WS] holdSeat 호출됨! screeningId: " + request.getScreeningId() + ", seatId: " + request.getSeatId());

        try {
            ScreeningSeat ss = seatCommandService.holdSeat(
                    request.getScreeningId(),
                    request.getSeatId(),
                    request.getMemberId(),
                    request.getGuestId()
            );

            SeatStatusResponseDto dto = SeatStatusResponseDto.from(ss);
            System.out.println("✅ [WS] 좌석 상태 변경 성공: " + dto.getStatus());

            messagingTemplate.convertAndSend(
                    "/topic/screening/" + request.getScreeningId(),
                    dto
            );
        } catch (Exception e) {
            System.err.println("❌ [WS] 에러 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}