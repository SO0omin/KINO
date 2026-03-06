package com.cinema.kino.service;

import com.cinema.kino.dto.*;
import com.cinema.kino.entity.Guest;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.PasswordResetToken;
import com.cinema.kino.entity.SocialAccount; // 💡 추가
import com.cinema.kino.repository.GuestRepository;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.PasswordResetTokenRepository;
import com.cinema.kino.repository.SocialAccountRepository; // 💡 추가
import com.cinema.kino.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final GuestRepository guestRepository;
    private final SocialAccountRepository socialAccountRepository; // 💡 소셜 계정 레포지토리 주입
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final JwtUtil jwtUtil;

    // 회원가입
    @Transactional
    public Long signup(MemberSignupRequestDTO request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 1. Member 본체 저장 (provider 관련 컬럼 제거됨)
        Member newMember = Member.builder()
                .username(request.getUsername())
                .password(encodedPassword)
                .name(request.getName())
                .birthDate(request.getBirth_date())
                .tel(request.getTel())
                .email(request.getEmail())
                .uuid(UUID.randomUUID().toString())
                .profileImage(request.getProfileImage() != null && !request.getProfileImage().isEmpty()
                        ? request.getProfileImage() : "default")
                .build();

        Member savedMember = memberRepository.save(newMember);

        // 2. 소셜 가입인 경우 SocialAccount 테이블에 추가 저장 💡
        if (request.getProvider() != null && !request.getProvider().equals("LOCAL")) {
            SocialAccount socialAccount = SocialAccount.builder()
                    .member(savedMember) // 방금 저장된 Member와 매핑
                    .provider(request.getProvider())
                    .providerId(request.getProviderId())
                    .build();
            socialAccountRepository.save(socialAccount);
            log.info("🎉 새로운 소셜 회원이 가입했습니다. ID: {}, Provider: {}", savedMember.getUsername(), request.getProvider());
        } else {
            log.info("🎉 새로운 일반 회원이 가입했습니다. ID: {}", savedMember.getUsername());
        }

        return savedMember.getId();
    }

    // 일반 로그인
    @Transactional(readOnly = true)
    public MemberLoginResponseDTO authenticate(String username, String rawPassword) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        if (!passwordEncoder.matches(rawPassword, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        log.info("✅ 일반 로그인 성공. ID: {}", member.getUsername());

        String token = jwtUtil.createToken(member.getId(), member.getUsername(), member.getName());

        // 2. 💡 DTO에 담아서 리턴 (memberId와 name 포함)
        return MemberLoginResponseDTO.builder()
                .token(token)
                .username(member.getUsername())
                .name(member.getName())
                .memberId(member.getId())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean checkUsernameAvailable(String username) {
        return !memberRepository.existsByUsername(username);
    }

    @Transactional(readOnly = true)
    public String findId(FindIdRequestDTO request) {
        Member member = memberRepository.findByNameAndEmail(request.getName(), request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        String username = member.getUsername();
        if (username.length() <= 3) return "***";
        return username.substring(0, 3) + "*".repeat(username.length() - 3);
    }

    // 비회원 가입
    @Transactional
    public Long guestSignup(GuestSignupRequestDTO request) {
        if (guestRepository.findByNameAndTel(request.getName(), request.getTel()).isPresent()) {
            throw new IllegalArgumentException("이미 해당 이름과 전화번호로 등록된 비회원 정보가 있습니다. 바로 예매를 진행하거나 조회 탭을 이용해주세요.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        Guest newGuest = Guest.builder()
                .name(request.getName())
                .tel(request.getTel())
                .password(encodedPassword)
                .uuid(UUID.randomUUID().toString())
                .build();

        Guest savedGuest = guestRepository.save(newGuest);
        log.info("🎟️ 새로운 비회원 정보가 등록되었습니다. 이름: {}", savedGuest.getName());

        return savedGuest.getId();
    }

    // 비회원 인증
    @Transactional(readOnly = true)
    public GuestLoginResponseDTO guestAuthenticate(String name, String tel, String rawPassword) {
        Guest guest = guestRepository.findByNameAndTel(name, tel)
                .orElseThrow(() -> new IllegalArgumentException("등록된 비회원 정보가 없습니다. 이름과 전화번호를 확인해 주세요."));

        if (!passwordEncoder.matches(rawPassword, guest.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        log.info("✅ 비회원 인증 성공. 이름: {}", guest.getName());

        String token = jwtUtil.createGuestToken(guest.getId(), guest.getName());

        return GuestLoginResponseDTO.builder()
                .token(token)
                .guestId(guest.getId())
                .name(guest.getName())
                .build();
    }

    @Transactional
    public void sendPasswordResetLink(String username, String email) {
        // 1. 회원 검증 (아이디와 이메일이 모두 일치하는지 확인)
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("일치하는 회원 정보가 없습니다."));

        if (!member.getEmail().equals(email)) {
            throw new RuntimeException("일치하는 회원 정보가 없습니다.");
        }

        // 3. 기존에 발급받은 안 쓴 토큰들이 있다면 싹 지워버립니다. (최신 1개만 유지)
        passwordResetTokenRepository.deleteByMemberId(member.getId());

        // 4. 아주 길고 복잡한 랜덤 토큰(UUID) 생성
        String token = UUID.randomUUID().toString();

        // 5. 생성한 토큰을 DB에 저장 (만료 시간은 현재 시간으로부터 30분 뒤로 설정)
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .member(member)
                .expiryDate(LocalDateTime.now().plusMinutes(30)) // 💡 30분 유효
                .build();
        passwordResetTokenRepository.save(resetToken);

        // 6. 진짜 이메일 발송!
        // 💡 프론트엔드의 비밀번호 재설정 전용 화면 주소에 토큰을 파라미터로 달아서 보냅니다.
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(member.getEmail()); // 받는 사람 (가입 이메일)
        message.setSubject("[Kino Cinema] 비밀번호 재설정 안내"); // 메일 제목
        message.setText("안녕하세요, " + member.getName() + "님.\n\n"
                + "아래 링크를 클릭하여 새로운 비밀번호를 설정해 주세요.\n"
                + "해당 링크는 30분 동안만 유효합니다.\n\n"
                + resetUrl); // 메일 내용 (링크 포함)

        try {
            mailSender.send(message);
            log.info("📧 비밀번호 재설정 이메일 발송 성공: {}", member.getEmail());
        } catch (Exception e) {
            log.error("❌ 이메일 발송 실패", e);
            throw new RuntimeException("이메일 발송에 실패했습니다. 관리자에게 문의하세요.");
        }
    }

    /**
     * 2. [검증 및 변경] 사용자가 이메일 링크를 타고 들어와 새 비밀번호를 입력했을 때 실행됩니다.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 1. 넘어온 토큰 문자열로 DB에서 진짜 토큰 뭉치를 찾습니다.
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않거나 만료된 링크입니다. 다시 요청해주세요."));
        log.info("현재 시간: {}", LocalDateTime.now());
        log.info("토큰 만료 시간: {}", resetToken.getExpiryDate());

        // 2. 만료 시간이 지났는지 검사 (30분 초과)
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken); // 지난 토큰은 쓰레기통으로
            throw new RuntimeException("링크의 유효시간(30분)이 만료되었습니다. 다시 요청해주세요.");
        }

        // 3. 토큰이 정상이면, 해당 토큰을 가진 회원의 비밀번호를 강제로 암호화해서 교체합니다.
        Member member = resetToken.getMember();
        member.setPassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);

        // 4. 한 번 쓴 토큰은 더 이상 못 쓰게 DB에서 삭제합니다.
        passwordResetTokenRepository.delete(resetToken);
        log.info("🔑 비밀번호 재설정 완료: {}", member.getUsername());
    }
}
