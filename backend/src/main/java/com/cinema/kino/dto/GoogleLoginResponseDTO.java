package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GoogleLoginResponseDTO {
    @JsonProperty("isRegistered")
    private boolean isRegistered;

    private String token;
    private String provider;
    private String username;
    private String name;
    private Long memberId;
    private String providerId;
    private String profileImage;
    private String email;
}