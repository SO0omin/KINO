package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TheaterStatDTO {
    private String regionName;
    private Long theaterCount;
}