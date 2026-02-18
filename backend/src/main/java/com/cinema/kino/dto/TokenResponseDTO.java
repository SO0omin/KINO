package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponseDTO {
    private String token; // 발급된 JWT 토큰
    private String username; // 환영 메시지용 아이디
}