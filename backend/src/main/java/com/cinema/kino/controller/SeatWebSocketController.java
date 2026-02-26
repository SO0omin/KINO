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
import java.util.stream.Collectors;

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
                request.getTickets() != null ? request.getTickets().size() : 0);

        try {
            List<Long> seatIds = request.getTickets().stream()
                    .map(SeatSelectRequestDTO.TicketRequest::getSeatId)
                    .collect(Collectors.toList());

            messagingTemplate.convertAndSend(
                    "/topic/screening/" + request.getScreeningId(), seatIds
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