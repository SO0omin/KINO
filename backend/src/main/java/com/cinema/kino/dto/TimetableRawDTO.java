package com.cinema.kino.dto;

import com.cinema.kino.entity.enums.ScreenType;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class TimetableRawDTO {
    private Long theaterId;
    private String theaterName;
    private Long movieId;
    private String movieTitle;
    private String ageRating;
    private Integer durationMin;
    private Long screeningId;
    private String screenName;
    private ScreenType screenType;
    private Integer totalSeats;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long bookedSeats;

    // ✨ 1. Hibernate가 'int'를 던질 때를 대비한 맞춤형 생성자 (이게 에러 해결의 핵심입니다!)
    public TimetableRawDTO(Long theaterId, String theaterName, Long movieId, String movieTitle, String ageRating,Integer durationMin,
                           Long screeningId, String screenName, ScreenType screenType, Integer totalSeats,
                           LocalDateTime startTime, LocalDateTime endTime, int bookedSeats) {
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.durationMin = durationMin;
        this.ageRating = ageRating;
        this.screeningId = screeningId;
        this.screenName = screenName;
        this.screenType = screenType;
        this.totalSeats = totalSeats;
        this.startTime = startTime;
        this.endTime = endTime;
        this.bookedSeats = (long) bookedSeats; // int를 Long으로 안전하게 변환
    }

    // ✨ 2. 혹시 나중에 정상적으로 'Long'을 던질 때를 대비한 생성자
    public TimetableRawDTO(Long theaterId, String theaterName, Long movieId, String movieTitle, String ageRating,Integer durationMin,
                           Long screeningId, String screenName, ScreenType screenType, Integer totalSeats,
                           LocalDateTime startTime, LocalDateTime endTime, Long bookedSeats) {
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.ageRating = ageRating;
        this.durationMin = durationMin;
        this.screeningId = screeningId;
        this.screenName = screenName;
        this.screenType = screenType;
        this.totalSeats = totalSeats;
        this.startTime = startTime;
        this.endTime = endTime;
        this.bookedSeats = bookedSeats;
    }
}