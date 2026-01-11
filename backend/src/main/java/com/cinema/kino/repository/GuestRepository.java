package com.cinema.kino.repository;

import com.cinema.kino.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestRepository extends JpaRepository<Guest, Long> {
    // 기본 findById 제공됨
}