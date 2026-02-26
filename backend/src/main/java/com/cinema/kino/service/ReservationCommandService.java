package com.cinema.kino.service;

import com.cinema.kino.dto.ReservationResponseDTO;
import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.repository.ReservationTicketRepository; // 💡 추가됨
import com.cinema.kino.repository.ScreeningRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // 💡 추가됨
import java.util.List;
import java.util.Map;
import java.util.UUID; // 💡 추가됨
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ReservationCommandService {

    private final SeatCommandService seatCommandService;
    private final ReservationRepository reservationRepository;
    private final ReservationTicketRepository reservationTicketRepository; // 💡 주입 추가
    private final MemberRepository memberRepository;
    private final ScreeningRepository screeningRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SeatService seatService;

    @Transactional
    public ReservationResponseDTO createPendingReservation(SeatSelectRequestDTO request) {

        // 🔥 [중요] 1. 좌석 찜하기(Hold) 및 비관적 락 실행
        // 이 과정에서 좌석 상태가 'HOLD'로 변경되고, 이미 선점된 경우 에러가 발생합니다.
        seatCommandService.holdSeats(request);

        // 2. 기초 정보 조회 (Member, Screening)
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 가격 정책 로직 호출
        Map<String, Integer> priceMap = seatService.getPricesForScreening(request.getScreeningId());

        // 3. 총 금액 계산
        int totalPrice = request.getTickets().stream()
                .mapToInt(t -> priceMap.getOrDefault(t.getPriceType(), 15000))
                .sum();

        // 4. 부모(Reservation) 생성 및 저장
        Reservation reservation = Reservation.builder()
                .member(member)
                .screening(screening)
                .status(ReservationStatus.PENDING)
                .totalNum(request.getTickets().size())
                .totalPrice(totalPrice)
                .orderId(UUID.randomUUID().toString()) // 💡 랜덤 주문 ID 생성
                .createdAt(LocalDateTime.now())
                .build();

        reservationRepository.save(reservation);

        // 5. 자식(ReservationTicket)들 생성 및 저장
        List<ReservationTicket> tickets = request.getTickets().stream()
                .map(t -> ReservationTicket.builder()
                        .reservation(reservation)
                        .seatId(t.getSeatId())
                        .priceType(PriceType.valueOf(t.getPriceType()))
                        .build())
                .collect(Collectors.toList());

        reservationTicketRepository.saveAll(tickets);

        // 6. 🚀 [WebSocket] 다른 유저들에게 방송!
        // 어떤 좌석들이 선점되었는지 리스트만 뽑아서 전송합니다.
        List<Long> holdSeatIds = request.getTickets().stream()
                .map(SeatSelectRequestDTO.TicketRequest::getSeatId)
                .collect(Collectors.toList());

        messagingTemplate.convertAndSend("/topic/screening/" + request.getScreeningId(), holdSeatIds);

        log.info("✅ 예약 생성 완료 - ID: {}, 총 금액: {}", reservation.getId(), totalPrice);

        return new ReservationResponseDTO(reservation.getId());
    }
}