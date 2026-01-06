package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screening_seats",
        uniqueConstraints = {
        @UniqueConstraint(name = "uk_screening_seat", columnNames = {"screening_id", "seat_id"})
})
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScreeningSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "held_by_member_id")
    private Member heldByMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "held_by_guest_id")
    private Guest heldByGuest;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;
}