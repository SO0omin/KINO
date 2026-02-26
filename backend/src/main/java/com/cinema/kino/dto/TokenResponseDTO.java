package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponseDTO {
    private String token; // 발급된 JWT 토큰
    private Long memberId;
    private String username;
    private String name;
}