package com.cinema.kino.controller;

import com.cinema.kino.dto.*;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.service.TicketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ticketing")
@RequiredArgsConstructor // final 필드에 대해 생성자 주입을 자동으로 생성
public class TicketingController {

    private final TicketingService ticketingService;
    // messagingTemplate은 final로 선언하여 생성자 주입 하나만 남김
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/regions")
    public ResponseEntity<List<RegionDTO>> getRegions() {
        return ResponseEntity.ok(ticketingService.getAllRegions());
    }

    @GetMapping("/special-types")
    public ResponseEntity<List<String>> getSpecialTypes() {
        return ResponseEntity.ok(Arrays.stream(ScreenType.values())
                .filter(type -> !type.equals(ScreenType._2D))
                .map(ScreenType::getValue)
                .collect(Collectors.toList()));
    }

    @GetMapping("/theaters")
    public ResponseEntity<List<TheaterDTO>> getTheaters(
            @RequestParam(name = "regionId", required = false) Long regionId,
            @RequestParam(name = "specialType", required = false) String specialType
    ) {
        return ResponseEntity.ok(ticketingService.getFilteredTheaters(regionId, specialType));
    }

    @GetMapping("/movies")
    public ResponseEntity<List<MovieDTO>> getMovies() {
        return ResponseEntity.ok(ticketingService.getAllMovies());
    }

    @GetMapping("/available-movies")
    public ResponseEntity<List<Long>> getAvailableMovies(
            @RequestParam(name = "theaterIds", required = false) List<Long> theaterIds,
            @RequestParam(name = "date") String dateStr,
            @RequestParam(name = "specialType", required = false) String specialType
    ) {
        LocalDate date = LocalDate.parse(dateStr);
        return ResponseEntity.ok(ticketingService.getAvailableMovieIds(theaterIds, date, specialType));
    }

    @GetMapping("/screenings")
    public ResponseEntity<List<ScreeningDTO>> getScreenings(
            @RequestParam(name = "theaterIds", required = false) List<Long> theaterIds,
            @RequestParam(name = "movieIds", required = false) List<Long> movieIds,
            @RequestParam(name = "date") String dateStr,
            @RequestParam(name = "specialType", required = false) String specialType
    ) {
        LocalDate date = LocalDate.parse(dateStr);
        return ResponseEntity.ok(ticketingService.getScreeningDetails(theaterIds, movieIds, date, specialType));
    }

    @GetMapping("/available-theaters")
    public ResponseEntity<List<Long>> getAvailableTheaters(
            @RequestParam(name = "movieIds") List<Long> movieIds,
            @RequestParam(name = "date") String dateStr) {
        return ResponseEntity.ok(ticketingService.getAvailableTheaterIds(movieIds, LocalDate.parse(dateStr)));
    }

    @GetMapping("/screenings/{id}/seats")
    public ResponseEntity<List<SeatResponseDTO>> getScreeningSeats(@PathVariable(name = "id") Long screeningId) {
        return ResponseEntity.ok(ticketingService.getScreeningSeats(screeningId));
    }

    @MessageMapping("/seat/select")
    public void handleSeatSelection(SeatStatusDTO seatStatus) {
        // 구독 중인 모든 사용자에게 알림 발송
        messagingTemplate.convertAndSend("/topic/screening/" + seatStatus.getScreeningId(), seatStatus);
    }

    // 실시간 테스트를 위한 API
    @GetMapping("/api/test/push-seat")
    public String testPush(@RequestParam(name = "screeningId") Long screeningId,
                           @RequestParam(name = "seatId") Long seatId,
                           @RequestParam(name = "status") String status) {

        Map<String, Object> data = new HashMap<>();
        data.put("seatId", seatId);
        data.put("status", status);

        // (Object)로 형변환하여 Ambiguous 에러를 해결
        messagingTemplate.convertAndSend("/topic/screening/" + screeningId, (Object) data);

        return "신호 발송 완료! screeningId: " + screeningId + ", seatId: " + seatId + ", status: " + status;
    }
}