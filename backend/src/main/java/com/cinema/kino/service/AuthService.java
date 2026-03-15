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
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 회원가입
    @Transactional
    public Long signup(MemberSignupRequestDTO request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 2. 비밀번호 복합도 검증 (Regex)
        String password = request.getPassword();
        String pattern = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[`~!@#$%^&*|'\";:₩\\\\?]).{8,20}$";

        if (!password.matches(pattern)) {
            throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다.");
        }

        // 3. 개인정보 포함 여부 검증
        String username = request.getUsername();
        String tel = request.getTel().replace("-", "");
        String birth = request.getBirth_date().toString().replace("-", "");

        if (password.contains(username)) throw new IllegalArgumentException("비밀번호에 아이디를 포함할 수 없습니다.");
        if (password.contains(tel)) throw new IllegalArgumentException("비밀번호에 전화번호를 포함할 수 없습니다.");
        if (password.contains(birth)) throw new IllegalArgumentException("비밀번호에 생년월일을 포함할 수 없습니다.");

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

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 1. 토큰 존재 확인
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않거나 만료된 링크입니다. 다시 요청해주세요."));

        // 2. 만료 시간 확인 (30분)
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("링크의 유효시간(30분)이 만료되었습니다. 다시 요청해주세요.");
        }

        Member member = resetToken.getMember();

        // 💡 3. 보안 추가: 현재 사용 중인 비밀번호와 새 비밀번호가 같은지 확인
        if (passwordEncoder.matches(newPassword, member.getPassword())) {
            throw new IllegalArgumentException("현재 사용 중인 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.");
        }

        // 4. 비밀번호 암호화 및 저장
        member.setPassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);

        // 5. 사용한 토큰 사용함으로 변경
        resetToken.setUsed(true);
        log.info("🔑 비밀번호 재설정 완료: {}", member.getUsername());
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
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("일치하는 회원 정보가 없습니다."));

        if (!member.getEmail().equals(email)) {
            throw new RuntimeException("일치하는 회원 정보가 없습니다.");
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime newExpiryDate = LocalDateTime.now().plusMinutes(30);

        // 3. 기존 토큰이 있는지 찾아옵니다. (없으면 빈 객체 생성)
        PasswordResetToken resetToken = passwordResetTokenRepository.findByMemberId(member.getId())
                .orElse(PasswordResetToken.builder().member(member).build());

        // 4. 새로운 토큰 값과 만료 시간으로 덮어씌웁니다. (엔티티에 @Setter가 있다고 가정)
        resetToken.setToken(token);
        resetToken.setExpiryDate(newExpiryDate);
        resetToken.setUsed(false);

        // 5. 저장 (JPA가 알아서 기존에 있었으면 Update, 없었으면 Insert 쿼리를 날려줍니다)
        passwordResetTokenRepository.save(resetToken);

        // 6. 메일 발송
        mailService.sendPasswordResetEmail(member, token);
    }

    @Transactional
    public ResetPwResponseDTO validateTokenAndGetUserInfo(String token) {
        // 1. 토큰이 DB에 있는지 확인
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않거나 이미 사용된 링크입니다."));

        // 2. 만료 시간 확인 (1번 요구사항: 만료 시 에러 발생)
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now()) || resetToken.isUsed()) {
            // (선택) 만료된 토큰은 DB에서 지워버려도 좋습니다.
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("만료된 링크입니다. 비밀번호 재설정을 다시 요청해 주세요.");
        }

        // 3. 토큰이 유효하다면 회원 정보 꺼내기 (2번 요구사항: 개인정보 반환)
        Member member = resetToken.getMember();

        return ResetPwResponseDTO.builder()
                .username(member.getUsername())
                .tel(member.getTel())
                // 생일 필드명(birthDate 등)은 실제 엔티티에 맞게 수정하세요.
                // String 타입으로 변환해서 주는 것이 프론트에서 쓰기 편합니다.
                .birthDate(member.getBirthDate() != null ? member.getBirthDate().toString() : "")
                .build();
    }

    //포인트 비밀번호
    @Transactional(readOnly = true)
    public boolean checkPointPassword(Long memberId, String inputPassword) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (member.getPointPassword() == null || member.getPointPassword().isEmpty()) {
            throw new IllegalStateException("포인트 비밀번호가 설정되어 있지 않습니다.");
        }

        return passwordEncoder.matches(inputPassword, member.getPointPassword());
    }

}
