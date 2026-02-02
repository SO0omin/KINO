package com.cinema.kino.repository;

import com.cinema.kino.entity.Payment;
import com.cinema.kino.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // [핵심] 객체 연관관계를 기반으로 조회해야 합니다.
    // 기존 findByReservationId 대신 이걸 쓰세요.
    Optional<Payment> findByReservation(Reservation reservation);

    // 결제 승인 시 주문번호로 찾기
    Optional<Payment> findByMerchantUid(String merchantUid);
}