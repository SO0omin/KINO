package com.cinema.kino.service;

import com.cinema.kino.dto.SeatStatusResponseDto;
import com.cinema.kino.entity.ScreeningSeat;
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
                .map(ss -> {
                    var seat = ss.getSeat();
                    var screening = ss.getScreening();
                    var movie = screening.getMovie();
                    var screen = screening.getScreen();

                    return new SeatStatusResponseDto(
                            seat.getId(),
                            seat.getSeatRow(),
                            seat.getSeatNumber(),
                            ss.getStatus().name(),
                            seat.getPosX(),
                            seat.getPosY(),
                            screening.getId(),
                            screen.getName(),
                            movie.getId(),
                            movie.getTitle(),
                            screening.getStartTime(),
                            screening.getEndTime(),
                            ss.getHeldBy() != null ? ss.getHeldBy().getUsername() : null,
                            ss.get() != null ? ss.getHoldExpiresAt().get() : null,
                    );
                })
                .toList();
    }
}