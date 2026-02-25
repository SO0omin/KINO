package com.cinema.kino.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponseDTO {

    private Long id;
    private String title;
    private String posterUrl;
    private String description;
    private String releaseDate;  // 프론트에서 편하게 쓰도록 String으로 변환해서 줍니다.
    private BigDecimal bookingRate; // 예매율
    private String ageRating;    // 관람등급 (ALL, 12, 15, 18)

    private long likeCount;
    private boolean isLiked;

}