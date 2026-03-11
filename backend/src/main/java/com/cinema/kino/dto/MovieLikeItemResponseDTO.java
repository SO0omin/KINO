package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieLikeItemResponseDTO {
    private Long movieId;
    private String title;
    private String posterUrl;
    private String ageRating;
    private BigDecimal bookingRate;
    private String releaseDate;
    private Double userScore;
}

