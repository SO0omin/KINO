package com.cinema.kino.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberLoginResponseDTO {
    private String token;
    private String username;
    private String name;
    private Long memberId;
}