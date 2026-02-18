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

/**
 * 결제(Payment) 도메인 서비스
 *
 * 담당 흐름:
 * 1) 결제 화면 진입용 예약 상세 조회(getReservationDetail)
 * 2) 결제 준비(preparePayment)
 *    - 서버 기준 금액 재계산(프론트 금액 신뢰 금지)
 *    - 쿠폰 HOLD(선점) / 포인트 사용 가능 검증
 *    - 좌석 비관적 락 조회 후 HOLD 처리(10분)
 *    - Payment 레코드 생성/갱신(READY)
 * 3) 결제 승인/확정(confirmPayment)
 *    - 주문번호(merchantUid) 기준 결제 레코드 락 조회(동시 confirm 방지)
 *    - 멱등성 보장(이미 PAID면 즉시 성공 반환)
 *    - 금액 검증 후 토스 S2S 승인 호출
 *    - DB 후처리(예약 PAID, 좌석 RESERVED, 쿠폰 USED, 포인트 차감)
 *    - DB 후처리 실패 시 보상취소(전액취소) 시도 + 쿠폰 RELEASE
 */
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

    // Toss Payments 승인/취소 API 엔드포인트
    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
    private static final String TOSS_CANCEL_URL_PREFIX = "https://api.tosspayments.com/v1/payments/"; // + {paymentKey}/cancel

    // ========= 조회 =========

    @Transactional(readOnly = true)
    public PaymentDTO.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예매 번호입니다."));

        Screening screening = reservation.getScreening();

        List<PaymentDTO.ReservationDetailResponse.SeatDetail> seatDetails =
                screeningSeatRepository.findByReservationId(reservationId)
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
                .totalAmount(reservation.getTotalPrice())
                .status(reservation.getStatus().name())
                .build();
    }

    // ========= 가격 타입 판별 =========

    private ScreeningType determineScreeningType(LocalTime time) {
        if (time.isBefore(LocalTime.of(10, 0))) return ScreeningType.MORNING;
        if (time.isAfter(LocalTime.of(22, 0))) return ScreeningType.NIGHT;
        return ScreeningType.NORMAL;
    }

    // ========= Prepare =========

    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        // 1) 예약/상영 존재 검증
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("기존 예약 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2) 원가 재계산
        int originalPrice = 0;
        List<Long> seatIds = new ArrayList<>();

        LocalTime screenTime = screening.getStartTime().toLocalTime();
        ScreeningType sType = determineScreeningType(screenTime);
        log.info("[가격계산] 영화시간: {}, 적용타입: {}", screenTime, sType);

        for (PaymentDTO.TicketRequest ticketReq : request.getTickets()) {
            seatIds.add(ticketReq.getSeatId());

            TicketPrice policy = ticketPriceRepository.findByScreenTypeAndPriceTypeAndScreeningType(
                    screening.getScreen().getScreenType(),
                    ticketReq.getPriceType(),
                    sType
            ).orElseThrow(() -> new IllegalArgumentException(
                    String.format("요금 정책 없음 (Screen: %s, Price: %s, Type: %s)",
                            screening.getScreen().getScreenType(), ticketReq.getPriceType(), sType)));

            originalPrice += policy.getPrice();
        }

        // 3) 할인/포인트(회원 전용)
        int discountAmount = 0;
        int usedPoints = (request.getUsedPoints() != null) ? request.getUsedPoints() : 0;

        if (reservation.getMember() != null) {

            // ✅ (중요) 쿠폰 변경/재시도 대비: 이 예약에 묶여 있던 기존 HELD 쿠폰이 있으면 먼저 RELEASE
            // - 스케줄러(7단계)를 안 쓰기로 했으니, 이런 "최소 방어"가 유령 선점 확률을 줄여줘요.
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

                // HOLD 처리(10분): 좌석 HOLD TTL과 맞추는 게 가장 안전해요.
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

        for (ScreeningSeat seat : seats) {
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

    // ========= Confirm =========

    @Transactional
    public PaymentDTO.ConfirmResponse confirmPayment(PaymentDTO.ConfirmRequest request) {

        // 1) 동시 confirm 방지: Payment row LOCK
        Payment payment = paymentRepository.findByMerchantUidForUpdate(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 대기 내역을 찾을 수 없습니다."));

        Reservation reservation = payment.getReservation();

        // 2) 멱등성 처리
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("[멱등성] 이미 완료된 결제 orderId={}, reservationStatus={}",
                    request.getOrderId(), reservation.getStatus());
            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .build();
        }

        // 3) 금액 검증
        if (!Objects.equals(payment.getFinalAmount(), request.getAmount())) {
            log.warn("[금액불일치] orderId={}, expected={}, got={}",
                    request.getOrderId(), payment.getFinalAmount(), request.getAmount());
            // 금액 불일치도 "결제 실패"로 보고 쿠폰을 풀어주는 게 운영상 더 안전해요.
            releaseHeldCouponIfAny(reservation);
            throw new IllegalArgumentException("금액 불일치");
        }

        // 4) 토스 승인
        try {
            executeTossConfirmOrThrow(request);
        } catch (RuntimeException ex) {
            // 승인 실패 → 쿠폰 RELEASE
            releaseHeldCouponIfAny(reservation);
            throw ex;
        }

        // 5) DB 후처리
        try {
            // 결제 확정
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setImpUid(request.getPaymentKey());
            payment.setPaidAt(LocalDateTime.now());
            payment.setPgProvider("TOSS");

            reservation.setStatus(ReservationStatus.PAID);

            screeningSeatRepository.findByReservationId(reservation.getId())
                    .forEach(s -> s.setStatus(SeatStatus.RESERVED));

            // ✅ 쿠폰 USED 확정: HELD인 경우에만 USED로 전이
            memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
                if (mc.getStatus() == MemberCouponStatus.HELD) {
                    mc.setStatus(MemberCouponStatus.USED);
                    mc.setIsUsed(true);
                    mc.setUsedAt(LocalDateTime.now());
                    mc.setHoldExpiresAt(null);
                }
            });

            // 포인트 차감
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

            // 보상 취소(전액)
            try {
                executeTossCancelFull(request.getPaymentKey(), "DB update failed after confirm");
            } catch (Exception cancelEx) {
                log.error("[보상취소실패] paymentKey={}, err={}", request.getPaymentKey(), cancelEx.getMessage());
            }

            // DB 실패 → 쿠폰 RELEASE (USED 제외)
            releaseHeldCouponIfAny(reservation);

            throw dbEx;
        }
    }

    // ========= Toss Confirm: 응답 검증 포함 =========

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

    // ========= Toss Cancel: 전액취소 =========

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

    /**
     * 쿠폰 RELEASE
     * - 스케줄러(7단계)를 하지 않는 전략이므로,
     *   "USED가 아니면" 실패 시 확실하게 풀어주는 방식이 팀 프로젝트에 현실적이에요.
     */
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
