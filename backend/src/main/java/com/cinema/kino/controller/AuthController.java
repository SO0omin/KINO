package com.cinema.kino.controller;

import com.cinema.kino.dto.*;
import com.cinema.kino.service.AuthService;
import com.cinema.kino.service.GoogleAuthService;
import com.cinema.kino.service.KakaoAuthService;
import com.cinema.kino.service.NaverAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;
    private final NaverAuthService naverAuthService;
    private final GoogleAuthService googleAuthService;

    // 회원가입 (Member + SocialAccount 연동 포함)
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberSignupRequestDTO request) {
        log.info("📥 회원가입 요청 수신: {}", request.getUsername());
        try {
            authService.signup(request);
            return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다. Box Office에서 로그인해주세요."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 일반 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberSignupRequestDTO request) {
        try {
            // 💡 서비스에서 DTO를 직접 받아옵니다.
            MemberLoginResponseDTO response = authService.authenticate(request.getUsername(), request.getPassword());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 아이디 중복체크
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        log.info("[회원가입] 아이디 중복 체크 요청: {}", username);
        boolean isAvailable = authService.checkUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", isAvailable));
    }

    // 아이디 찾기
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody FindIdRequestDTO request) {
        try {
            String maskedId = authService.findId(request);
            return ResponseEntity.ok(Map.of("username", maskedId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // 비회원 가입
    @PostMapping("/guest-signup")
    public ResponseEntity<?> guestSignup(@RequestBody GuestSignupRequestDTO request) {
        try {
            authService.guestSignup(request);
            return ResponseEntity.ok(Map.of("message", "비회원 등록이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 비회원 로그인
    @PostMapping("/guest-login")
    public ResponseEntity<?> guestLogin(@RequestBody GuestLoginRequestDTO request) {
        try {
            GuestLoginResponseDTO response = authService.guestAuthenticate(
                    request.getName(),
                    request.getTel(),
                    request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            authService.sendPasswordResetLink(username, email);

            // 프론트엔드에게는 보안상 성공했다는 메시지만 내려줍니다.
            return ResponseEntity.ok().body(Map.of("message", "이메일이 발송되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. 이메일 링크를 통한 실제 비밀번호 '변경' 요청
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");

            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok().body(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 💡 소셜(카카오) 로그인 엔드포인트
    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody KakaoDTO.LoginRequest request) {
        log.info("[카카오 로그인] 인가 코드 수신 완료");
        KakaoLoginResponseDTO response = kakaoAuthService.login(request.getCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/naver")
    public ResponseEntity<?> naverLogin(@RequestBody NaverDTO.LoginRequest request) {
        log.info("[네이버 로그인] 인가 코드 및 상태 값 수신 완료");
        // 네이버는 state 값도 같이 넘겨줍니다.
        NaverLoginResponseDTO response = naverAuthService.login(request.getCode(), request.getState());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleDTO.LoginRequest request) {
        log.info("[구글 로그인] 인가 코드 수신 완료");
        GoogleLoginResponseDTO response = googleAuthService.login(request.getCode());
        return ResponseEntity.ok(response);
    }

}
