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

/*    한 예매 당 결제 내역이 하나만 존재해서 결제 실패 시 기존 데이터를 지우거나 덮어 결제 성공 이력만 남기겠다면 위처럼
      실제 서비스처럼 결제 시도 이력(실패, 성공)을 모두 남기겠다면 아래처럼
      @ManyToOne(fetch = FetchType.LAZY) // OneToOne에서 ManyToOne으로 변경
      @JoinColumn(name = "reservation_id", nullable = false)
      private Reservation reservation;  */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @Column(name = "merchant_uid", nullable = false, unique = true, length = 100)
    private String merchantUid;

    @Column(name = "imp_uid", unique = true, length = 100)
    private String impUid;

    @Column(name = "original_amount")
    private Integer originalAmount;

    @Builder.Default
    @Column(name = "discount")
    private Integer discount = 0;

    @Builder.Default
    @Column(name = "used_points")
    private Integer usedPoints = 0;

    @Column(name = "final_amount")
    private Integer finalAmount;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    @Column(name = "pg_provider", length = 20)
    private String pgProvider;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.READY;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}