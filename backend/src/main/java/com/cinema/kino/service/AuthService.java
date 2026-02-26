package com.cinema.kino.service;

import com.cinema.kino.dto.FindIdRequestDTO;
import com.cinema.kino.dto.ResetPwRequestDTO;
import com.cinema.kino.dto.SignupRequestDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // SecurityConfig에 Bean으로 등록되어 있어야 합니다!

    //회원가입
    @Transactional
    public Long signup(SignupRequestDTO request) {
        // 1. 중복 검증
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        //비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        //Member 객체 생성
        Member newMember = Member.builder()
                .username(request.getUsername())
                .password(encodedPassword) // 반드시 암호화된 비밀번호 저장!
                .name(request.getName())
                .birthDate(request.getBirth_date())
                .tel(request.getTel())
                .email(request.getEmail())
                .uuid(UUID.randomUUID().toString()) // UUID 자동 생성
                .profileImage(null) // 초기 프로필 이미지는 null
                .build();

        // 4. DB에 저장
        Member savedMember = memberRepository.save(newMember);
        log.info("🎉 새로운 회원이 가입했습니다. ID: {}", savedMember.getUsername());

        return savedMember.getId(); // 가입된 회원의 PK 반환
    }

    //로그인
    @Transactional(readOnly = true)
    public Member authenticate(String username, String rawPassword) {
        // 1. 아이디로 회원 조회
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        // 2. 비밀번호 일치 여부 확인 (평문 비밀번호와 DB의 암호화된 비밀번호 비교)
        if (!passwordEncoder.matches(rawPassword, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        log.info("✅ 로그인 성공. ID: {}", member.getUsername());
        return member;
    }


    @Transactional(readOnly = true)
    public boolean checkUsernameAvailable(String username) { //existsByUsername을 활용(MemberRepository에 있음)
        return !memberRepository.existsByUsername(username);
    }

    @Transactional(readOnly = true)
    public String findId(FindIdRequestDTO request) {
        Member member = memberRepository.findByNameAndEmail(request.getName(), request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        // 아이디 마스킹 (앞 3글자 제외하고 * 처리)
        String username = member.getUsername();
        if (username.length() <= 3) return "***";
        return username.substring(0, 3) + "*".repeat(username.length() - 3);
    }

    @Transactional
    public String resetPassword(ResetPwRequestDTO request) {
        Member member = memberRepository.findByUsernameAndEmail(request.getUsername(), request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("정보가 일치하지 않습니다."));

        // 1. 임시 비밀번호 생성 (8자리 랜덤 문자열)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // 2. 비밀번호 암호화 후 DB 업데이트
        member.setPassword(passwordEncoder.encode(tempPassword));
        memberRepository.save(member);

        return tempPassword; // 실무에서는 이를 이메일로 보내야 함
    }
}