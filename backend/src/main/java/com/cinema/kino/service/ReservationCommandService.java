package com.cinema.kino.service;

import com.cinema.kino.dto.ReservationResponseDTO;
import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.repository.*;
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
    private final ReservationTicketRepository reservationTicketRepository;
    private final GuestRepository guestRepository;
    private final MemberRepository memberRepository;
    private final ScreeningRepository screeningRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SeatService seatService;

    @Transactional
    public ReservationResponseDTO createPendingReservation(SeatSelectRequestDTO request) {

        // 🔥 [중요] 1. 좌석 찜하기(Hold) 및 비관적 락 실행
        // 이 과정에서 좌석 상태가 'HOLD'로 변경되고, 이미 선점된 경우 에러가 발생합니다.
        seatCommandService.holdSeats(request);

        // 기초 정보 조회

        Member member = null;
        Guest guest = null;

        if (request.getMemberId() != null) {
            member = memberRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        } else if (request.getGuestId() != null) {
            guest = guestRepository.findById(request.getGuestId())
                    .orElseThrow(() -> new IllegalArgumentException("비회원 정보를 찾을 수 없습니다."));
        } else {
            throw new IllegalArgumentException("회원 또는 비회원 식별 정보가 필요합니다.");
        }
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
                .member(member) // 회원이면 객체 들어감, 비회원이면 null 들어감
                .guest(guest)   // 비회원이면 객체 들어감, 회원이면 null 들어감
                .screening(screening)
                .status(ReservationStatus.PENDING)
                .totalNum(request.getTickets().size())
                .totalPrice(totalPrice)
                .orderId(UUID.randomUUID().toString())
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

        log.info("✅ 예약 생성 완료 - ID: {}, 예약자: {}, 총 금액: {}",
                reservation.getId(),
                member != null ? "회원(" + member.getId() + ")" : "비회원(" + guest.getId() + ")",
                totalPrice);

        return new ReservationResponseDTO(reservation.getId());
    }
}