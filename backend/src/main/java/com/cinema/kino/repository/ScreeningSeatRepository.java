package com.cinema.kino.repository;

import com.cinema.kino.entity.ScreeningSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScreeningSeatRepository
        extends JpaRepository<ScreeningSeat, Long> {

    List<ScreeningSeat> findByScreeningId(Long screeningId);

    Optional<ScreeningSeat> findByScreeningIdAndSeatId(
            Long screeningId, Long seatId
    );
}
