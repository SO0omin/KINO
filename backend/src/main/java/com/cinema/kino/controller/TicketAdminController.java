package com.cinema.kino.controller;

import com.cinema.kino.entity.ReservationTicket;
import com.cinema.kino.repository.ReservationTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tickets") // 💡 직원(관리자)용 주소
@RequiredArgsConstructor
public class TicketAdminController {

    private final ReservationTicketRepository ticketRepository;

    @PostMapping("/verify-and-use")
    @Transactional // 💡 상태를 변경해야 하므로 필수!
    public ResponseEntity<?> verifyAndUseTicket(@RequestBody Map<String, String> request) {
        String ticketCode = request.get("ticketCode");

        // 1. DB에서 해당 티켓 코드가 존재하는지 확인
        ReservationTicket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElse(null);

        if (ticket == null) {
            return ResponseEntity.status(404).body("시스템에 등록되지 않은 잘못된 QR코드입니다.");
        }

        // 2. 이미 사용된 티켓인지 확인
        if (ticket.isIssued()) {
            return ResponseEntity.status(409).body("이미 발급이 완료된 티켓입니다. (발급시간: " + ticket.getIssuedAt() + ")");
        }

        // 3. 미사용 티켓이라면 입장 처리 (상태 변경)
        ticket.issueTicket(); // 아까 엔티티에 만든 메서드 호출

        return ResponseEntity.ok(" 정상 티켓입니다. 빌급 완료되었습니다.");
    }
}