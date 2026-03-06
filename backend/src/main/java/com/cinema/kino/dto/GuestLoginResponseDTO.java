package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestLoginResponseDTO {
    private String token;
    private Long guestId;
    private String name;
}
