package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.PriceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReservationTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 💡 어떤 예약에 속해 있는지 (연관관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    // 💡 어떤 좌석인지
    private Long seatId;

    // 💡 어떤 요금 타입인지 (ADULT, YOUTH 등)
    @Enumerated(EnumType.STRING)
    private PriceType priceType;

    @Column(unique = true, nullable = false)
    private String ticketCode;

    // 발급 여부(true면 입장 완료된 티켓)
    @Column(nullable = false)
    private boolean isIssued = false;

    // 발급 시간
    private LocalDateTime issuedAt;

    // 상태를 변경하는 비즈니스 메서드 (Setter 대신 사용)
    public void issueTicket() {
        if (this.isIssued) {
            throw new IllegalStateException("이미 사용된 티켓입니다.");
        }
        this.isIssued = true;
        this.issuedAt = LocalDateTime.now();
    }
}