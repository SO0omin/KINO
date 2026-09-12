package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NaverLoginResponseDTO {

    @JsonProperty("isRegistered")
    private boolean isRegistered;

    private String token;
    private String provider;
    private String providerId;
    private String username;
    private String name;
    private Long memberId;
    private String profileImage;

    // 💡 네이버 연동을 위해 새로 추가된 필드들
    private String tel;

    @JsonProperty("birth_date") // 프론트엔드의 memberData.birth_date 와 맞춤
    private String birthDate;
}