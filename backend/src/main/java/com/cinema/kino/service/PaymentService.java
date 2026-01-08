package com.cinema.kino.service;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.entity.enums.PaymentStatus;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository; // 회원 조회용
    private final GuestRepository guestRepository;   // 비회원 조회용
    private final ScreeningRepository screeningRepository; // 상영 정보 조회용

    // [단계 1] 결제 준비: 좌석 선점 + 가예매 생성
    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        // 1. 상영 정보 조회 (주문명 생성을 위해)
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2. 회원/비회원 객체 조회 (ID가 아니라 객체를 찾아야 함!)
        Member member = null;
        if (request.getMemberId() != null) {
            member = memberRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        }

        Guest guest = null;
        if (request.getGuestId() != null) {
            guest = guestRepository.findById(request.getGuestId())
                    .orElseThrow(() -> new IllegalArgumentException("비회원을 찾을 수 없습니다."));
        }

        // 3. 좌석 조회 및 락 걸기 (동시성 제어)
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(), request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("일부 좌석 정보를 찾을 수 없습니다.");
        }

        // 4. 좌석 상태 검증 및 선점 (HELD)
        for (ScreeningSeat seat : seats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new IllegalStateException("이미 선택된 좌석입니다: " + seat.getSeat().getSeatNumber());
            }
            // [오류 해결 포인트] Id가 아닌 조회한 객체(member/guest)를 넣습니다.
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldByMember(member);
            seat.setHeldByGuest(guest);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10분간 선점
        }

        // 5. 예매(Reservation) 생성 - PENDING 상태
        // kino_db.sql에는 merchant_uid가 없으므로 ID 생성 후 리턴 전략 사용
        Reservation reservation = Reservation.builder()
                .member(member)
                .guest(guest)
                .screening(screening)
                .totalPrice(request.getTotalPrice())
                .totalNum(seats.size())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // 좌석에 예매 정보 연결 (선택 사항, 양방향 연관관계 관리를 위해 추천)
        for (ScreeningSeat seat : seats) {
            seat.setReservation(savedReservation);
        }

        String orderName = screening.getMovie().getTitle(); // 주문명 예: "아바타2"

        return new PaymentDTO.PrepareResponse(savedReservation.getId(), orderName);
    }

    // [단계 2] 결제 승인: 토스 검증 + 최종 확정
    @Transactional
    public Long confirmPayment(PaymentDTO.ConfirmRequest request) {

        // 1. 주문번호(예매ID)로 예매 조회
        Long reservationId = Long.parseLong(request.getOrderId());
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예매 정보를 찾을 수 없습니다."));

        // 2. 금액 검증 (중요: 해킹 방지)
        if (!reservation.getTotalPrice().equals(request.getAmount())) {
            throw new IllegalStateException("결제 금액이 일치하지 않습니다.");
        }

        // 3. 예매 상태 확정 (PENDING -> PAID)
        reservation.setStatus(ReservationStatus.PAID); // 엔티티에 setStatus가 있다고 가정

        // 4. 좌석 상태 확정 (HELD -> RESERVED)
        List<ScreeningSeat> seats = screeningSeatRepository.findByReservationId(reservationId);
        for (ScreeningSeat seat : seats) {
            seat.setStatus(SeatStatus.RESERVED);
            seat.setHoldExpiresAt(null); // 만료시간 제거
        }

        // 5. 결제(Payment) 테이블 저장
        // kino_db.sql의 payments 테이블 구조를 그대로 따릅니다.
        Payment payment = Payment.builder()
                .reservation(reservation)
                .member(reservation.getMember())
                .guest(reservation.getGuest())
                .merchantUid(request.getOrderId()) // 주문번호
                .impUid(request.getPaymentKey())   // 토스 PaymentKey
                .originalAmount(request.getAmount())
                .finalAmount(request.getAmount())
                .paymentMethod("CARD") // 예시: 카드
                .paymentStatus(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return payment.getId();
    }
}