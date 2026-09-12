package com.cinema.kino.controller;

import com.cinema.kino.dto.MyPageDTO;
import com.cinema.kino.dto.SocialLinkRequestDTO;
import com.cinema.kino.service.MyPageService;
import com.cinema.kino.service.SocialLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "*")
public class MyPageController {

    private final MyPageService myPageService;
    private final SocialLinkService socialLinkService;

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

    @DeleteMapping("/profile/delete")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal Long memberId) {
        // 💡 이 로그를 서버 콘솔에서 확인하세요!
        System.out.println("🚨 [DEBUG] 컨트롤러에 도착한 memberId: " + memberId);

        if (memberId == null) {
            // ID가 없으면 서비스로 넘기지 말고 여기서 바로 에러를 뱉게 하세요.
            return ResponseEntity.status(401).body("인증 정보(ID)를 찾을 수 없습니다.");
        }

        myPageService.deleteMember(memberId);
        return ResponseEntity.ok("탈퇴 완료");
    }

    @PostMapping("/profile/password")
    public ResponseEntity<MyPageDTO.MessageResponse> updateProfilePassword(
            @RequestBody MyPageDTO.MemberPasswordUpdateRequest request
    ) {
        return ResponseEntity.ok(myPageService.updateMemberPassword(request));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<MyPageDTO.ReservationItem>> getReservations(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) Long guestId
    ) {
        return ResponseEntity.ok(myPageService.getReservations(memberId, guestId));
    }

    @PostMapping("/reservations/{reservationId}/cancel")
    public ResponseEntity<MyPageDTO.CancelResponse> cancelReservation(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) Long guestId,
            @PathVariable Long reservationId,
            @RequestBody(required = false) MyPageDTO.CancelRequest request
    ) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(myPageService.cancelReservation(memberId, guestId, reservationId, reason));
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

    /**
     * [마이페이지] 소셜 계정 연동 (Link)
     */
    @PostMapping("/social/link")
    public ResponseEntity<?> linkSocialAccount(
            @RequestHeader("Authorization") String authHeader, // 헤더 그대로 받기
            @RequestBody SocialLinkRequestDTO request) {

        // 서비스로 그대로 패스!
        socialLinkService.linkSocialAccount(authHeader, request.getProvider(), request.getCode(),request.getState());

        return ResponseEntity.ok().body("소셜 계정이 성공적으로 연동되었습니다.");
    }

    /**
     * [마이페이지] 소셜 계정 해제 (Unlink)
     */
    @DeleteMapping("/social/unlink")
    public ResponseEntity<?> unlinkSocialAccount(
            @RequestHeader("Authorization") String authHeader, // 헤더 그대로 받기
            @RequestParam("provider") String provider) {

        // 서비스로 그대로 패스!
        socialLinkService.unlinkSocialAccount(authHeader, provider);

        return ResponseEntity.ok().body(provider + " 연동이 해제되었습니다.");
    }

}
