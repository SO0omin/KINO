package com.cinema.kino.service;

import com.cinema.kino.dto.TheaterResponseDTO.RegionDTO;
import com.cinema.kino.dto.TheaterResponseDTO.TheaterDTO;
import com.cinema.kino.repository.RegionRepository;
import com.cinema.kino.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TheaterService {

    private final RegionRepository regionRepository;
    private final TheaterRepository theaterRepository;

    /**
     * 전체 지역 목록 조회
     */
    public List<RegionDTO> getAllRegions() {
        return regionRepository.findAllOrderByTheaterCountDesc().stream()
                .map(region -> RegionDTO.builder()
                        .id(region.getId())
                        .name(region.getName())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 전체 극장 목록 조회
     */
    public List<TheaterDTO> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(theater -> TheaterDTO.builder()
                        .id(theater.getId())
                        .name(theater.getName())
                        .regionId(theater.getRegion().getId())
                        .address(theater.getAddress())
                        .build())
                .collect(Collectors.toList());
    }
}
