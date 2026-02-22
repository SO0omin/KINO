package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    // 스키마 준수: 실결제 금액만 저장
    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @Column(name = "total_num", nullable = false)
    private Integer totalNum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    // 토스 결제 식별용 (스키마에는 없으나 비즈니스 식별을 위해 필요하다면 유지,
    // 만약 엄격히 스키마만 따른다면 merchant_uid로 대체 가능하나 편의상 유지)
    @Column(name = "order_id", unique = true)
    private String orderId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}