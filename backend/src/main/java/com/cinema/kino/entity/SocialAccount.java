package com.cinema.kino.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_accounts")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 여러 소셜 계정이 하나의 회원(Member)에 속함
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String provider; // 예: KAKAO, GOOGLE, NAVER

    @Column(name = "provider_id", nullable = false)
    private String providerId; // 카카오 등에서 넘어온 고유 ID 넘버
}