package com.cinema.kino.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "membership_cards",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_membership_card_number", columnNames = {"card_number"})
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MembershipCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "card_number", nullable = false, length = 32)
    private String cardNumber;

    @Column(name = "card_name", nullable = false, length = 100)
    private String cardName;

    @Column(name = "issuer_name", nullable = false, length = 100)
    private String issuerName;

    @Column(name = "channel_name", nullable = false, length = 30)
    private String channelName;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
