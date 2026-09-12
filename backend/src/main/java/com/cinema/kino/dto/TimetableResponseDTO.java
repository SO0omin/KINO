// 파일 경로: com/cinema/kino/dto/TimetableResponseDTO.java
package com.cinema.kino.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

public class TimetableResponseDTO {

    @Getter
    @Builder
    public static class ScreeningDetail {
        private Long screeningId;
        private String screenName;
        private String screenType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer totalSeats;
        private Integer remainingSeats;
        private Boolean isMorning;
        private Boolean isNight;
    }

    @Getter
    @Builder
    public static class ResponseByTheater {
        private Long movieId;
        private String movieTitle;
        private String ageRating;
        private Integer durationMin;
        private List<ScreeningDetail> screenings;
    }

    @Getter
    @Builder
    public static class ResponseByMovie {
        private Long theaterId;
        private String theaterName;
        private List<ScreeningDetail> screenings;
    }
}