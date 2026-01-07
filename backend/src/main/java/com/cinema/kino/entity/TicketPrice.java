package com.cinema.kino.entity;

import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.entity.enums.ScreeningType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_prices", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ticket_policy", columnNames = {"screen_type", "price_type", "screening_type"})
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "screen_type", nullable = false)
    private ScreenType screenType;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false)
    private PriceType priceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "screening_type", nullable = false)
    private ScreeningType screeningType;

    @Column(nullable = false)
    private Integer price;
}