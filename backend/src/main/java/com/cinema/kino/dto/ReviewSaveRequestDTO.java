package com.cinema.kino.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewSaveRequestDTO {
    private Long movieId;
    private String content;
    private int scoreDirection;
    private int scoreStory;
    private int scoreVisual;
    private int scoreActor;
    private int scoreOst;
}