package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.ScreenType;
import jakarta.persistence.*;

@Entity
@Table(name = "screens")
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    private Theater theater;

    @Enumerated(EnumType.STRING)
    private ScreenType screenType;

    private int totalSeats;
    private String name;
}