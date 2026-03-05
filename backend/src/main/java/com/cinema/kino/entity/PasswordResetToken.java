package com.cinema.kino.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // 💡 메일로 보낼 길고 복잡한 UUID

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member; // 💡 누구의 비밀번호를 바꿀 것인가?

    @Column(nullable = false)
    private LocalDateTime expiryDate; // 💡 언제 만료되는가?
}