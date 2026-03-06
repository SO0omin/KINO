package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @Column(name = "merchant_uid", nullable = false, unique = true)
    private String merchantUid; // orderId와 매핑

    @Column(name = "imp_uid", unique = true)
    private String impUid; // paymentKey와 매핑

    @Column(name = "original_amount", nullable = false)
    private Integer originalAmount;

    @Column(name = "discount", nullable = false)
    private Integer discount;

    @Column(name = "used_points", nullable = false)
    private Integer usedPoints;

    @Column(name = "final_amount", nullable = false)
    private Integer finalAmount;

    @Column(name = "payment_method", length = 20, nullable = false)
    private String paymentMethod;

    @Column(name = "pg_provider", length = 20)
    private String pgProvider;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
