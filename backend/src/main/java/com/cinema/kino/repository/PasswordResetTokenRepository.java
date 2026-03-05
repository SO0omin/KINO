package com.cinema.kino.repository;

import com.cinema.kino.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // 넘어온 토큰 문자열로 진짜 토큰 뭉치를 찾는 메서드
    Optional<PasswordResetToken> findByToken(String token);

    // 회원이 재설정 메일을 여러 번 누를 경우, 이전 토큰들을 싹 지워주기 위한 메서드
    void deleteByMemberId(Long memberId);
}