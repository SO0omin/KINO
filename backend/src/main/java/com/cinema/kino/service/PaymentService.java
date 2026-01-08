package com.cinema.kino.service;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.PaymentStatus;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final GuestRepository guestRepository;
    private final ScreeningRepository screeningRepository;

    // [단계 1] 결제 준비: 좌석 선점 + 가예매 생성 + 주문번호(UUID) 발급
    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        // 1. 상영 정보 조회
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2. 회원/비회원 객체 조회 (둘 중 하나는 있어야 함)
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

        // 회원, 비회원 둘 다 없으면 예외 처리 (선택 사항)
        if (member == null && guest == null) {
            throw new IllegalArgumentException("예매자 정보(회원 또는 비회원)가 필요합니다.");
        }

        // 3. 좌석 조회 및 락 걸기 (동시성 제어: 비관적 락 사용 전제)
        // Repository에 @Lock(PESSIMISTIC_WRITE) 쿼리가 있어야 함
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(), request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("요청한 좌석 중 일부를 찾을 수 없습니다.");
        }

        // 4. 좌석 상태 검증 및 선점 (HELD)
        LocalDateTime now = LocalDateTime.now();
        for (ScreeningSeat seat : seats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new IllegalStateException("이미 선택된 좌석입니다: " + seat.getSeat().getSeatNumber());
            }
            seat.setStatus(SeatStatus.HELD);
            seat.setHeldByMember(member);
            seat.setHeldByGuest(guest); // 비회원 정보 입력
            seat.setHoldExpiresAt(now.plusMinutes(10)); // 10분 선점
        }

        // 5. 예매(Reservation) 생성 - PENDING 상태
        Reservation reservation = Reservation.builder()
                .member(member)
                .guest(guest) // 비회원 정보 입력
                .screening(screening)
                .totalPrice(request.getTotalPrice())
                .totalNum(seats.size())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // 좌석에 예매 정보 연결
        for (ScreeningSeat seat : seats) {
            seat.setReservation(savedReservation);
        }

        // 6. 주문 ID 생성 (ID + UUID 조합으로 유니크성 보장)
        // 예: "105-a1b2c3d4"
        String orderId = savedReservation.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        String orderName = screening.getMovie().getTitle();

        // DTO 반환 (orderId는 이제 UUID가 포함된 문자열)
        return new PaymentDTO.PrepareResponse(savedReservation.getId(), orderId, orderName);
    }

    // [단계 2] 결제 승인: 토스 검증 + 최종 확정
    @Transactional
    public Long confirmPayment(PaymentDTO.ConfirmRequest request) {

        // 1. 주문번호 파싱 ( "105-a1b2c3d4" -> 105 )
        String[] parts = request.getOrderId().split("-");
        Long reservationId = Long.parseLong(parts[0]);

        // 2. 예매 정보 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예매 정보를 찾을 수 없습니다."));

        // 3. [검증] 결제 금액 일치 여부
        if (reservation.getTotalPrice().intValue() != request.getAmount()) {
            throw new IllegalStateException("결제 요청 금액과 예매 금액이 일치하지 않습니다.");
        }

        // 4. [검증] 좌석 선점 유효성 체크
        List<ScreeningSeat> seats = screeningSeatRepository.findByReservationId(reservationId);
        if (seats.isEmpty()) {
            throw new IllegalStateException("선점된 좌석이 없습니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (ScreeningSeat seat : seats) {
            // HELD 상태가 아니거나, 만료 시간이 지났으면 오류
            if (seat.getStatus() != SeatStatus.HELD ||
                    (seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().isBefore(now))) {
                throw new IllegalStateException("좌석 선점 시간이 만료되었거나 유효하지 않습니다. 다시 예매해주세요.");
            }
        }

        // 5. [외부 연동] Toss Payments 승인 API 호출 (가상 코드)
        /*
        try {
            // orderId는 UUID가 포함된 전체 문자열을 보냄
            tossPaymentClient.confirm(request.getPaymentKey(), request.getOrderId(), request.getAmount());
        } catch (Exception e) {
            throw new IllegalStateException("결제 승인 실패: " + e.getMessage());
        }
        */

        // 6. 예매 상태 확정 (PENDING -> PAID)
        reservation.setStatus(ReservationStatus.PAID);

        // 7. 좌석 상태 확정 (HELD -> RESERVED)
        for (ScreeningSeat seat : seats) {
            seat.setStatus(SeatStatus.RESERVED);
            seat.setHoldExpiresAt(null);
        }

        // 8. 결제 정보 저장
        Payment payment = Payment.builder()
                .reservation(reservation)
                .member(reservation.getMember())
                .guest(reservation.getGuest()) // 비회원 정보 저장
                .merchantUid(request.getOrderId()) // UUID 포함된 주문번호 저장
                .impUid(request.getPaymentKey())
                .originalAmount(reservation.getTotalPrice())
                .finalAmount(request.getAmount())
                .paymentMethod("CARD")
                .pgProvider("TOSS")
                .paymentStatus(PaymentStatus.PAID)
                .paidAt(now)
                .build();

        paymentRepository.save(payment);

        return payment.getId();
    }
}