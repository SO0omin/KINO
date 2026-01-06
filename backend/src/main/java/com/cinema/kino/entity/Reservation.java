package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne
    @JoinColumn(name = "screening_id")
    private Screening screening;

    private String guestName;
    private String guestTel;

    private int totalPrice;
    private int totalNum;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}
