package com.cinema.kino.repository;

import com.cinema.kino.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // 결제 정보 저장용
}