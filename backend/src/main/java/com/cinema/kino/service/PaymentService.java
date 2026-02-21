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
import org.springframework.web.client.RestClientException;
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

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
    private static final String TOSS_CANCEL_URL_PREFIX = "https://api.tosspayments.com/v1/payments/";

    @Transactional(readOnly = true)
    public PaymentDTO.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예매 번호입니다."));

        Screening screening = reservation.getScreening();

        List<PaymentDTO.ReservationDetailResponse.SeatDetail> seatDetails =
                screeningSeatRepository.findByReservationId(reservationId)
                        .stream()
                        .map(ss -> {
                            PriceType pt = (ss.getPriceType() != null) ? ss.getPriceType() : PriceType.ADULT;
                            return new PaymentDTO.ReservationDetailResponse.SeatDetail(
                                    ss.getSeat().getId(),
                                    ss.getSeat().getSeatRow() + ss.getSeat().getSeatNumber(),
                                    pt
                            );
                        })
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
                .totalAmount(reservation.getTotalPrice())
                .status(reservation.getStatus().name())
                .build();
    }

    private ScreeningType determineScreeningType(LocalTime time) {
        if (time.isBefore(LocalTime.of(10, 0))) return ScreeningType.MORNING;
        if (time.isAfter(LocalTime.of(22, 0))) return ScreeningType.NIGHT;
        return ScreeningType.NORMAL;
    }

    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        if (request.getTickets() == null || request.getTickets().isEmpty()) {
            throw new IllegalArgumentException("좌석/요금 정보(tickets)가 비어있습니다.");
        }

        // 1) 예약/상영 존재 검증
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("기존 예약 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2) 원가 재계산
        int originalPrice = 0;

        LocalTime screenTime = screening.getStartTime().toLocalTime();
        ScreeningType sType = determineScreeningType(screenTime);
        log.info("[가격계산] 영화시간: {}, 적용타입: {}", screenTime, sType);

        // seatId -> priceType 저장용 맵
        Map<Long, PriceType> priceTypeMap = new HashMap<>();
        // 좌석 id는 중복 없이 관리(중복 seatId 들어오면 이상한 요청이라 방어)
        Set<Long> seatIdSet = new LinkedHashSet<>();

        for (PaymentDTO.TicketRequest ticketReq : request.getTickets()) {
            if (ticketReq == null) throw new IllegalArgumentException("tickets에 null 항목이 있습니다.");

            Long seatId = ticketReq.getSeatId();
            if (seatId == null) throw new IllegalArgumentException("tickets에 seatId가 없습니다.");

            if (!seatIdSet.add(seatId)) {
                throw new IllegalArgumentException("tickets에 중복 seatId가 있습니다: " + seatId);
            }

            PriceType pt = (ticketReq.getPriceType() != null) ? ticketReq.getPriceType() : PriceType.ADULT;
            priceTypeMap.put(seatId, pt);

            TicketPrice policy = ticketPriceRepository.findByScreenTypeAndPriceTypeAndScreeningType(
                    screening.getScreen().getScreenType(),
                    pt,
                    sType
            ).orElseThrow(() -> new IllegalArgumentException(
                    String.format("요금 정책 없음 (Screen: %s, Price: %s, Type: %s)",
                            screening.getScreen().getScreenType(), pt, sType)));

            originalPrice += policy.getPrice();
        }

        List<Long> seatIds = new ArrayList<>(seatIdSet);

        // 3) 할인/포인트(회원 전용)
        int discountAmount = 0;

        // 핵심 수정: 포인트는 회원일 때만 적용
        int usedPoints = 0;

        if (reservation.getMember() != null) {

            usedPoints = (request.getUsedPoints() != null) ? request.getUsedPoints() : 0;

            memberCouponRepository.findByReservation(reservation).ifPresent(old -> {
                if (old.getStatus() != MemberCouponStatus.USED) {
                    old.setStatus(MemberCouponStatus.AVAILABLE);
                    old.setReservation(null);
                    old.setHoldExpiresAt(null);
                }
            });

            // 3-1) 쿠폰 HOLD
            if (request.getMemberCouponId() != null) {
                MemberCoupon targetCoupon = memberCouponRepository.findHoldableCouponForUpdate(
                        request.getMemberCouponId(),
                        reservation.getMember().getId()
                ).orElseThrow(() -> new IllegalArgumentException("사용 가능한 쿠폰이 아닙니다."));

                targetCoupon.setStatus(MemberCouponStatus.HELD);
                targetCoupon.setReservation(reservation);
                targetCoupon.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));

                Coupon coupon = targetCoupon.getCoupon();
                discountAmount = (coupon.getDiscountType() == DiscountType.FIXED)
                        ? coupon.getDiscountValue()
                        : (int) (originalPrice * (coupon.getDiscountValue() / 100.0));
            }

            // 3-2) 포인트 잔액 검증
            if (usedPoints > 0) {
                int available = memberPointRepository.getAvailablePointsByMemberId(reservation.getMember().getId());
                if (available < usedPoints) throw new IllegalArgumentException("포인트 부족");
            }
        } else {
            // 비회원이면 포인트/쿠폰은 적용하지 않음(요청값이 와도 무시)
            usedPoints = 0;
        }

        // 4) 최종 금액 산출
        int finalVal = Math.max(0, originalPrice - discountAmount - usedPoints);

        // 5) 주문번호 생성 및 예약에 저장
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        reservation.setOrderId(orderId);

        // 6) Payment 레코드 준비(UPSERT)
        Payment payment = paymentRepository.findByReservation(reservation)
                .orElseGet(() -> Payment.builder()
                        .reservation(reservation)
                        .member(reservation.getMember())
                        .guest(reservation.getGuest())
                        .paymentStatus(PaymentStatus.READY)
                        .build());

        payment.setMerchantUid(orderId);
        payment.setOriginalAmount(originalPrice);
        payment.setDiscount(discountAmount);
        payment.setUsedPoints(usedPoints);
        payment.setFinalAmount(finalVal);
        payment.setPaymentMethod("CARD");
        paymentRepository.save(payment);

        // 7) 좌석 선점(LOCK 후 HELD)
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(), seatIds);

        // 요청한 좌석을 모두 못 가져오면(이미 누가 잡았거나 잘못된 요청) 실패 처리
        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("좌석 선점에 실패했습니다. 다시 선택해주세요.");
        }

        for (ScreeningSeat seat : seats) {
            // 이전 단계에서 넘어온 priceType을 ScreeningSeat에 저장
            PriceType pt = priceTypeMap.getOrDefault(seat.getSeat().getId(), PriceType.ADULT);
            seat.setPriceType(pt);

            seat.setStatus(SeatStatus.HELD);
            seat.setReservation(reservation);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));
        }

        // 8) 응답
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

    @Transactional
    public PaymentDTO.ConfirmResponse confirmPayment(PaymentDTO.ConfirmRequest request) {

        Payment payment = paymentRepository.findByMerchantUidForUpdate(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 대기 내역을 찾을 수 없습니다."));

        Reservation reservation = payment.getReservation();

        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("[멱등성] 이미 완료된 결제 orderId={}, reservationStatus={}",
                    request.getOrderId(), reservation.getStatus());
            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .build();
        }

        if (!Objects.equals(payment.getFinalAmount(), request.getAmount())) {
            log.warn("[금액불일치] orderId={}, expected={}, got={}",
                    request.getOrderId(), payment.getFinalAmount(), request.getAmount());
            releaseHeldCouponIfAny(reservation);
            throw new IllegalArgumentException("금액 불일치");
        }

        try {
            executeTossConfirmOrThrow(request);
        } catch (RuntimeException ex) {
            releaseHeldCouponIfAny(reservation);
            throw ex;
        }

        try {
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setImpUid(request.getPaymentKey());
            payment.setPaidAt(LocalDateTime.now());
            payment.setPgProvider("TOSS");

            reservation.setStatus(ReservationStatus.PAID);

            screeningSeatRepository.findByReservationId(reservation.getId())
                    .forEach(s -> s.setStatus(SeatStatus.RESERVED));

            memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
                if (mc.getStatus() == MemberCouponStatus.HELD) {
                    mc.setStatus(MemberCouponStatus.USED);
                    mc.setIsUsed(true);
                    mc.setUsedAt(LocalDateTime.now());
                    mc.setHoldExpiresAt(null);
                }
            });

            if (payment.getUsedPoints() > 0 && payment.getMember() != null) {
                memberPointRepository.save(MemberPoint.builder()
                        .member(payment.getMember())
                        .point(-payment.getUsedPoints())
                        .pointType(PointType.USE)
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .build();

        } catch (Exception dbEx) {

            log.error("[DB후처리실패] 승인 후 DB 실패. 전액취소 시도. orderId={}", request.getOrderId());

            try {
                executeTossCancelFull(request.getPaymentKey(), "DB update failed after confirm");
            } catch (Exception cancelEx) {
                log.error("[보상취소실패] paymentKey={}, err={}", request.getPaymentKey(), cancelEx.getMessage());
            }

            releaseHeldCouponIfAny(reservation);

            throw dbEx;
        }
    }

    private void executeTossConfirmOrThrow(PaymentDTO.ConfirmRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = createTossHeaders();

        Map<String, Object> body = new HashMap<>();
        body.put("paymentKey", request.getPaymentKey());
        body.put("orderId", request.getOrderId());
        body.put("amount", request.getAmount());

        try {
            ResponseEntity<String> resp = restTemplate.postForEntity(
                    TOSS_CONFIRM_URL,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("PG 승인 실패 (HTTP " + resp.getStatusCode() + ")");
            }

            log.info("[토스승인성공] orderId={}, paymentKey={}", request.getOrderId(), request.getPaymentKey());

        } catch (RestClientException e) {
            throw new RuntimeException("결제 승인 과정에서 PG사 통신 오류가 발생했습니다.");
        }
    }

    private void executeTossCancelFull(String paymentKey, String reason) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = createTossHeaders();

        Map<String, Object> body = new HashMap<>();
        body.put("cancelReason", reason);

        String url = TOSS_CANCEL_URL_PREFIX + paymentKey + "/cancel";

        try {
            ResponseEntity<String> resp = restTemplate.postForEntity(
                    url,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("PG 취소 실패 (HTTP " + resp.getStatusCode() + ")");
            }

        } catch (RestClientException e) {
            throw new RuntimeException("PG 취소 통신 오류");
        }
    }

    private HttpHeaders createTossHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private void releaseHeldCouponIfAny(Reservation reservation) {
        memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
            if (mc.getStatus() != MemberCouponStatus.USED) {
                mc.setStatus(MemberCouponStatus.AVAILABLE);
                mc.setReservation(null);
                mc.setHoldExpiresAt(null);
                log.info("[쿠폰 RELEASE] memberCouponId={}, reservationId={}", mc.getId(), reservation.getId());
            }
        });
    }
}
