// 파일 경로: com/cinema/kino/service/TimetableService.java
package com.cinema.kino.service;

import com.cinema.kino.dto.TimetableRawDTO;
import com.cinema.kino.dto.TimetableResponseDTO;
import com.cinema.kino.entity.enums.ReservationStatus;
import com.cinema.kino.entity.enums.ScreeningType;
import com.cinema.kino.repository.ScreeningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimetableService {

    private final ScreeningRepository screeningRepository;

    // ✨ 조조, 심야 판별 헬퍼 메서드 (ScreeningType Enum 활용)
    private TimetableResponseDTO.ScreeningDetail createScreeningDetail(TimetableRawDTO raw) {
        // 시간만 뽑아서 Enum의 from 메서드에 전달
        ScreeningType type = ScreeningType.from(raw.getStartTime().toLocalTime());

        return TimetableResponseDTO.ScreeningDetail.builder()
                .screeningId(raw.getScreeningId())
                .screenName(raw.getScreenName())
                .screenType(raw.getScreenType().name())
                .startTime(raw.getStartTime())
                .endTime(raw.getEndTime())
                .totalSeats(raw.getTotalSeats())
                .remainingSeats((int) (raw.getTotalSeats() - raw.getBookedSeats()))
                .isMorning(type == ScreeningType.MORNING)
                .isNight(type == ScreeningType.NIGHT)
                .build();
    }

    public List<TimetableResponseDTO.ResponseByTheater> getTimetableByTheater(Long theaterId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<TimetableRawDTO> rawData = screeningRepository.findByTheater(
                theaterId, startOfDay, endOfDay, ReservationStatus.PAID
        );

        Map<Long, List<TimetableRawDTO>> groupedByMovie = rawData.stream()
                .collect(Collectors.groupingBy(TimetableRawDTO::getMovieId));

        return groupedByMovie.values().stream().map(list -> {
            TimetableRawDTO first = list.get(0);
            return TimetableResponseDTO.ResponseByTheater.builder()
                    .movieId(first.getMovieId())
                    .movieTitle(first.getMovieTitle())
                    .ageRating(first.getAgeRating().toString())
                    .durationMin(first.getDurationMin())
                    .screenings(list.stream().map(this::createScreeningDetail).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    public List<TimetableResponseDTO.ResponseByMovie> getTimetableByMovie(Long movieId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<TimetableRawDTO> rawData = screeningRepository.findByMovie(
                movieId, startOfDay, endOfDay, ReservationStatus.PAID // 예약상태 본인환경에 맞게
        );

        Map<Long, List<TimetableRawDTO>> groupedByTheater = rawData.stream()
                .collect(Collectors.groupingBy(TimetableRawDTO::getTheaterId));

        return groupedByTheater.values().stream().map(list -> {
            TimetableRawDTO first = list.get(0);
            return TimetableResponseDTO.ResponseByMovie.builder()
                    .theaterId(first.getTheaterId())
                    .theaterName(first.getTheaterName())
                    .screenings(list.stream().map(this::createScreeningDetail).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }
}