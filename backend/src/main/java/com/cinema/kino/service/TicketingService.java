package com.cinema.kino.service;

import com.cinema.kino.dto.MovieDTO;
import com.cinema.kino.dto.RegionDTO;
import com.cinema.kino.dto.ScreeningDTO;
import com.cinema.kino.dto.TheaterDTO;
import com.cinema.kino.repository.MovieRepository;
import com.cinema.kino.repository.RegionRepository;
import com.cinema.kino.repository.ScreeningRepository;
import com.cinema.kino.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TicketingService {

    private final RegionRepository regionRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final ScreeningRepository screeningRepository; // 상영 시간표 조회를 위해 추가!

    // 1. 모든 지역 목록 조회
    public List<RegionDTO> getAllRegions() {
        return regionRepository.findAll().stream()
                .map(RegionDTO::from)
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
        return movieRepository.findAll().stream()
                .map(MovieDTO::from)
                .toList();
    }

    // 4. 특정 날짜/영화관에서 상영 중인 영화 ID 목록 조회 (검은색 글씨 활성화용)
    public List<Long> getAvailableMovieIds(Long theaterId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return screeningRepository.findMovieIdsByTheaterAndDate(theaterId, start, end);
    }

    // 5. 최종 선택된 조건에 맞는 상세 상영 시간표 조회
    public List<ScreeningDTO> getScreeningDetails(Long theaterId, Long movieId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return screeningRepository.findScreeningsDetail(theaterId, movieId, start, end)
                .stream()
                .map(ScreeningDTO::from)
                .toList();
    }
}