package com.cinema.kino.service;

import com.cinema.kino.dto.MyPageDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.MembershipCard;
import com.cinema.kino.entity.MemberPoint;
import com.cinema.kino.entity.Payment;
import com.cinema.kino.entity.PointPasswordVerification;
import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.VoucherCode;
import com.cinema.kino.entity.enums.MemberCouponStatus;
import com.cinema.kino.entity.enums.PaymentStatus;
import com.cinema.kino.entity.enums.PointType;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.entity.enums.VoucherStatus;
import com.cinema.kino.entity.enums.VoucherType;
import com.cinema.kino.repository.MemberCouponRepository;
import com.cinema.kino.repository.MembershipCardRepository;
import com.cinema.kino.repository.MemberPointRepository;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieLikeRepository;
import com.cinema.kino.repository.PaymentRepository;
import com.cinema.kino.repository.PointPasswordVerificationRepository;
import com.cinema.kino.repository.ReservationRepository;
import com.cinema.kino.repository.ReviewRepository;
import com.cinema.kino.repository.ScreeningSeatRepository;
import com.cinema.kino.repository.VoucherCodeRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MembershipCardRepository membershipCardRepository;
    private final PointPasswordVerificationRepository pointPasswordVerificationRepository;
    private final MemberPointRepository memberPointRepository;
    private final ReviewRepository reviewRepository;
    private final MovieLikeRepository movieLikeRepository;
    private final VoucherCodeRepository voucherCodeRepository;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.cancel.mock-enabled:false}")
    private boolean mockCancelEnabled;

    @Value("${sms.mock-enabled:true}")
    private boolean smsMockEnabled;

    @Value("${sms.mock-auth-code:123456}")
    private String smsMockAuthCode;

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
    public MyPageDTO.MemberProfileResponse getMemberProfile(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return MyPageDTO.MemberProfileResponse.builder()
                .memberId(member.getId())
                .username(member.getUsername())
                .name(member.getName())
                .tel(member.getTel())
                .email(member.getEmail())
                .birthDate(member.getBirthDate())
                .profileImage(member.getProfileImage())
                .build();
    }

    @Transactional
    public MyPageDTO.MessageResponse updateMemberProfile(MyPageDTO.MemberProfileUpdateRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }

        member.setName(request.getName().trim());
        member.setTel(request.getTel() == null ? null : request.getTel().trim());
        member.setEmail(request.getEmail() == null ? null : request.getEmail().trim());
        member.setBirthDate(request.getBirthDate());
        member.setProfileImage(request.getProfileImage());

        return MyPageDTO.MessageResponse.builder()
                .message("개인정보가 수정되었습니다.")
                .build();
    }

    @Transactional
    public MyPageDTO.MessageResponse updateMemberPassword(MyPageDTO.MemberPasswordUpdateRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        }
        if (request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {
            throw new IllegalArgumentException("비밀번호 확인을 입력해 주세요.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }
        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자리 이상 입력해 주세요.");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        member.setPassword(passwordEncoder.encode(request.getNewPassword()));

        return MyPageDTO.MessageResponse.builder()
                .message("비밀번호가 변경되었습니다.")
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
                    (mockCancelEnabled || (payment.getImpUid() != null && !payment.getImpUid().isBlank())) &&
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

        Payment payment = paymentRepository.findByReservationIdForUpdate(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        if (payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("이미 취소되었거나 취소 가능한 상태가 아닙니다.");
        }

        if (!reservation.getScreening().getStartTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("상영 시작 이후에는 취소할 수 없습니다.");
        }

        if (!mockCancelEnabled) {
            executeTossCancelFull(payment.getImpUid(), reason == null || reason.isBlank() ? "사용자 요청 취소" : reason);
        }

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

    @Transactional(readOnly = true)
    public List<MyPageDTO.VoucherItem> getVouchers(Long memberId, String voucherTypeRaw, String statusRaw) {
        VoucherType voucherType = parseVoucherType(voucherTypeRaw);
        VoucherStatus status = parseVoucherStatus(statusRaw);

        List<VoucherCode> vouchers = (status == null)
                ? voucherCodeRepository.findByMemberAndType(memberId, voucherType)
                : voucherCodeRepository.findByMemberAndTypeAndStatus(memberId, voucherType, status);

        return vouchers.stream()
                .map(v -> MyPageDTO.VoucherItem.builder()
                        .voucherId(v.getId())
                        .voucherType(v.getVoucherType().name())
                        .status(v.getStatus().name())
                        .code(maskCode(v.getCode()))
                        .name(v.getName())
                        .validFrom(v.getValidFrom())
                        .validUntil(v.getValidUntil())
                        .registeredAt(v.getRegisteredAt())
                        .build())
                .toList();
    }

    @Transactional
    public MyPageDTO.VoucherRegisterResponse registerVoucher(MyPageDTO.VoucherRegisterRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("등록할 번호를 입력해 주세요.");
        }

        VoucherType voucherType = parseVoucherType(request.getVoucherType());
        String code = request.getCode().replaceAll("\\D", "");
        validateCodeLength(voucherType, code);

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        VoucherCode voucher = voucherCodeRepository.findByCodeAndTypeForUpdate(code, voucherType)
                .orElseThrow(() -> new IllegalArgumentException("등록 가능한 코드가 없습니다. 관리자에게 발급 코드를 확인해 주세요."));

        if (voucher.getMember() != null) {
            if (voucher.getMember().getId().equals(member.getId())) {
                throw new IllegalArgumentException("이미 등록된 코드입니다.");
            }
            throw new IllegalArgumentException("이미 다른 회원에게 등록된 코드입니다.");
        }

        if (voucher.getStatus() == VoucherStatus.USED) {
            throw new IllegalArgumentException("이미 사용 완료된 코드입니다.");
        }
        if (voucher.getStatus() == VoucherStatus.EXPIRED) {
            throw new IllegalArgumentException("유효기간이 만료된 코드입니다.");
        }
        if (voucher.getValidUntil() != null && voucher.getValidUntil().isBefore(LocalDateTime.now())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            throw new IllegalArgumentException("유효기간이 만료된 코드입니다.");
        }

        voucher.setMember(member);
        voucher.setRegisteredAt(LocalDateTime.now());
        voucher.setStatus(VoucherStatus.AVAILABLE);

        VoucherCode saved = voucherCodeRepository.save(voucher);

        return MyPageDTO.VoucherRegisterResponse.builder()
                .voucherId(saved.getId())
                .voucherType(saved.getVoucherType().name())
                .status(saved.getStatus().name())
                .code(maskCode(saved.getCode()))
                .name(saved.getName())
                .registeredAt(saved.getRegisteredAt())
                .message("등록이 완료되었습니다.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyPageDTO.MembershipCardItem> getMembershipCards(Long memberId) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return membershipCardRepository.findByMemberId(memberId).stream()
                .map(card -> MyPageDTO.MembershipCardItem.builder()
                        .cardId(card.getId())
                        .channelName(card.getChannelName())
                        .cardNumber(maskMembershipCard(card.getCardNumber()))
                        .cardName(card.getCardName())
                        .issuerName(card.getIssuerName())
                        .issuedDate(card.getIssuedDate())
                        .build())
                .toList();
    }

    @Transactional
    public MyPageDTO.RegisterMembershipCardResponse registerMembershipCard(MyPageDTO.RegisterMembershipCardRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        String cardNumber = onlyDigits(request.getCardNumber());
        String cvc = onlyDigits(request.getCvc());

        if (cardNumber.length() < 12 || cardNumber.length() > 19) {
            throw new IllegalArgumentException("카드번호는 12~19자리 숫자만 가능합니다.");
        }
        if (cvc.length() < 3 || cvc.length() > 4) {
            throw new IllegalArgumentException("CVC 번호는 3~4자리 숫자만 가능합니다.");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (membershipCardRepository.findByCardNumber(cardNumber).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 멤버십 카드입니다.");
        }

        MembershipCard card = MembershipCard.builder()
                .member(member)
                .cardNumber(cardNumber)
                .cardName("메가박스 멤버십")
                .issuerName("메가박스 멤버십")
                .channelName("온라인")
                .issuedDate(LocalDate.now())
                .build();

        MembershipCard saved = membershipCardRepository.save(card);

        return MyPageDTO.RegisterMembershipCardResponse.builder()
                .cardId(saved.getId())
                .cardNumber(maskMembershipCard(saved.getCardNumber()))
                .cardName(saved.getCardName())
                .issuerName(saved.getIssuerName())
                .issuedDate(saved.getIssuedDate())
                .message("멤버십 카드가 등록되었습니다.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyPageDTO.PointHistoryItem> getPointHistories(Long memberId, LocalDate from, LocalDate to) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (from == null || to == null) {
            throw new IllegalArgumentException("조회 시작일/종료일은 필수입니다.");
        }
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("조회 시작일은 종료일보다 이후일 수 없습니다.");
        }

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59);

        return memberPointRepository.findHistoriesByMemberIdAndRange(memberId, fromDateTime, toDateTime)
                .stream()
                .map(point -> MyPageDTO.PointHistoryItem.builder()
                        .pointId(point.getId())
                        .createdAt(point.getCreatedAt())
                        .typeLabel(mapPointTypeLabel(point.getPointType()))
                        .content(mapPointContent(point.getPointType()))
                        .branchName("-")
                        .point(point.getPoint())
                        .build())
                .toList();
    }

    @Transactional
    public MyPageDTO.MessageResponse sendPointPasswordSms(MyPageDTO.PointPasswordSmsSendRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        String phoneNumber = normalizePhoneNumber(request.getPhoneNumber());
        if (!phoneNumber.matches("^01\\d{8,9}$")) {
            throw new IllegalArgumentException("휴대폰 번호 형식이 올바르지 않습니다.");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (member.getTel() != null && !member.getTel().isBlank()) {
            String memberPhone = normalizePhoneNumber(member.getTel());
            if (!memberPhone.equals(phoneNumber)) {
                throw new IllegalArgumentException("회원 정보에 등록된 휴대폰 번호와 일치하지 않습니다.");
            }
        }

        String authCode = smsMockEnabled
                ? normalizeMockAuthCode(smsMockAuthCode)
                : String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        PointPasswordVerification verification = PointPasswordVerification.builder()
                .member(member)
                .phoneNumber(phoneNumber)
                .authCode(authCode)
                .verified(false)
                .used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(3))
                .build();
        pointPasswordVerificationRepository.save(verification);

        smsService.sendPointPasswordCode(phoneNumber, authCode);

        String message = smsMockEnabled
                ? "인증번호가 발송되었습니다. (개발모드 인증번호: " + authCode + ")"
                : "인증번호가 발송되었습니다.";
        return MyPageDTO.MessageResponse.builder()
                .message(message)
                .build();
    }

    @Transactional
    public MyPageDTO.PointPasswordSmsVerifyResponse verifyPointPasswordSms(MyPageDTO.PointPasswordSmsVerifyRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        String phoneNumber = normalizePhoneNumber(request.getPhoneNumber());
        String authCode = request.getAuthCode() == null ? "" : request.getAuthCode().replaceAll("\\D", "");

        PointPasswordVerification verification = pointPasswordVerificationRepository
                .findTopByMemberIdAndPhoneNumberOrderByCreatedAtDescIdDesc(request.getMemberId(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("인증요청 내역이 없습니다."));

        if (verification.isUsed()) {
            throw new IllegalArgumentException("이미 사용된 인증요청입니다.");
        }
        if (verification.isVerified()) {
            throw new IllegalArgumentException("이미 인증 완료된 요청입니다.");
        }
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증번호 유효시간이 만료되었습니다. 다시 요청해 주세요.");
        }
        if (!verification.getAuthCode().equals(authCode)) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        String token = UUID.randomUUID().toString();
        verification.setVerified(true);
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setVerificationToken(token);

        return MyPageDTO.PointPasswordSmsVerifyResponse.builder()
                .verificationToken(token)
                .message("휴대폰 인증이 완료되었습니다.")
                .build();
    }

    @Transactional
    public MyPageDTO.MessageResponse updatePointPassword(MyPageDTO.PointPasswordUpdateRequest request) {
        if (request == null || request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId는 필수입니다.");
        }
        if (request.getVerificationToken() == null || request.getVerificationToken().isBlank()) {
            throw new IllegalArgumentException("휴대폰 인증이 필요합니다.");
        }

        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword().replaceAll("\\D", "");
        String confirmPassword = request.getConfirmPassword() == null ? "" : request.getConfirmPassword().replaceAll("\\D", "");

        validatePointPassword(newPassword, confirmPassword);

        PointPasswordVerification verification = pointPasswordVerificationRepository
                .findByMemberIdAndVerificationToken(request.getMemberId(), request.getVerificationToken())
                .orElseThrow(() -> new IllegalArgumentException("인증 정보가 유효하지 않습니다."));

        if (!verification.isVerified()) {
            throw new IllegalArgumentException("휴대폰 인증이 완료되지 않았습니다.");
        }
        if (verification.isUsed()) {
            throw new IllegalArgumentException("이미 사용된 인증 정보입니다.");
        }
        if (verification.getVerifiedAt() == null || verification.getVerifiedAt().plusMinutes(10).isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 유효시간이 만료되었습니다. 다시 인증해 주세요.");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        member.setPointPassword(passwordEncoder.encode(newPassword));
        member.setPointPasswordUpdatedAt(LocalDateTime.now());
        verification.setUsed(true);

        return MyPageDTO.MessageResponse.builder()
                .message("포인트 비밀번호가 설정되었습니다.")
                .build();
    }

    private VoucherType parseVoucherType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("voucherType은 필수입니다. (MOVIE|STORE)");
        }
        try {
            return VoucherType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new IllegalArgumentException("voucherType은 MOVIE 또는 STORE만 가능합니다.");
        }
    }

    private VoucherStatus parseVoucherStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return VoucherStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new IllegalArgumentException("status는 AVAILABLE, USED, EXPIRED만 가능합니다.");
        }
    }

    private void validateCodeLength(VoucherType voucherType, String code) {
        if (voucherType == VoucherType.MOVIE) {
            if (code.length() != 12 && code.length() != 16) {
                throw new IllegalArgumentException("영화관람권 번호는 12자리 또는 16자리 숫자만 가능합니다.");
            }
            return;
        }
        if (code.length() != 16) {
            throw new IllegalArgumentException("스토어 교환권 번호는 16자리 숫자만 가능합니다.");
        }
    }

    private String maskCode(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        int visible = Math.min(4, code.length());
        String tail = code.substring(code.length() - visible);
        return "*".repeat(Math.max(0, code.length() - visible)) + tail;
    }

    private String onlyDigits(String raw) {
        return raw == null ? "" : raw.replaceAll("\\D", "");
    }

    private String maskMembershipCard(String cardNumber) {
        if (cardNumber == null || cardNumber.isBlank()) {
            return "";
        }
        String digits = onlyDigits(cardNumber);
        if (digits.length() < 8) {
            return digits;
        }

        int prefix = 4;
        int suffix = 4;
        String masked = digits.substring(0, prefix)
                + "*".repeat(Math.max(0, digits.length() - (prefix + suffix)))
                + digits.substring(digits.length() - suffix);

        return masked.replaceAll("(.{4})(?!$)", "$1-");
    }

    private String mapPointTypeLabel(PointType pointType) {
        if (pointType == null) return "기타";
        return switch (pointType) {
            case EARN -> "적립";
            case USE -> "사용";
            case EXPIRE -> "소멸";
        };
    }

    private String mapPointContent(PointType pointType) {
        if (pointType == null) return "포인트 내역";
        return switch (pointType) {
            case EARN -> "포인트 적립";
            case USE -> "포인트 사용";
            case EXPIRE -> "포인트 소멸";
        };
    }

    private String normalizePhoneNumber(String rawPhone) {
        return rawPhone == null ? "" : rawPhone.replaceAll("\\D", "");
    }

    private void validatePointPassword(String password, String confirmPassword) {
        if (password.length() != 4 || confirmPassword.length() != 4) {
            throw new IllegalArgumentException("비밀번호는 숫자 4자리여야 합니다.");
        }
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        if (isConsecutivePassword(password)) {
            throw new IllegalArgumentException("연속된 숫자는 사용할 수 없습니다.");
        }
    }

    private boolean isConsecutivePassword(String password) {
        boolean ascending = true;
        boolean descending = true;
        for (int i = 1; i < password.length(); i++) {
            int prev = password.charAt(i - 1) - '0';
            int curr = password.charAt(i) - '0';
            if (curr != prev + 1) {
                ascending = false;
            }
            if (curr != prev - 1) {
                descending = false;
            }
        }
        return ascending || descending;
    }

    private String normalizeMockAuthCode(String raw) {
        String digits = raw == null ? "" : raw.replaceAll("\\D", "");
        if (digits.length() == 6) {
            return digits;
        }
        return "123456";
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
            String errorBody = e.getResponseBodyAsString();
            throw new IllegalArgumentException(
                    (errorBody == null || errorBody.isBlank()) ? "PG 취소 실패" : "PG 취소 실패: " + errorBody
            );
        } catch (RestClientException e) {
            throw new IllegalArgumentException("PG 취소 통신 오류");
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

    @Transactional(readOnly = true)
    public List<MyPageDTO.MyReviewItem> getMyReviews(Long memberId) {
        // 💡 ReviewRepository에 findByMemberId가 있다고 가정합니다.
        return reviewRepository.findByMemberId(memberId).stream()
                .map(r -> MyPageDTO.MyReviewItem.builder()
                        .id(r.getId())
                        .movieTitle(r.getMovie().getTitle()) // 영화 제목 가져오기
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt().toLocalDate().toString())
                        .build())
                .collect(Collectors.toList());
    }
}
