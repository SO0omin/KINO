package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KakaoLoginResponseDTO {
    @JsonProperty("isRegistered")
    private boolean isRegistered; // 가입 여부 (true: 이미 가입됨, false: 신규)
    private String token;         // 로그인 토큰 (isRegistered가 true일 때만 있음)

    // 아래는 신규 유저일 경우 폼에 뿌려줄 데이터
    private String username;
    private String name;
    private Long memberId;
    private String provider;
    private String providerId;
    private String profileImage;
}