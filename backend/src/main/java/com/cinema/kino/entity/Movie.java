package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.Rating;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private Rating rating;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String director;

    @Column(length = 255)
    private String actor;
}