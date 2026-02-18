package com.cinema.kino.service;

import com.cinema.kino.dto.SeatStatusResponseDTO;
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

    public List<SeatStatusResponseDTO> getSeatStatus(Long screeningId) {
        return screeningSeatRepository.findByScreeningId(screeningId)
                .stream()
                .map(SeatStatusResponseDTO::from)
                .toList();
    }
}