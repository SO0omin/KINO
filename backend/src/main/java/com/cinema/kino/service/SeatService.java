package com.cinema.kino.service;

import com.cinema.kino.dto.SeatStatusResponseDto;
import com.cinema.kino.repository.ScreeningSeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class SeatService {

    private final ScreeningSeatRepository screeningSeatRepository;

    public SeatService(ScreeningSeatRepository screeningSeatRepository) {
        this.screeningSeatRepository = screeningSeatRepository;
    }

    public List<SeatStatusResponseDto> getSeatStatus(Long screeningId) {
        return screeningSeatRepository.findByScreeningId(screeningId)
                .stream()
                .map(SeatStatusResponseDto::from)
                .toList();
    }
}