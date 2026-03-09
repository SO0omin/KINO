package com.cinema.kino.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", unique = true, nullable = false)
    private Reservation reservation;

    @Builder.Default
    @Column(name = "score_direction")
    private Integer scoreDirection = 0; // 연출 (1~10)

    @Builder.Default
    @Column(name = "score_story")
    private Integer scoreStory = 0; // 스토리 (1~10)

    @Builder.Default
    @Column(name = "score_visual")
    private Integer scoreVisual = 0; // 영상미 (1~10)

    @Builder.Default
    @Column(name = "score_actor")
    private Integer scoreActor = 0; // 배우 (1~10)

    @Builder.Default
    @Column(name = "score_ost")
    private Integer scoreOst = 0; // OST (1~10)

    @Column(columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}