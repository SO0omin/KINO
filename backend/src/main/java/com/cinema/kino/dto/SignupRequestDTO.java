package com.cinema.kino.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class SignupRequestDTO {
    private String username;
    private String password;
    private String name;
    private LocalDate birth_date; // LocalDate로 변환할 수도 있지만, 우선 String으로 받습니다.
    private String tel;
    private String email;
}