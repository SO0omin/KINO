package com.cinema.kino.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResetPwRequestDTO {
    private String username;
    private String email;
}
