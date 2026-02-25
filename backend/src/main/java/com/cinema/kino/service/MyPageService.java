package com.cinema.kino.service;

import com.cinema.kino.dto.MyPageDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.MemberPoint;
import com.cinema.kino.entity.Payment;
import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.enums.MemberCouponStatus;
import com.cinema.kino.entity.enums.PaymentStatus;
import com.cinema.kino.entity.enums.PointType;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.repository.MemberCouponRepository;
import com.cinema.kino.repository.MemberPointRepository;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.PaymentRepository;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.repository.ReviewRepository;
import com.cinema.kino.repository.ScreeningSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberPointRepository memberPointRepository;
    private final ReviewRepository reviewRepository;
    private final MovieLikeRepository movieLikeRepository;

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_CANCEL_URL_PREFIX = "https://api.tosspayments.com/v1/payments/";

    @Transactional(readOnly = true)
    public MyPageDTO.SummaryResponse getSummary(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        int points = memberPointRepository.getAvailablePointsByMemberId(memberId);
        int coupons = memberCouponRepository.findAvailableCouponsByMemberId(memberId).size();
        int paidReservations = (int) reservationRepository.countByMemberIdAndStatus(memberId, ReservationStatus.PAID);
        int reviewCount = (int) reviewRepository.countByMemberId(memberId);
        int likedCount = (int) movieLikeRepository.countByMemberId(memberId);

        return MyPageDTO.SummaryResponse.builder()
                .memberId(member.getId())
                .memberName(member.getName())
                .availablePoints(points)
                .availableCouponCount(coupons)
                .paidReservationCount(paidReservations)
                .reviewCount(reviewCount)
                .likedMovieCount(likedCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyPageDTO.ReservationItem> getReservations(Long memberId) {
        List<Reservation> reservations = reservationRepository.findMyReservationsWithScreening(memberId);

        List<MyPageDTO.ReservationItem> items = new ArrayList<>();
        for (Reservation reservation : reservations) {
            Payment payment = paymentRepository.findByReservation(reservation).orElse(null);
            List<ScreeningSeat> seats = screeningSeatRepository.findByReservationId(reservation.getId());
            List<String> seatNames = seats.stream()
                    .map(s -> s.getSeat().getSeatRow() + s.getSeat().getSeatNumber())
                    .collect(Collectors.toList());

            boolean cancellable =
                    reservation.getStatus() == ReservationStatus.PAID &&
                    payment != null &&
                    payment.getPaymentStatus() == PaymentStatus.PAID &&
                    reservation.getScreening().getStartTime().isAfter(LocalDateTime.now());

            items.add(MyPageDTO.ReservationItem.builder()
                    .reservationId(reservation.getId())
                    .movieTitle(reservation.getScreening().getMovie().getTitle())
                    .posterUrl(reservation.getScreening().getMovie().getPosterUrl())
                    .theaterName(reservation.getScreening().getScreen().getTheater().getName())
                    .screenName(reservation.getScreening().getScreen().getName())
                    .startTime(reservation.getScreening().getStartTime())
                    .finalAmount(payment != null ? payment.getFinalAmount() : reservation.getTotalPrice())
                    .reservationStatus(reservation.getStatus().name())
                    .paymentStatus(payment != null ? payment.getPaymentStatus().name() : "NONE")
                    .seatNames(seatNames)
                    .cancellable(cancellable)
                    .build());
        }
        return items;
    }

    @Transactional
    public MyPageDTO.CancelResponse cancelReservation(Long memberId, Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예매 정보를 찾을 수 없습니다."));

        if (reservation.getMember() == null || !reservation.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인 예매만 취소할 수 있습니다.");
        }

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        if (payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("이미 취소되었거나 취소 가능한 상태가 아닙니다.");
        }

        if (!reservation.getScreening().getStartTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("상영 시작 이후에는 취소할 수 없습니다.");
        }

        executeTossCancelFull(payment.getImpUid(), reason == null || reason.isBlank() ? "사용자 요청 취소" : reason);

        payment.setPaymentStatus(PaymentStatus.CANCELLED);
        reservation.setStatus(ReservationStatus.CANCELED);

        List<ScreeningSeat> seats = screeningSeatRepository.findByReservationId(reservationId);
        for (ScreeningSeat seat : seats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setReservation(null);
            seat.setHoldExpiresAt(null);
        }

        memberCouponRepository.findByReservation(reservation).ifPresent(mc -> {
            mc.setStatus(MemberCouponStatus.AVAILABLE);
            mc.setIsUsed(false);
            mc.setUsedAt(null);
            mc.setReservation(null);
            mc.setHoldExpiresAt(null);
        });

        if (payment.getUsedPoints() != null && payment.getUsedPoints() > 0 && payment.getMember() != null) {
            memberPointRepository.save(MemberPoint.builder()
                    .member(payment.getMember())
                    .point(payment.getUsedPoints())
                    .pointType(PointType.EARN)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        return MyPageDTO.CancelResponse.builder()
                .reservationId(reservationId)
                .reservationStatus(reservation.getStatus().name())
                .paymentStatus(payment.getPaymentStatus().name())
                .cancelledAt(LocalDateTime.now())
                .build();
    }

    private void executeTossCancelFull(String paymentKey, String reason) {
        if (paymentKey == null || paymentKey.isBlank()) {
            throw new IllegalArgumentException("취소 가능한 결제 키가 없습니다.");
        }

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
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("PG 취소 실패: " + e.getResponseBodyAsString());
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
}
