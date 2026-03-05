package com.cinema.kino.controller;

import com.cinema.kino.dto.MyPageDTO;
import com.cinema.kino.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "*")
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/summary")
    public ResponseEntity<MyPageDTO.SummaryResponse> getSummary(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getSummary(memberId));
    }

    @GetMapping("/profile")
    public ResponseEntity<MyPageDTO.MemberProfileResponse> getProfile(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getMemberProfile(memberId));
    }

    @PutMapping("/profile")
    public ResponseEntity<MyPageDTO.MessageResponse> updateProfile(
            @RequestBody MyPageDTO.MemberProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(myPageService.updateMemberProfile(request));
    }

    @PostMapping("/profile/password")
    public ResponseEntity<MyPageDTO.MessageResponse> updateProfilePassword(
            @RequestBody MyPageDTO.MemberPasswordUpdateRequest request
    ) {
        return ResponseEntity.ok(myPageService.updateMemberPassword(request));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<MyPageDTO.ReservationItem>> getReservations(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getReservations(memberId));
    }

    @PostMapping("/reservations/{reservationId}/cancel")
    public ResponseEntity<MyPageDTO.CancelResponse> cancelReservation(
            @RequestParam Long memberId,
            @PathVariable Long reservationId,
            @RequestBody(required = false) MyPageDTO.CancelRequest request
    ) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(myPageService.cancelReservation(memberId, reservationId, reason));
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<MyPageDTO.VoucherItem>> getVouchers(
            @RequestParam Long memberId,
            @RequestParam String voucherType,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(myPageService.getVouchers(memberId, voucherType, status));
    }

    @PostMapping("/vouchers/register")
    public ResponseEntity<MyPageDTO.VoucherRegisterResponse> registerVoucher(
            @RequestBody MyPageDTO.VoucherRegisterRequest request
    ) {
        return ResponseEntity.ok(myPageService.registerVoucher(request));
    }

    @GetMapping("/cards")
    public ResponseEntity<List<MyPageDTO.MembershipCardItem>> getMembershipCards(
            @RequestParam Long memberId
    ) {
        return ResponseEntity.ok(myPageService.getMembershipCards(memberId));
    }

    @PostMapping("/cards/register")
    public ResponseEntity<MyPageDTO.RegisterMembershipCardResponse> registerMembershipCard(
            @RequestBody MyPageDTO.RegisterMembershipCardRequest request
    ) {
        return ResponseEntity.ok(myPageService.registerMembershipCard(request));
    }

    @GetMapping("/points")
    public ResponseEntity<List<MyPageDTO.PointHistoryItem>> getPointHistories(
            @RequestParam Long memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(myPageService.getPointHistories(memberId, from, to));
    }

    @PostMapping("/point-password/sms/send")
    public ResponseEntity<MyPageDTO.MessageResponse> sendPointPasswordSms(
            @RequestBody MyPageDTO.PointPasswordSmsSendRequest request
    ) {
        return ResponseEntity.ok(myPageService.sendPointPasswordSms(request));
    }

    @PostMapping("/point-password/sms/verify")
    public ResponseEntity<MyPageDTO.PointPasswordSmsVerifyResponse> verifyPointPasswordSms(
            @RequestBody MyPageDTO.PointPasswordSmsVerifyRequest request
    ) {
        return ResponseEntity.ok(myPageService.verifyPointPasswordSms(request));
    }

    @PostMapping("/point-password")
    public ResponseEntity<MyPageDTO.MessageResponse> updatePointPassword(
            @RequestBody MyPageDTO.PointPasswordUpdateRequest request
    ) {
        return ResponseEntity.ok(myPageService.updatePointPassword(request));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<MyPageDTO.MyReviewItem>> getMyReviews(@RequestParam Long memberId) {
        return ResponseEntity.ok(myPageService.getMyReviews(memberId));
    }
}
