package com.cinema.kino.service;

import com.cinema.kino.dto.*;
import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TicketingService {

    private final RegionRepository regionRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final ScreeningRepository screeningRepository;

    // 1. 모든 지역 목록 조회
    public List<RegionDTO> getAllRegions() {
        return regionRepository.findAll().stream()
                .map(RegionDTO::from)
                .sorted(java.util.Comparator.comparing(RegionDTO::getId))
                .toList();
    }

    // 2. 지역별 영화관 목록 조회
    public List<TheaterDTO> getTheatersByRegion(Long regionId) {
        return theaterRepository.findByRegionId(regionId).stream()
                .map(TheaterDTO::from)
                .toList();
    }

    // 3. 모든 영화 목록 조회
    public List<MovieDTO> getAllMovies() {

        List<MovieStatus> visibleStatuses = List.of(MovieStatus.SCREENING, MovieStatus.UPCOMING);

        return movieRepository.findAllByStatusIn(visibleStatuses).stream()
                .map(MovieDTO::from)
                .toList();
    }

    // 4. 여러 영화관 ID를 받아 상영 중인 영화 ID 목록 조회
    public List<Long> getAvailableMovieIds(List<Long> theaterIds, LocalDate date, String specialType) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        // "SPECIAL" 신호가 들어오면 2D만 제외하고 모든 영화 ID를 찾음
        if ("SPECIAL".equals(specialType)) {
            return screeningRepository.findAllMovieIdsBySpecialTab(theaterIds, start, end);
        }

        ScreenType type = (specialType != null && !specialType.isEmpty()) ? ScreenType.fromValue(specialType) : null;
        return screeningRepository.findMovieIdsByTheaterIdsAndDate(theaterIds, start, end, type);
    }

    // 5. 여러 영화관 + 여러 영화에 대한 통합 시간표 조회
    public List<ScreeningDTO> getScreeningDetails(List<Long> theaterIds, List<Long> movieIds, LocalDate date, String specialType) {
        if (theaterIds == null || theaterIds.isEmpty()) return Collections.emptyList();

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return screeningRepository.findScreeningsMultiDetail(theaterIds, movieIds, start, end).stream()
                .filter(s -> {
                    if ("SPECIAL".equals(specialType)) {
                        // 1. 스페셜관 탭 모드: 2D가 아닌 모든 상영 정보를 포함
                        return !s.getScreen().getScreenType().equals(ScreenType._2D);
                    } else if (specialType != null && !specialType.isEmpty()) {
                        // 2. 특정 타입이 지정된 경우 (혹시 필요한 경우를 대비)
                        return s.getScreen().getScreenType().getValue().equals(specialType);
                    }
                    // 3. 전체 탭 모드: 모든 상영 정보 포함
                    return true;
                })
                .map(s -> {
                    int availableCount = (int) screeningSeatRepository.countByScreeningIdAndStatus(s.getId(), com.cinema.kino.entity.enums.SeatStatus.AVAILABLE);

                    ScreeningDTO dto = ScreeningDTO.from(s);
                    dto.setAvailableSeats(availableCount);
                    return dto;
                })
                .toList();
    }

    public List<Long> getAvailableTheaterIds(List<Long> movieIds, LocalDate date) {
        if (movieIds == null || movieIds.isEmpty()) return Collections.emptyList();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return screeningRepository.findTheaterIdsByMovieIdsAndDate(movieIds, start, end);
    }

    public List<TheaterDTO> getFilteredTheaters(Long regionId, String specialType) {
        if (specialType != null && !specialType.isEmpty()) {
            // String으로 들어온 값을 ScreenType 이넘(Enum)으로 변환해서 조회
            ScreenType type = ScreenType.fromValue(specialType);
            return theaterRepository.findAllByScreenType(type).stream()
                    .map(TheaterDTO::from)
                    .collect(Collectors.toList());
        } else if (regionId != null) {
            return getTheatersByRegion(regionId);
        }
        return Collections.emptyList();
    }

    private final ScreeningSeatRepository screeningSeatRepository;

    public List<SeatResponseDTO> getScreeningSeats(Long screeningId) {
        return screeningSeatRepository.findAllByScreeningIdWithSeat(screeningId).stream()
                .map(SeatResponseDTO::from)
                .collect(Collectors.toList());
    }

}