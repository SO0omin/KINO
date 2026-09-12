package com.cinema.kino.repository;

import com.cinema.kino.entity.PointPasswordVerification;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

public interface PointPasswordVerificationRepository extends JpaRepository<PointPasswordVerification, Long> {

    Optional<PointPasswordVerification> findTopByMemberIdAndPhoneNumberOrderByCreatedAtDescIdDesc(Long memberId,
                                                                                                   String phoneNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PointPasswordVerification> findByMemberIdAndVerificationToken(Long memberId, String token);
}
