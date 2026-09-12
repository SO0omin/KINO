package com.cinema.kino.controller;

import com.cinema.kino.dto.MainPageResponseDTO;
import com.cinema.kino.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MainController {

    private final MainService mainService;


    // 2. 실제 프론트엔드에서 호출할 메인 페이지 데이터 API
    @GetMapping("/api/main")
    public ResponseEntity<MainPageResponseDTO> getMainPageData() {
        return ResponseEntity.ok(mainService.getMainPageData());
    }
}