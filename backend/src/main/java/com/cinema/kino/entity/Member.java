package com.cinema.kino.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.SQLRestriction;

@Entity
@SQLRestriction("is_deleted = false")
@Table(name = "members")
@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(nullable = false, unique = true, length = 64)
    private String uuid;

    @Column(length = 20)
    private String tel;

    @Column(unique = true, length = 100)
    private String email;

    @Builder.Default
    @Column(name = "profile_image", columnDefinition = "LONGTEXT") // longtext 대응
    private String profileImage = "default";

    @Column(name = "point_password", length = 100)
    private String pointPassword;

    @Column(name = "point_password_updated_at")
    private LocalDateTime pointPasswordUpdatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;

    public Member(Long id){
        this.id = id;
    }

    public void withdrawMember() {
        // 1. 아이디 식별 불가능하게 변경 (중복 방지를 위해 UUID 조합)
        this.username = "withdrawn_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        this.password = "";
        this.name = "탈퇴회원";

        // 2. 유니크 제약 조건 충돌 방지를 위해 null 처리 💡
        this.email = null;
        this.tel = null;
        this.uuid = "withdrawn_" + java.util.UUID.randomUUID().toString(); // UUID도 유니크하므로 변경

        this.profileImage = "default";
        this.pointPassword = null;

        // 3. 삭제 상태 변경
        this.isDeleted = true;
    }
}
