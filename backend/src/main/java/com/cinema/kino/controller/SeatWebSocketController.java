package com.cinema.kino.controller;

import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.dto.SeatStatusResponseDTO;
import com.cinema.kino.service.SeatCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Slf4j // 💡 실무용 로거 추가 (System.out.println 대체)
@Controller
@RequiredArgsConstructor
public class SeatWebSocketController {

    private final SeatCommandService seatCommandService;
    private final SimpMessagingTemplate messagingTemplate;

    // ❌ @Transactional 제거 (컨트롤러에는 쓰지 않습니다!)
    @MessageMapping("/seat/hold")
    public void holdSeat(@Payload SeatSelectRequestDTO request) {

        log.info("[WS] 좌석 선점 요청 도착 - 상영ID: {}, 좌석수: {}",
                request.getScreeningId(),
                request.getSeatIds() != null ? request.getSeatIds().size() : 0);

        try {
            // 💡 컨트롤러에서는 for문을 돌리지 않고, Service에 통째로 위임합니다.
            // Service가 DTO 리스트를 반환하도록 설계 변경을 추천합니다.
            List<SeatStatusResponseDTO> responses = seatCommandService.holdSeats(request);

            // 정상 처리 시 구독자들에게 상태 변경 브로드캐스팅
            messagingTemplate.convertAndSend(
                    "/topic/screening/" + request.getScreeningId(),
                    responses
            );

            log.info("[WS] 좌석 선점 브로드캐스팅 완료 - 상영ID: {}", request.getScreeningId());

        } catch (IllegalStateException e) {
            // "이미 선택된 좌석입니다" 등의 비즈니스 예외 처리
            log.warn("[WS] 좌석 선점 실패 (비즈니스 예외): {}", e.getMessage());
            // 💡 프론트엔드에 에러 상태를 알려주어 선택을 롤백(취소)하게 만듭니다.
            messagingTemplate.convertAndSend(
                    "/topic/screening/" + request.getScreeningId() + "/error",
                    e.getMessage()
            );
        } catch (Exception e) {
            // 기타 서버 에러 처리
            log.error("[WS] 좌석 선점 중 서버 에러 발생", e);
        }
    }
}