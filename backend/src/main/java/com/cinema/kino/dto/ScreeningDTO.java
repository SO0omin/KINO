package com.cinema.kino.dto;

import com.cinema.kino.entity.Screening;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Builder @Setter
public class ScreeningDTO {
    private Long id;
    private String theaterName;
    private String screenName;
    private String screenType;
    private String movieTitle;
    private String ageRating;
    private String startTime;
    private Integer availableSeats;
    private Integer totalSeats;

    public static ScreeningDTO from(Screening screening) {
        return ScreeningDTO.builder()
                .id(screening.getId())
                .theaterName(screening.getScreen().getTheater().getName())
                .screenName(screening.getScreen().getName())
                .screenType(screening.getScreen().getScreenType().getValue())
                .movieTitle(screening.getMovie().getTitle())
                .ageRating(screening.getMovie().getAgeRating().getValue())
                .totalSeats(screening.getScreen().getTotalSeats())
                .availableSeats(screening.getScreen().getTotalSeats())
                .startTime(screening.getStartTime().toString())
                .build();
    }
}