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
 *    - 쿠폰 선점(예약에 연결) / 포인트 사용 가능 검증
 *    - 좌석 비관적 락 조회 후 HOLD 처리(10분)
 *    - Payment 레코드 생성/갱신(READY)
 * 3) 결제 승인/확정(confirmPayment)
 *    - 주문번호(merchantUid) 기준 결제 레코드 락 조회(동시 confirm 방지)
 *    - 멱등성 보장(이미 PAID면 즉시 성공 반환)
 *    - 금액 검증 후 토스 S2S 승인 호출
 *    - DB 후처리(예약 PAID, 좌석 RESERVED, 쿠폰 사용, 포인트 차감)
 *    - DB 후처리 실패 시 보상취소(전액취소) 시도
 *
 * 동시성/안정성 핵심:
 * - 좌석: PESSIMISTIC_WRITE로 선택 좌석 row 잠금 후 HELD 처리
 * - 결제 승인: merchantUid로 Payment row 잠금 + 멱등성 체크
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

    /**
     * 결제 페이지에서 필요한 "예약 상세" 정보를 반환합니다.
     * - 영화/극장/상영관/시작시간
     * - 예약 상태 및 좌석 목록
     *
     * readOnly 트랜잭션으로 조회 성능/의도를 명확히 합니다.
     */
    @Transactional(readOnly = true)
    public PaymentDTO.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예매 번호입니다."));

        Screening screening = reservation.getScreening();

        // reservationId로 묶인 좌석들을 조회하여 프론트에 표시할 좌석명(row+number)로 변환
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
                .totalAmount(reservation.getTotalPrice())
                .status(reservation.getStatus().name())
                .build();
    }

    // ========= 가격 타입 판별 =========

    /**
     * 상영 시작 시간(LocalTime)에 따라 요금 정책 구분을 결정합니다.
     * - 10:00 이전: MORNING
     * - 22:00 이후: NIGHT
     * - 그 외: NORMAL
     */
    private ScreeningType determineScreeningType(LocalTime time) {
        if (time.isBefore(LocalTime.of(10, 0))) return ScreeningType.MORNING;
        if (time.isAfter(LocalTime.of(22, 0))) return ScreeningType.NIGHT;
        return ScreeningType.NORMAL;
    }

    // ========= Prepare =========

    /**
     * 결제 준비 단계
     *
     * 목표:
     * - 서버 기준으로 최종 결제 금액을 계산/검증하고 Payment(READY)를 준비합니다.
     * - 좌석을 비관적 락으로 선점하여 HELD 상태로 바꿉니다(유효 10분).
     *
     * 핵심 원칙:
     * - 프론트가 보내는 totalPrice는 신뢰하지 않습니다(서버가 재계산).
     * - 회원일 경우만 쿠폰/포인트 검증 및 적용을 수행합니다.
     * - 좌석 동시 선택 경쟁을 막기 위해 선택 좌석을 LOCK 후 상태 변경합니다.
     */
    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        // 1) 예약/상영 존재 검증
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("기존 예약 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        // 2) 요금 정책(TicketPrice) 기반으로 원가(originalPrice) 재계산
        int originalPrice = 0;
        List<Long> seatIds = new ArrayList<>();

        LocalTime screenTime = screening.getStartTime().toLocalTime();
        ScreeningType sType = determineScreeningType(screenTime);
        log.info("[가격계산] 영화시간: {}, 적용타입: {}", screenTime, sType);

        for (PaymentDTO.TicketRequest ticketReq : request.getTickets()) {
            seatIds.add(ticketReq.getSeatId());

            // (screenType + priceType + screeningType) 조합 가격 정책 조회
            TicketPrice policy = ticketPriceRepository.findByScreenTypeAndPriceTypeAndScreeningType(
                    screening.getScreen().getScreenType(),
                    ticketReq.getPriceType(),
                    sType
            ).orElseThrow(() -> new IllegalArgumentException(
                    String.format("요금 정책 없음 (Screen: %s, Price: %s, Type: %s)",
                            screening.getScreen().getScreenType(), ticketReq.getPriceType(), sType)));

            originalPrice += policy.getPrice();
        }

        // 3) 할인/포인트 적용(회원 전용)
        int discountAmount = 0;
        int usedPoints = (request.getUsedPoints() != null) ? request.getUsedPoints() : 0;

        if (reservation.getMember() != null) {

            // 3-1) 쿠폰 검증 + 선점(현재 예약에 연결) 처리
            if (request.getMemberCouponId() != null) {
                // NOTE: 동시성 강화를 원하면 쿠폰도 비관적 락/버전 관리 고려 가능
                MemberCoupon targetCoupon = memberCouponRepository.findAvailableCoupon(
                        request.getMemberCouponId(),
                        reservation.getMember().getId(),
                        reservation.getId()
                ).orElseThrow(() -> new IllegalArgumentException("사용 가능한 쿠폰이 아닙니다."));

                // 쿠폰을 예약에 묶어 사실상 HOLD처럼 동작(다른 예약에서 사용 방지 목적)
                targetCoupon.setReservation(reservation);

                Coupon coupon = targetCoupon.getCoupon();
                discountAmount = (coupon.getDiscountType() == DiscountType.FIXED)
                        ? coupon.getDiscountValue()
                        : (int) (originalPrice * (coupon.getDiscountValue() / 100.0));
            }

            // 3-2) 포인트 잔액 검증(사용은 음수 기록 전략)
            if (usedPoints > 0) {
                int available = memberPointRepository.getAvailablePointsByMemberId(reservation.getMember().getId());
                if (available < usedPoints) throw new IllegalArgumentException("포인트 부족");
            }
        }

        // 4) 최종 금액 산출 (음수 방지)
        int finalVal = Math.max(0, originalPrice - discountAmount - usedPoints);

        // 5) 주문번호(orderId/merchantUid) 생성 및 예약에 저장
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        reservation.setOrderId(orderId);

        // 6) Payment 레코드 준비(기존 있으면 업데이트, 없으면 생성)
        Payment payment = paymentRepository.findByReservation(reservation)
                .orElseGet(() -> Payment.builder()
                        .reservation(reservation)
                        .member(reservation.getMember())
                        .guest(reservation.getGuest())
                        .paymentStatus(PaymentStatus.READY)
                        .build());

        payment.setMerchantUid(orderId); // merchantUid == orderId (프로젝트 내 용어 통일 필요)
        payment.setOriginalAmount(originalPrice);
        payment.setDiscount(discountAmount);
        payment.setUsedPoints(usedPoints);
        payment.setFinalAmount(finalVal);
        payment.setPaymentMethod("CARD");

        paymentRepository.save(payment);

        // 7) 좌석 선점: 선택 좌석을 비관적 락으로 조회 → HELD 상태로 변경(10분)
        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(), seatIds);

        for (ScreeningSeat seat : seats) {
            seat.setStatus(SeatStatus.HELD);
            seat.setReservation(reservation);
            seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));
        }

        // 8) 프론트 결제창 호출에 필요한 정보 반환
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

    /**
     * 결제 승인/확정 단계
     *
     * 목표:
     * - 토스 S2S 승인 호출 전/후로 DB 상태를 안전하게 갱신합니다.
     *
     * 안전장치:
     * 1) merchantUid 기준 Payment row 비관적 락 조회(동시 confirm 방지)
     * 2) 멱등성: 이미 PAID면 즉시 성공 반환(중복 호출/재시도 안전)
     * 3) 금액 검증: 서버가 계산한 finalAmount와 PG 승인 요청 amount 일치 확인
     * 4) DB 후처리 실패 시 보상취소(전액취소) 시도
     */
    @Transactional
    public PaymentDTO.ConfirmResponse confirmPayment(PaymentDTO.ConfirmRequest request) {

        // 1) 동시 confirm 방지: 주문번호로 Payment 레코드 잠금
        Payment payment = paymentRepository.findByMerchantUidForUpdate(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 대기 내역을 찾을 수 없습니다."));

        // 2) 멱등성: 이미 결제 완료면 중복 처리 없이 성공 반환
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("[멱등성] 이미 결제 완료된 주문입니다. orderId={}, paymentId={}", request.getOrderId(), payment.getId());
            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .build();
        }

        // 3) 금액 검증(프론트/외부 입력 신뢰 금지)
        if (!Objects.equals(payment.getFinalAmount(), request.getAmount())) {
            log.warn("[금액불일치] orderId={}, expected={}, got={}", request.getOrderId(), payment.getFinalAmount(), request.getAmount());
            throw new IllegalArgumentException("금액 불일치");
        }

        // 4) 토스 승인(S2S): 승인 실패 시 예외 → 트랜잭션 롤백
        try {
            executeTossConfirmOrThrow(request);
        } catch (RuntimeException ex) {
            log.error("[토스승인실패] orderId={}, msg={}", request.getOrderId(), ex.getMessage());
            throw ex;
        }

        // 5) 승인 성공 후 DB 후처리: 실패하면 '승인됐는데 DB 실패' 케이스 → 보상취소 시도
        try {
            // 5-1) 결제 상태 갱신
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setImpUid(request.getPaymentKey());
            payment.setPaidAt(LocalDateTime.now());
            payment.setPgProvider("TOSS");

            // 5-2) 예약 상태 갱신
            Reservation reservation = payment.getReservation();
            reservation.setStatus(ReservationStatus.PAID);

            // 5-3) 좌석 확정(RESERVED)
            screeningSeatRepository.findByReservationId(reservation.getId())
                    .forEach(s -> s.setStatus(SeatStatus.RESERVED));

            // 5-4) 쿠폰 사용 처리(선점된 쿠폰이 있으면 사용 확정)
            memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
                mc.setIsUsed(true);
                mc.setUsedAt(LocalDateTime.now());
            });

            // 5-5) 포인트 차감 내역 기록(USE는 음수로 저장)
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
            // ✅ 최악 케이스: PG는 승인됐는데 DB 후처리 실패 → 금전 사고 방지를 위해 보상취소 시도
            log.error("[DB후처리실패] 승인 후 DB 업데이트 실패. 전액취소 시도. orderId={}, paymentKey={}, err={}",
                    request.getOrderId(), request.getPaymentKey(), dbEx.getMessage());

            try {
                executeTossCancelFull(request.getPaymentKey(), "DB update failed after confirm");
                log.warn("[보상취소성공] paymentKey={}", request.getPaymentKey());
            } catch (Exception cancelEx) {
                // 보상취소도 실패할 수 있으므로 반드시 로깅(운영 대응 포인트)
                log.error("[보상취소실패] paymentKey={}, err={}", request.getPaymentKey(), cancelEx.getMessage());
            }

            throw dbEx; // 원래 예외를 던져 트랜잭션 롤백
        }
    }

    // ========= Toss Confirm: 응답 검증 포함 =========

    /**
     * 토스 결제 승인(S2S) 호출을 수행합니다.
     * - HTTP 2xx가 아니면 승인 실패로 간주하고 예외를 던집니다.
     *
     * NOTE:
     * - 실제 운영에서는 응답 바디를 파싱하여 status(DONE 등) 확인을 추가하는 것을 권장합니다.
     */
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

    /**
     * 보상 트랜잭션 용도: 결제 승인 이후 DB 후처리 실패 시 "전액 취소"를 시도합니다.
     * - 취소가 실패해도 원래 예외는 유지(상위에서 장애 대응 필요)
     */
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

    /**
     * 토스 API 호출을 위한 공통 헤더 생성
     * - Basic Auth: {secretKey}:
     * - Content-Type: application/json
     */
    private HttpHeaders createTossHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
