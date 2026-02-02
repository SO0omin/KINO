package com.cinema.kino.service;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.*;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScreeningRepository screeningRepository;
    private final TicketPriceRepository ticketPriceRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberPointRepository memberPointRepository;

    @Value("${toss.secret-key}")
    private String secretKey;

    // [조회 로직 생략 - 기존과 동일]
    @Transactional(readOnly = true)
    public PaymentDTO.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예매 번호입니다."));

        Screening screening = reservation.getScreening();
        List<PaymentDTO.ReservationDetailResponse.SeatDetail> seatDetails = screeningSeatRepository.findByReservationId(reservationId)
                .stream()
                .map(ss -> new PaymentDTO.ReservationDetailResponse.SeatDetail(
                        ss.getSeat().getId(),
                        ss.getSeat().getSeatRow() + ss.getSeat().getSeatNumber()))
                .collect(Collectors.toList());

        return PaymentDTO.ReservationDetailResponse.builder()
                .reservationId(reservation.getId())
                .screeningId(screening.getId())
                .memberId(reservation.getMember() != null ? reservation.getMember().getId() : null)
                .guestId(reservation.getGuest() != null ? reservation.getGuest().getId() : null)
                .movieTitle(screening.getMovie().getTitle())
                .posterUrl(screening.getMovie().getPosterUrl())
                .theaterName(screening.getScreen().getTheater().getName())
                .screenName(screening.getScreen().getName())
                .startTime(screening.getStartTime().toString())
                .seats(seatDetails)
                .totalAmount(reservation.getTotalPrice()) // 초기 예매 시 저장된 원금
                .status(reservation.getStatus().name())
                .build();
    }

    // [수정 1] 시간대 판별 로직 명확화 (로그 추가)
    private ScreeningType determineScreeningType(LocalTime time) {
        // 10:00 이전 -> 조조 (09:59까지)
        if (time.isBefore(LocalTime.of(10, 0))) return ScreeningType.MORNING;
        // 22:00 이후 -> 심야 (22:01부터)
        if (time.isAfter(LocalTime.of(22, 0))) return ScreeningType.NIGHT;
        // 그 외 -> 일반
        return ScreeningType.NORMAL;
    }

    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("기존 예약 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 1. 원가 계산 로직
        int originalPrice = 0;
        List<Long> seatIds = new ArrayList<>();

        LocalTime screenTime = screening.getStartTime().toLocalTime();
        ScreeningType sType = determineScreeningType(screenTime);

        log.info("[가격계산] 영화시간: {}, 적용타입: {}", screenTime, sType);

        for (PaymentDTO.TicketRequest ticketReq : request.getTickets()) {
            seatIds.add(ticketReq.getSeatId());

            // [중요] DB 데이터와 Enum 매핑 확인
            TicketPrice policy = ticketPriceRepository.findByScreenTypeAndPriceTypeAndScreeningType(
                    screening.getScreen().getScreenType(), // 2D, IMAX...
                    ticketReq.getPriceType(),              // ADULT, YOUTH...
                    sType                                  // MORNING, NORMAL...
            ).orElseThrow(() -> new IllegalArgumentException(
                    String.format("요금 정책 없음 (Screen: %s, Price: %s, Type: %s)",
                            screening.getScreen().getScreenType(), ticketReq.getPriceType(), sType)));

            originalPrice += policy.getPrice();
        }

        // 2. 할인 적용
        int discountAmount = 0;
        int usedPoints = (request.getUsedPoints() != null) ? request.getUsedPoints() : 0;

        if (reservation.getMember() != null) {
            // 쿠폰 로직 (기존 유지)
            if (request.getMemberCouponId() != null) {
                MemberCoupon targetCoupon = memberCouponRepository.findAvailableCoupon(
                        request.getMemberCouponId(),
                        reservation.getMember().getId(),
                        reservation.getId()
                ).orElseThrow(() -> new IllegalArgumentException("사용 가능한 쿠폰이 아닙니다."));

                targetCoupon.setReservation(reservation);
                Coupon coupon = targetCoupon.getCoupon();
                discountAmount = (coupon.getDiscountType() == DiscountType.FIXED)
                        ? coupon.getDiscountValue()
                        : (int) (originalPrice * (coupon.getDiscountValue() / 100.0));
            }
            // 포인트 로직 (기존 유지)
            if (usedPoints > 0) {
                int available = memberPointRepository.getAvailablePointsByMemberId(reservation.getMember().getId());
                if (available < usedPoints) throw new IllegalArgumentException("포인트 부족");
            }
        }

        int finalVal = Math.max(0, originalPrice - discountAmount - usedPoints);
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8); // 매번 새로운 주문번호 생성

        // [수정 2] Reservation에는 OrderId만 업데이트 (가격 덮어쓰기 금지)
        reservation.setOrderId(orderId);
        // 주의: setTotalPrice 제거함 (원금 보존)

        // [수정 3] UPSERT 로직 (중복 에러 해결의 핵심)
        // Reservation 객체로 조회해야 정확함
        Payment payment = paymentRepository.findByReservation(reservation)
                .orElseGet(() -> Payment.builder()
                        .reservation(reservation)
                        .member(reservation.getMember())
                        .guest(reservation.getGuest())
                        .paymentStatus(PaymentStatus.READY)
                        .build());

        // 기존 객체든 새 객체든, 결제 시도 시점의 정보로 '덮어쓰기'
        payment.setMerchantUid(orderId); // 주문번호 갱신 (중요)
        payment.setOriginalAmount(originalPrice);
        payment.setDiscount(discountAmount);
        payment.setUsedPoints(usedPoints);
        payment.setFinalAmount(finalVal);
        payment.setPaymentMethod("CARD"); // 기본값

        paymentRepository.save(payment); // ID가 있으면 Update, 없으면 Insert

        // 좌석 선점 처리 (기존 유지)
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(request.getScreeningId(), seatIds);
        for (ScreeningSeat seat : seats) {
            seat.setStatus(SeatStatus.HELD);
            seat.setReservation(reservation);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));
        }

        return PaymentDTO.PrepareResponse.builder()
                .reservationId(reservation.getId())
                .orderId(orderId)
                .orderName(screening.getMovie().getTitle())
                .originalPrice(originalPrice)
                .discountAmount(discountAmount)
                .usedPoints(usedPoints)
                .finalAmount(finalVal)
                .calculatedPrice(finalVal)
                .build();
    }

    // [Confirm 로직 - 기존 코드 유지하되 Repository 메서드 변경]
    @Transactional
    public PaymentDTO.ConfirmResponse confirmPayment(PaymentDTO.ConfirmRequest request) {
        Payment payment = paymentRepository.findByMerchantUid(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 대기 내역을 찾을 수 없습니다."));

        if (!payment.getFinalAmount().equals(request.getAmount())) {
            throw new IllegalArgumentException("금액 불일치");
        }

        executeTossConfirm(request);

        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setImpUid(request.getPaymentKey());
        payment.setPaidAt(LocalDateTime.now());
        payment.setPgProvider("TOSS");

        Reservation reservation = payment.getReservation();
        reservation.setStatus(ReservationStatus.PAID);
        screeningSeatRepository.findByReservationId(reservation.getId()).forEach(s -> s.setStatus(SeatStatus.RESERVED));

        memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
            mc.setIsUsed(true);
            mc.setUsedAt(LocalDateTime.now());
        });

        // 포인트 차감 로직 (기존 유지)
        if (payment.getUsedPoints() > 0 && payment.getMember() != null) {
            memberPointRepository.save(MemberPoint.builder()
                    .member(payment.getMember())
                    .point(-payment.getUsedPoints())
                    .pointType(PointType.USE)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        return PaymentDTO.ConfirmResponse.builder().paymentId(payment.getId()).build();
    }

    // [executeTossConfirm - 기존 유지]
    private void executeTossConfirm(PaymentDTO.ConfirmRequest request) {
        // ... (기존과 동일) ...
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("paymentKey", request.getPaymentKey());
        body.put("orderId", request.getOrderId());
        body.put("amount", request.getAmount());

        try {
            restTemplate.postForEntity("https://api.tosspayments.com/v1/payments/confirm", new HttpEntity<>(body, headers), String.class);
        } catch (Exception e) {
            log.error("Toss API 승인 실패: {}", e.getMessage());
            throw new RuntimeException("결제 승인 과정에서 PG사 통신 오류가 발생했습니다.");
        }
    }
}