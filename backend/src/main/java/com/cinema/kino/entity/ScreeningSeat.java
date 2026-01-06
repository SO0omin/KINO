package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(
        name = "screening_seats",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"screening_id","seat_id"})
        }
)
public class ScreeningSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "screening_id")
    private Screening screening;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @ManyToOne
    @JoinColumn(name = "held_by_member_id")
    private Member heldBy;

    private LocalDateTime holdExpiresAt;
}
