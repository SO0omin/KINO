package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.MovieStatus;
import com.cinema.kino.entity.enums.Rating; // 기존에 만들어두신 Enum
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "age_rating", nullable = false)
    private Rating ageRating; // ALL, 12, 15, 18

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MovieStatus status = MovieStatus.UPCOMING;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String director;

    @Column(length = 255)
    private String actor;

    @Column(name = "booking_rate", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal bookingRate = BigDecimal.ZERO; // 예매율 (%)

    @Column(name = "cumulative_audience")
    @Builder.Default
    private Long cumulativeAudience = 0L; // 누적 관객수
}