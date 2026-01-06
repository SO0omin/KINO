package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.Rating;
import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Rating rating;

    private String posterUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String director;
    private String actor;
}