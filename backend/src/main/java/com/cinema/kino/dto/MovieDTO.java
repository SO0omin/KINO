package com.cinema.kino.dto;

import com.cinema.kino.entity.Movie;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MovieDTO {
    private Long id;
    private String title;
    private String ageRating; // Enum을 문자열로 변환
    private Integer durationMin;
    private String posterUrl;

    public static MovieDTO from(Movie movie) {
        return MovieDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .ageRating(movie.getAgeRating().name()) // Enum -> String
                .durationMin(movie.getDurationMin())
                .posterUrl(movie.getPosterUrl())
                .build();
    }
}
