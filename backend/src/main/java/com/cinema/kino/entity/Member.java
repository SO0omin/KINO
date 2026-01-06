package com.cinema.kino.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String username;
    private String password;
    private String name;

    private LocalDate birthDate;

    private String uuid;
    private String tel;
    private String email;

    private String profileImage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}