package com.cinema.kino.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuestLoginRequestDTO {
    private String name;
    private String tel;
    private String password;
}