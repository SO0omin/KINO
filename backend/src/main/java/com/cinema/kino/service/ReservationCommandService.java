package com.cinema.kino.service;

import com.cinema.kino.dto.ReservationResponseDTO;
import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.dto.SeatStatusMessage;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.repository.*;
import com.cinema.kino.util.AuthenticatedActor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
    public ReservationResponseDTO createPendingReservation(SeatSelectRequestDTO request, AuthenticatedActor actor) {
        seatCommandService.holdSeats(request, actor); //좌석 선점

        Member member = null;
        Guest guest = null;

        //예약 주체는 토큰에서 해석된 값만 사용 (요청 본문의 id는 신뢰하지 않음)
        if (actor.memberId() != null) {
            member = memberRepository.findById(actor.memberId())
                    .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        } else {
            guest = guestRepository.findById(actor.guestId())
                    .orElseThrow(() -> new IllegalArgumentException("비회원 정보를 찾을 수 없습니다."));
        }

        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        //가격 가져오기
        Map<String, Integer> priceMap = seatService.getPricesForScreening(request.getScreeningId());

        //총금액
        int totalPrice = request.getTickets().stream()
                .mapToInt(t -> priceMap.getOrDefault(t.getPriceType().name(), 15000))
                .sum();

        //Reservation 생성 및 저장
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

        //ReservationTicket 생성 및 저장
        List<ReservationTicket> tickets = request.getTickets().stream()
                .map(t -> ReservationTicket.builder()
                        .reservation(reservation)
                        .seatId(t.getSeatId())
                        .priceType(PriceType.valueOf(t.getPriceType().name()))
                        .ticketCode(UUID.randomUUID().toString()) // 겹치지 않는 난수 발급!
                        .isIssued(false) // 처음엔 무조건 발급안함
                        .build())
                .collect(Collectors.toList());

        reservationTicketRepository.saveAll(tickets);

        // [WebSocket] 다른 유저들에게 브로드캐스팅: 어떤 좌석이 어떤 상태가 되었는지 전송
        List<SeatStatusMessage> heldSeats = request.getTickets().stream()
                .map(t -> SeatStatusMessage.of(t.getSeatId(), SeatStatus.HELD))
                .collect(Collectors.toList());

        broadcastAfterCommit(request.getScreeningId(), heldSeats);

        log.info("✅ 예약 생성 완료 - ID: {}, 예약자: {}, 총 금액: {}",
                reservation.getId(),
                member != null ? "회원(" + member.getId() + ")" : "비회원(" + guest.getId() + ")",
                totalPrice);

        return new ReservationResponseDTO(reservation.getId());
    }

    /**
     * 커밋이 끝난 뒤에 방송합니다.
     * 트랜잭션 안에서 바로 쏘면, 이후 롤백됐을 때 다른 사용자 화면에만
     * "선점됨"이 남아버리기 때문입니다.
     */
    private void broadcastAfterCommit(Long screeningId, List<SeatStatusMessage> messages) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            messagingTemplate.convertAndSend("/topic/seats/" + screeningId, messages);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSend("/topic/seats/" + screeningId, messages);
            }
        });
    }
}
