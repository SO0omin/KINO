package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.ScreenType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "screens")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "screen_type", nullable = false)
    private ScreenType screenType;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(nullable = false, length = 100)
    private String name;
}