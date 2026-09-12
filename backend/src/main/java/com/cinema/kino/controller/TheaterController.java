package com.cinema.kino.controller;

import com.cinema.kino.dto.TheaterResponseDTO.RegionDTO;
import com.cinema.kino.dto.TheaterResponseDTO.TheaterDTO;
import com.cinema.kino.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@RequiredArgsConstructor
public class TheaterController {

    private final TheaterService theaterService;

    /**
     * 탭에 표시할 지역 목록 (예: 서울, 경기/인천 등)
     * GET /api/theaters/regions
     */
    @GetMapping("/regions")
    public ResponseEntity<List<RegionDTO>> getRegions() {
        List<RegionDTO> regions = theaterService.getAllRegions();
        return ResponseEntity.ok(regions);
    }

    /**
     * 그리드에 표시할 극장 전체 목록
     * GET /api/theaters
     */
    @GetMapping
    public ResponseEntity<List<TheaterDTO>> getTheaters() {
        List<TheaterDTO> theaters = theaterService.getAllTheaters();
        return ResponseEntity.ok(theaters);
    }
}