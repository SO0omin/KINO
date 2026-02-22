package com.cinema.kino.controller;

import com.cinema.kino.dto.FindIdRequestDTO;
import com.cinema.kino.dto.ResetPwRequestDTO;
import com.cinema.kino.dto.SignupRequestDTO;
import com.cinema.kino.dto.TokenResponseDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.service.AuthService;
import com.cinema.kino.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil; // 팔찌 제작 기계

    //회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO request) {
        log.info("📥 회원가입 요청 수신: {}", request.getUsername());

        try {
            authService.signup(request);
            return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다. Box Office에서 로그인해주세요."));
        } catch (IllegalArgumentException e) {
            // 중복된 아이디/이메일일 경우 400 Bad Request 에러와 메시지 반환
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        log.info("[로그인] 로그인 요청 수신: {}", username);

        try {
            // 1. 서비스에서 아이디/비밀번호 검증
            Member member = authService.authenticate(username, password);

            // 2. 검증 통과 시 JWT 토큰(자유이용권) 발급
            String token = jwtUtil.createToken(member.getId(),member.getUsername(),member.getName());

            // 3. 프론트엔드로 토큰 전달
            return ResponseEntity.ok(new TokenResponseDTO(token,member.getId(),member.getUsername(),member.getName()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", "아이디 또는 비밀번호가 잘못되었습니다."));
        }
    }

    //중복체크
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        log.info("[회원가입] 아이디 중복 체크 요청: {}", username);

        boolean isAvailable = authService.checkUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", isAvailable));
    }

    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody FindIdRequestDTO request) {
        try {
            String maskedId = authService.findId(request);
            return ResponseEntity.ok(Map.of("username", maskedId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPwRequestDTO request) {
        try {
            String tempPw = authService.resetPassword(request);
            // 보안상 로그에만 남기고 프론트에는 메시지만 전달 (현재는 테스트를 위해 반환 가능)
            return ResponseEntity.ok(Map.of("message", "임시 비밀번호가 발급되었습니다.", "tempPw", tempPw));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}