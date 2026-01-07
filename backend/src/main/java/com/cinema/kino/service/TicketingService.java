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
import java.util.Collections;
import java.util.List;

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

    // 4. 여러 영화관 ID를 받아 상영 중인 영화 ID 목록 조회
    public List<Long> getAvailableMovieIds(List<Long> theaterIds, LocalDate date) {
        if (theaterIds == null || theaterIds.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        // 리포지토리의 바뀐 메소드명 호출 (theaterIds 리스트 전달)
        return screeningRepository.findMovieIdsByTheaterIdsAndDate(theaterIds, start, end);
    }

    // 5. 여러 영화관 + 여러 영화에 대한 통합 시간표 조회
    public List<ScreeningDTO> getScreeningDetails(List<Long> theaterIds, List<Long> movieIds, LocalDate date) {
        if (theaterIds == null || theaterIds.isEmpty() || movieIds == null || movieIds.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        // 리포지토리의 바뀐 메소드명 호출 (theaterIds, movieIds 리스트 전달)
        return screeningRepository.findScreeningsMultiDetail(theaterIds, movieIds, start, end)
                .stream()
                .map(ScreeningDTO::from)
                .toList();
    }
}