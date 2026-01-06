package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.Rating;
import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private Rating rating;

    private int durationMin;
    private String posterUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String director;
    private String actor;
}