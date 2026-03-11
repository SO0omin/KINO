package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResetPwResponseDTO {
    private String username;
    private String tel;
    @JsonProperty("birth_date")
    private String birthDate; // 프론트엔드 변수명과 맞춤
}