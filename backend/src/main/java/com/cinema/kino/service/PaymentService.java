package com.cinema.kino.service;

import com.cinema.kino.dto.PaymentDTO;
import com.cinema.kino.entity.*;
import com.cinema.kino.entity.enums.*;
import com.cinema.kino.repository.*;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final double POINT_EARN_RATE = 0.05;

    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScreeningRepository screeningRepository;
    private final TicketPriceRepository ticketPriceRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberPointRepository memberPointRepository;
    private final MemberRepository memberRepository;

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
    private static final String TOSS_CANCEL_URL_PREFIX = "https://api.tosspayments.com/v1/payments/";

    private final MailService mailService;

    /**
     * 예매 상세 정보 조회 (결제 대기 화면용)
     */
    @Transactional(readOnly = true)
    public PaymentDTO.ReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예매 번호입니다."));

        Screening screening = reservation.getScreening();

        // 💡 [성능 최적화] 필요한 좌석만 DB에서 한 번에 뽑아오기
        List<Long> ticketSeatIds = reservation.getTickets().stream()
                .map(ReservationTicket::getSeatId)
                .collect(Collectors.toList());

        List<ScreeningSeat> fetchedSeats = screeningSeatRepository.findAllByScreeningIdAndSeatIdInWithSeat(
                screening.getId(), ticketSeatIds);


        // 1. 상영관 타입 꺼내기
        ScreenType screenType = reservation.getScreening().getScreen().getScreenType();

        // 💡 2. 상영 시간(LocalDateTime)에서 시간(LocalTime)만 쏙 빼서 ScreeningType 계산하기!
        java.time.LocalTime time = reservation.getScreening().getStartTime().toLocalTime();
        ScreeningType screeningType = ScreeningType.from(time); // 👉 결과: MORNING, NORMAL, NIGHT 중 하나

        // 3. 계산된 조건으로 해당 영화의 가격표 뭉치 가져오기
        List<TicketPrice> priceList = ticketPriceRepository.findByScreenTypeAndScreeningType(screenType, screeningType);

        // 4. 티켓 정보를 SeatDetail DTO로 변환
        List<PaymentDTO.ReservationDetailResponse.SeatDetail> seatDetails = reservation.getTickets().stream()
                .map(ticket -> {
                    ScreeningSeat ss = fetchedSeats.stream()
                            .filter(seat -> seat.getSeat().getId().equals(ticket.getSeatId()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("좌석 정보 없음"));

                    // 가격표에서 현재 티켓 요금(성인/청소년)에 맞는 단가 찾기
                    int seatPrice = priceList.stream()
                            .filter(p -> p.getPriceType() == ticket.getPriceType())
                            .findFirst()
                            .map(TicketPrice::getPrice) // TicketPrice 엔티티의 가격 필드 (예: getPrice())
                            .orElseThrow(() -> new IllegalArgumentException("해당 요금 타입의 가격 정책이 없습니다."));

                    return new PaymentDTO.ReservationDetailResponse.SeatDetail(
                            ticket.getSeatId(),
                            ss.getSeat().getSeatRow() + ss.getSeat().getSeatNumber(),
                            ticket.getPriceType(),
                            seatPrice // 💡 여기서 정확한 가격 세팅!
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

    /**
     * 결제 준비 (쿠폰/포인트 적용 및 가격 계산, 좌석 선점)
     */
    @Transactional
    public PaymentDTO.PrepareResponse preparePayment(PaymentDTO.PrepareRequest request) {

        if (request.getTickets() == null || request.getTickets().isEmpty()) {
            throw new IllegalArgumentException("좌석/요금 정보(tickets)가 비어있습니다.");
        }

        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("기존 예약 정보를 찾을 수 없습니다."));
        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new IllegalArgumentException("상영 정보를 찾을 수 없습니다."));

        int originalPrice = 0;
        LocalTime screenTime = screening.getStartTime().toLocalTime();
        ScreeningType sType = determineScreeningType(screenTime);
        log.info("[가격계산] 영화시간: {}, 적용타입: {}", screenTime, sType);

        Map<Long, PriceType> priceTypeMap = new HashMap<>();
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
                    screening.getScreen().getScreenType(), pt, sType
            ).orElseThrow(() -> new IllegalArgumentException(
                    String.format("요금 정책 없음 (Screen: %s, Price: %s, Type: %s)",
                            screening.getScreen().getScreenType(), pt, sType)));

            originalPrice += policy.getPrice();
        }

        List<Long> seatIds = new ArrayList<>(seatIdSet);

        int discountAmount = 0;
        int usedPoints = 0;

        // 💡 [방어 로직] 회원일 때만 포인트 및 쿠폰 적용
        if (reservation.getMember() != null) {
            usedPoints = (request.getUsedPoints() != null) ? request.getUsedPoints() : 0;
            if (usedPoints < 0) {
                throw new IllegalArgumentException("포인트는 0 이상만 사용할 수 있습니다.");
            }
            if (usedPoints % 100 != 0) {
                throw new IllegalArgumentException("포인트는 100원 단위로만 사용할 수 있습니다.");
            }

            memberCouponRepository.findByReservation(reservation).ifPresent(old -> {
                if (old.getStatus() != MemberCouponStatus.USED) {
                    old.setStatus(MemberCouponStatus.AVAILABLE);
                    old.setReservation(null);
                    old.setHoldExpiresAt(null);
                }
            });

            if (request.getMemberCouponId() != null) {
                MemberCoupon targetCoupon = memberCouponRepository.findHoldableCouponForUpdate(
                        request.getMemberCouponId(), reservation.getMember().getId(), reservation.getId()
                ).orElseThrow(() -> new IllegalArgumentException("사용 가능한 쿠폰이 아닙니다."));

                targetCoupon.setStatus(MemberCouponStatus.HELD);
                targetCoupon.setReservation(reservation);
                targetCoupon.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));

                Coupon coupon = targetCoupon.getCoupon();
                String couponKind = coupon.getCouponKind() != null ? coupon.getCouponKind().trim() : "";
                if (!"매표".equals(couponKind)) {
                    throw new IllegalArgumentException("매표 쿠폰만 결제 할인에 사용할 수 있습니다.");
                }
                int minPrice = coupon.getMinPrice() != null ? coupon.getMinPrice() : 0;
                if (originalPrice < minPrice) {
                    throw new IllegalArgumentException(
                            String.format("해당 쿠폰은 %,d원 이상 결제 시 사용할 수 있습니다.", minPrice)
                    );
                }
                discountAmount = (coupon.getDiscountType() == DiscountType.FIXED)
                        ? coupon.getDiscountValue()
                        : (int) (originalPrice * (coupon.getDiscountValue() / 100.0));
            }

            if (usedPoints > 0) {
                int available = memberPointRepository.getAvailablePointsByMemberId(reservation.getMember().getId());
                if (available < usedPoints) throw new IllegalArgumentException("포인트 부족");
            }
        } else {
            usedPoints = 0; // 비회원이면 무조건 0 처리
        }

        int finalVal = Math.max(0, originalPrice - discountAmount - usedPoints);
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        reservation.setOrderId(orderId);

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

        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(), seatIds);

        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("좌석 선점에 실패했습니다. 다시 선택해주세요.");
        }

        for (ScreeningSeat seat : seats) {
            PriceType pt = priceTypeMap.getOrDefault(seat.getSeat().getId(), PriceType.ADULT);
            seat.setPriceType(pt);
            seat.setStatus(SeatStatus.HELD);
            seat.setReservation(reservation);
            seat.setHoldExpiresAt(seat.getHoldExpiresAt() == null ? LocalDateTime.now().plusMinutes(10) : seat.getHoldExpiresAt());
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

    /**
     * 토스 결제 승인 요청 및 DB 확정 처리
     */
    @Transactional
    public PaymentDTO.ConfirmResponse confirmPayment(PaymentDTO.ConfirmRequest request) {

        Payment payment = paymentRepository.findByMerchantUidForUpdate(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 대기 내역을 찾을 수 없습니다."));

        Reservation reservation = payment.getReservation();

        // 멱등성 보장
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("[멱등성] 이미 완료된 결제 orderId={}, reservationStatus={}",
                    request.getOrderId(), reservation.getStatus());
            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .build();
        }

        // 💡 [안전 장치] 금액 조작 방지
        if (!Objects.equals(payment.getFinalAmount(), request.getAmount())) {
            log.warn("[금액불일치] orderId={}, expected={}, got={}",
                    request.getOrderId(), payment.getFinalAmount(), request.getAmount());
            markPaymentFailed(payment, "amount_mismatch");
            releaseHeldCouponIfAny(reservation);
            throw new IllegalArgumentException("금액 불일치");
        }

        try {
            executeTossConfirmOrThrow(request);
        } catch (RuntimeException ex) {
            markPaymentFailed(payment, "pg_confirm_failed");
            releaseHeldCouponIfAny(reservation);
            throw ex;
        }

        try {
            // DB 확정 처리
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setImpUid(request.getPaymentKey());
            payment.setPaidAt(LocalDateTime.now());
            payment.setPgProvider("TOSS");

            reservation.setStatus(ReservationStatus.PAID);
            String bookingNo = generateBookingNo(reservation.getId());
            reservation.setReservationNumber(bookingNo);

            if(payment.getMember() != null) mailService.sendPaymentCompleteEmail(payment.getMember(),reservation,bookingNo);

            screeningSeatRepository.findByReservationId(reservation.getId())
                    .forEach(s -> {
                        s.setStatus(SeatStatus.RESERVED); // 결제 완료 상태
                        s.setHoldExpiresAt(null);     // 결제가 끝났으니 스케줄러가 못 건드리게 타이머 파괴!
                    });

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

            if (payment.getMember() != null) {
                int earnPoints = calculateEarnPoints(payment.getFinalAmount());
                if (earnPoints > 0) {
                    memberPointRepository.save(MemberPoint.builder()
                            .member(payment.getMember())
                            .point(earnPoints)
                            .pointType(PointType.EARN)
                            .createdAt(LocalDateTime.now())
                            .build());
                }
            }

            log.info(bookingNo);
            return PaymentDTO.ConfirmResponse.builder()
                    .paymentId(payment.getId())
                    .reservationNumber(bookingNo)
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

    public String generateBookingNo(Long id) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        return String.format("KINO-%s-%06d", datePart, id);
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

        } catch (HttpStatusCodeException e) {
            // 💡 토스가 내려주는 실제 에러 메시지를 로그로 남깁니다.
            log.error("[토스 에러 응답] HTTP 상태: {}, 응답 본문: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("토스 결제 승인 실패: " + e.getResponseBodyAsString());

        } catch (RestClientException e) {
            log.error("[PG사 통신 오류] {}", e.getMessage());
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

    private int calculateEarnPoints(Integer finalAmount) {
        if (finalAmount == null || finalAmount <= 0) {
            return 0;
        }
        return (int) Math.floor(finalAmount * POINT_EARN_RATE);
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

    // 💡 결제 실패 시 상태를 변경하는 헬퍼 메서드 추가
    private void markPaymentFailed(Payment payment, String reason) {
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }
        payment.setPaymentStatus(PaymentStatus.FAILED);
        log.warn("[결제실패기록] orderId={}, reason={}", payment.getMerchantUid(), reason);
    }
}
