package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.PriceType;
import jakarta.persistence.*;
import lombok.*;

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
}