package com.cinema.kino.repository;

import com.cinema.kino.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {
    // 기본 findById 제공됨
}