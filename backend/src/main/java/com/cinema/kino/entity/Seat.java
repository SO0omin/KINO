package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.SeatType;
import jakarta.persistence.*;

@Entity
@Table(
        name = "seats",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {
                        "screen_id", "seat_row", "seat_number", "pos_x", "pos_y"
                })
        }
)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 상영관
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    private Screen screen;

    // A, B, C ...
    @Column(name = "seat_row", nullable = false)
    private String seatRow;

    // 1, 2, 3 ...
    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    // NORMAL / VIP / DISABLED
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;

    // 좌석 배치용 X,Y
    @Column(name = "pos_x", nullable = false)
    private Integer posX;

    @Column(name = "pos_y", nullable = false)
    private Integer posY;
}