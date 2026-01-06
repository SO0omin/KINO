package com.cinema.kino.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    private String merchantUid;
    private String impUid;

    private int originalAmount;
    private int discount;
    private int usedPoints;
    private int finalAmount;

    private String paymentMethod;
    private String pgProvider;

    private String paymentStatus;
    private LocalDateTime paidAt;
}