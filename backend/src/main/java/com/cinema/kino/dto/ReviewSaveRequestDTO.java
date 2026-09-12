package com.cinema.kino.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReviewSaveRequestDTO {
    private Long memberId;
    private Long movieId;
    private String reservationNumber;
    private String content;
    private int scoreDirection;
    private int scoreStory;
    private int scoreVisual;
    private int scoreActor;
    private int scoreOst;
}