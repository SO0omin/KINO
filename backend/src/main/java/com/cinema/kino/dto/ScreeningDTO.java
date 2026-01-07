package com.cinema.kino.dto;

import com.cinema.kino.entity.Screening;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ScreeningDTO {
    private Long id;
    private String screenName;
    private String startTime;
    private Integer totalSeats;

    public static ScreeningDTO from(Screening screening) {
        return ScreeningDTO.builder()
                .id(screening.getId())
                .screenName(screening.getScreen().getName())
                .totalSeats(screening.getScreen().getTotalSeats())
                .startTime(screening.getStartTime().toLocalTime().toString())
                .build();
    }
}